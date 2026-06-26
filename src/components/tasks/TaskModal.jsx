import React, { useState, useEffect } from 'react';
import { createTask, updateTask } from '../../api/taskApi';
import { toast } from 'react-toastify';
import './TaskModal.css';

const TaskModal = ({ task, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    dueDate: '',
    completed: false
  });
  const [loading, setLoading] = useState(false);
  const [dateError, setDateError] = useState('');

  // Get today's date in YYYY-MM-DD format for validation
  const getTodayString = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || 'MEDIUM',
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
        completed: task.completed || false
      });
    }
  }, [task]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Validate due date is not in the past
    if (name === 'dueDate' && value) {
      if (value < getTodayString()) {
        setDateError('Due date cannot be in the past');
      } else {
        setDateError('');
      }
    }

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }

    // Prevent submission if due date is in the past
    if (formData.dueDate && formData.dueDate < getTodayString()) {
      toast.error('Due date cannot be in the past');
      return;
    }

    setLoading(true);

    try {
      const taskData = {
        ...formData,
        dueDate: formData.dueDate ? `${formData.dueDate}T00:00:00` : null
      };

      if (task) {
        await updateTask(task.id, taskData);
        toast.success('Task updated');
      } else {
        await createTask(taskData);
        toast.success('Task created');
      }
      onSave();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{task ? 'Edit Task' : 'Create Task'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter task title"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter task description"
              rows="3"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="priority">Priority</label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="dueDate">Due Date</label>
              <input
                id="dueDate"
                name="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={handleChange}
                min={getTodayString()}
                className={dateError ? 'input-error' : ''}
              />
              {dateError && <span className="error-message">{dateError}</span>}
            </div>
          </div>

          {task && (
            <div className="form-group checkbox-group">
              <input
                id="completed"
                name="completed"
                type="checkbox"
                checked={formData.completed}
                onChange={handleChange}
              />
              <label htmlFor="completed">Mark as completed</label>
            </div>
          )}

          <div className="modal-actions">
            <button type="button" className="cancel-button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="save-button" disabled={loading}>
              {loading ? 'Saving...' : (task ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
