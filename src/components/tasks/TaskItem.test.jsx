import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TaskItem from './TaskItem';

describe('TaskItem', () => {
  const mockTask = {
    id: 1,
    title: 'Test Task',
    description: 'Test Description',
    priority: 'HIGH',
    completed: false,
    dueDate: '2025-12-31',
  };

  const mockHandlers = {
    onToggleComplete: jest.fn(),
    onEdit: jest.fn(),
    onDelete: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders task title and description', () => {
    render(<TaskItem task={mockTask} {...mockHandlers} />);

    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('renders priority badge', () => {
    render(<TaskItem task={mockTask} {...mockHandlers} />);

    expect(screen.getByText('HIGH')).toBeInTheDocument();
  });

  it('renders due date when provided', () => {
    render(<TaskItem task={mockTask} {...mockHandlers} />);

    expect(screen.getByText(/Due:/)).toBeInTheDocument();
  });

  it('does not render description when not provided', () => {
    const taskWithoutDescription = { ...mockTask, description: null };
    render(<TaskItem task={taskWithoutDescription} {...mockHandlers} />);

    expect(screen.queryByText('Test Description')).not.toBeInTheDocument();
  });

  it('calls onToggleComplete when checkbox is clicked', () => {
    render(<TaskItem task={mockTask} {...mockHandlers} />);

    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    expect(mockHandlers.onToggleComplete).toHaveBeenCalledTimes(1);
  });

  it('calls onEdit when edit button is clicked', () => {
    render(<TaskItem task={mockTask} {...mockHandlers} />);

    const editButton = screen.getByTitle('Edit');
    fireEvent.click(editButton);

    expect(mockHandlers.onEdit).toHaveBeenCalledTimes(1);
  });

  it('calls onDelete when delete button is clicked', () => {
    render(<TaskItem task={mockTask} {...mockHandlers} />);

    const deleteButton = screen.getByTitle('Delete');
    fireEvent.click(deleteButton);

    expect(mockHandlers.onDelete).toHaveBeenCalledTimes(1);
  });

  it('applies completed class when task is completed', () => {
    const completedTask = { ...mockTask, completed: true };
    const { container } = render(<TaskItem task={completedTask} {...mockHandlers} />);

    expect(container.firstChild).toHaveClass('completed');
  });

  it('applies dragging class when isDragging is true', () => {
    const { container } = render(<TaskItem task={mockTask} isDragging={true} {...mockHandlers} />);

    expect(container.firstChild).toHaveClass('dragging');
  });

  it('checkbox reflects completed state', () => {
    const completedTask = { ...mockTask, completed: true };
    render(<TaskItem task={completedTask} {...mockHandlers} />);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();
  });

  it('handles missing priority gracefully', () => {
    const taskWithoutPriority = { ...mockTask, priority: null };
    render(<TaskItem task={taskWithoutPriority} {...mockHandlers} />);

    // Should render without crashing
    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });
});
