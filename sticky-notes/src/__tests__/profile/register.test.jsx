import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import Register from '../../profile/register';

// Mock axios
jest.mock('axios');

// Mock window.location
const mockLocation = {
  href: window.location.href,
  pathname: window.location.pathname,
  assign: jest.fn(),
};
Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
});

// Helper function to render the component with Router
const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('Register Component', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('renders register form correctly', () => {
    renderWithRouter(<Register />);
    
    // Check if the form elements are rendered
    expect(screen.getByText(/create an account/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
    expect(screen.getByText(/already have an account\?/i)).toBeInTheDocument();
    expect(screen.getByText(/login here/i)).toBeInTheDocument();
  });

  test('handles input changes', async () => {
    renderWithRouter(<Register />);
    
    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    
    // Type in the inputs
    await userEvent.type(usernameInput, 'newuser');
    await userEvent.type(passwordInput, 'password123');
    await userEvent.type(confirmPasswordInput, 'password123');
    
    // Check if the inputs have the correct values
    expect(usernameInput.value).toBe('newuser');
    expect(passwordInput.value).toBe('password123');
    expect(confirmPasswordInput.value).toBe('password123');
  });

  test('validates password match', async () => {
    renderWithRouter(<Register />);
    
    // Fill in the form with mismatched passwords
    await userEvent.type(screen.getByLabelText(/username/i), 'newuser');
    await userEvent.type(screen.getByLabelText(/password/i), 'password123');
    await userEvent.type(screen.getByLabelText(/confirm password/i), 'password456');
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /register/i }));
    
    // Check if error message is displayed
    expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    
    // Check that axios.post was not called
    expect(axios.post).not.toHaveBeenCalled();
  });

  test('handles successful registration', async () => {
    // Mock axios.post to return a successful response
    axios.post.mockResolvedValueOnce({
      status: 201,
      data: 'User registered successfully'
    });
    
    renderWithRouter(<Register />);
    
    // Fill in the form
    await userEvent.type(screen.getByLabelText(/username/i), 'newuser');
    await userEvent.type(screen.getByLabelText(/password/i), 'password123');
    await userEvent.type(screen.getByLabelText(/confirm password/i), 'password123');
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /register/i }));
    
    // Wait for the async operations to complete
    await waitFor(() => {
      // Check if axios.post was called with the correct arguments
      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:8081/api/registration/register',
        {
          username: 'newuser',
          password: 'password123',
          roles: 'USER'
        }
      );
      
      // Check if success message is displayed
      expect(screen.getByText(/registration successful/i)).toBeInTheDocument();
    });
    
    // Fast-forward timers to trigger the redirect
    jest.advanceTimersByTime(2000);
    
    // Check if redirection would have happened
    expect(window.location.href).toBe('/login');
  });

  test('handles registration failure due to existing username', async () => {
    // Mock axios.post to return an error for existing username
    axios.post.mockRejectedValueOnce({
      response: {
        status: 400,
        data: 'Username already taken'
      }
    });
    
    renderWithRouter(<Register />);
    
    // Fill in the form
    await userEvent.type(screen.getByLabelText(/username/i), 'existinguser');
    await userEvent.type(screen.getByLabelText(/password/i), 'password123');
    await userEvent.type(screen.getByLabelText(/confirm password/i), 'password123');
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /register/i }));
    
    // Wait for the async operations to complete
    await waitFor(() => {
      // Check if error message is displayed
      expect(screen.getByText(/username already taken/i)).toBeInTheDocument();
    });
  });

  test('handles network error during registration', async () => {
    // Mock axios.post to simulate a network error
    axios.post.mockRejectedValueOnce({
      request: {},
      message: 'Network Error'
    });
    
    renderWithRouter(<Register />);
    
    // Fill in the form
    await userEvent.type(screen.getByLabelText(/username/i), 'newuser');
    await userEvent.type(screen.getByLabelText(/password/i), 'password123');
    await userEvent.type(screen.getByLabelText(/confirm password/i), 'password123');
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /register/i }));
    
    // Wait for the async operations to complete
    await waitFor(() => {
      // Check if error message is displayed
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
    });
  });

  test('navigates to login page when clicking the login link', () => {
    renderWithRouter(<Register />);
    
    const loginLink = screen.getByText(/login here/i);
    expect(loginLink.getAttribute('href')).toBe('/login');
  });
});
