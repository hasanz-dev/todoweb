import React from 'react';
import './TaskItem.css';

const TaskItem = ({ task, isDragging, onToggleComplete, onEdit, onDelete }) => {
  const priorityClass = `priority-${task.priority?.toLowerCase() || 'medium'}`;

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className={`task-item ${isDragging ? 'dragging' : ''} ${task.completed ? 'completed' : ''}`}>
      <div className="task-drag-handle">
        <span>⋮⋮</span>
      </div>

      <div className="task-checkbox">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={onToggleComplete}
          id={`task-${task.id}`}
        />
        <label htmlFor={`task-${task.id}`}></label>
      </div>

      <div className="task-content" onClick={onEdit}>
        <h3 className="task-title">{task.title}</h3>
        {task.description && (
          <p className="task-description">{task.description}</p>
        )}
        <div className="task-meta">
          <span className={`task-priority ${priorityClass}`}>
            {task.priority}
          </span>
          {task.dueDate && (
            <span className="task-due-date">
              Due: {formatDate(task.dueDate)}
            </span>
          )}
          {task.completed && (
            <span className="task-completed-status">
              Completed on {formatDate(task.updatedAt)}
            </span>
          )}
        </div>
      </div>

      <div className="task-actions">
        <button className="edit-button" onClick={onEdit} title="Edit">
          ✎
        </button>
        <button className="delete-button" onClick={onDelete} title="Delete">
          ✕
        </button>
      </div>
    </div>
  );
};

export default TaskItem;
