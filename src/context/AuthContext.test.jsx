import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';

// Test component that uses the auth context
const TestComponent = () => {
  const { user, token, loginUser, logoutUser, isAuthenticated } = useAuth();

  return (
    <div>
      <span data-testid="user">{user?.name || 'No user'}</span>
      <span data-testid="token">{token || 'No token'}</span>
      <span data-testid="authenticated">{isAuthenticated() ? 'Yes' : 'No'}</span>
      <button
        data-testid="login-btn"
        onClick={() => loginUser({ name: 'Test User' }, 'test-token')}
      >
        Login
      </button>
      <button data-testid="logout-btn" onClick={logoutUser}>
        Logout
      </button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  it('provides initial unauthenticated state', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('user')).toHaveTextContent('No user');
  });

  it('loginUser sets user and token', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    act(() => {
      fireEvent.click(screen.getByTestId('login-btn'));
    });

    expect(screen.getByTestId('user')).toHaveTextContent('Test User');
    expect(screen.getByTestId('token')).toHaveTextContent('test-token');
    expect(screen.getByTestId('authenticated')).toHaveTextContent('Yes');
  });

  it('logoutUser clears user and token', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // First login
    act(() => {
      fireEvent.click(screen.getByTestId('login-btn'));
    });

    // Then logout
    act(() => {
      fireEvent.click(screen.getByTestId('logout-btn'));
    });

    expect(screen.getByTestId('user')).toHaveTextContent('No user');
    expect(screen.getByTestId('token')).toHaveTextContent('No token');
    expect(screen.getByTestId('authenticated')).toHaveTextContent('No');
  });

  it('isAuthenticated returns true when logged in', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    act(() => {
      fireEvent.click(screen.getByTestId('login-btn'));
    });

    expect(screen.getByTestId('authenticated')).toHaveTextContent('Yes');
  });
});
