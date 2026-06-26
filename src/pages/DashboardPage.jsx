import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useAuth } from '../context/AuthContext';
import { getTasks, createTask, deleteTask, reorderTask, toggleTaskComplete } from '../api/taskApi';
import { toast } from 'react-toastify';
import TaskItem from '../components/tasks/TaskItem';
import TaskModal from '../components/tasks/TaskModal';
import '../styles/Dashboard.css';

const DashboardPage = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();

  const fetchTasks = useCallback(async (search = '') => {
    try {
      const data = await getTasks(search);
      setTasks(data);
    } catch (err) {
      toast.error('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchTasks(searchQuery);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, fetchTasks]);

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const sourceIndex = result.source.index;
    const destIndex = result.destination.index;

    if (sourceIndex === destIndex) return;

    const reorderedTasks = Array.from(tasks);
    const [movedTask] = reorderedTasks.splice(sourceIndex, 1);
    reorderedTasks.splice(destIndex, 0, movedTask);

    setTasks(reorderedTasks);

    try {
      await reorderTask(movedTask.id, destIndex);
    } catch (err) {
      toast.error('Failed to reorder task');
      fetchTasks();
    }
  };

  const handleToggleComplete = async (taskId) => {
    try {
      const updatedTask = await toggleTaskComplete(taskId);
      setTasks(tasks.map(task =>
        task.id === taskId ? updatedTask : task
      ));
      toast.success(updatedTask.completed ? 'Task marked as complete' : 'Task marked as incomplete');
    } catch (err) {
      toast.error('Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    try {
      await deleteTask(taskId);
      setTasks(tasks.filter(task => task.id !== taskId));
      toast.success('Task deleted');
    } catch (err) {
      toast.error('Failed to delete task');
    }
  };

  const handleOpenModal = (task = null) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingTask(null);
    setIsModalOpen(false);
  };

  const handleTaskSaved = () => {
    fetchTasks(searchQuery);
    handleCloseModal();
  };

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
    toast.success('Logged out successfully');
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading tasks...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-left">
          <h1>My Tasks</h1>
          <p>Welcome, {user?.name || 'User'}</p>
        </div>
        <div className="header-right">
          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <div className="dashboard-controls">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
        <button className="add-task-button" onClick={() => handleOpenModal()}>
          + Add Task
        </button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="tasks">
          {(provided) => (
            <div
              className="tasks-container"
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {tasks.length === 0 ? (
                <div className="empty-state">
                  <p>No tasks found</p>
                  <button onClick={() => handleOpenModal()}>Create your first task</button>
                </div>
              ) : (
                tasks.map((task, index) => (
                  <Draggable key={task.id} draggableId={String(task.id)} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <TaskItem
                          task={task}
                          isDragging={snapshot.isDragging}
                          onToggleComplete={() => handleToggleComplete(task.id)}
                          onEdit={() => handleOpenModal(task)}
                          onDelete={() => handleDeleteTask(task.id)}
                        />
                      </div>
                    )}
                  </Draggable>
                ))
              )}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {isModalOpen && (
        <TaskModal
          task={editingTask}
          onClose={handleCloseModal}
          onSave={handleTaskSaved}
        />
      )}
    </div>
  );
};

export default DashboardPage;
