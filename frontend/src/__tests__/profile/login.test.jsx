import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import Login from '../../profile/login';

// Mock axios
jest.mock('axios');

// Mock localStorage
const localStorageMock = (function() {
  let store = {};
  return {
    getItem: jest.fn(key => store[key]),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    removeItem: jest.fn(key => {
      delete store[key];
    })
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Helper function to render the component with Router
const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('Login Component', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    localStorage.clear();
  });

  test('renders login form correctly', () => {
    renderWithRouter(<Login />);
    
    // Check if the form elements are rendered
    expect(screen.getByText(/login to your account/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    expect(screen.getByText(/don't have an account\?/i)).toBeInTheDocument();
    expect(screen.getByText(/register here/i)).toBeInTheDocument();
  });

  test('handles input changes', async () => {
    renderWithRouter(<Login />);
    
    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);
    
    // Type in the inputs
    await userEvent.type(usernameInput, 'testuser');
    await userEvent.type(passwordInput, 'password123');
    
    // Check if the inputs have the correct values
    expect(usernameInput.value).toBe('testuser');
    expect(passwordInput.value).toBe('password123');
  });

  test('handles successful login', async () => {
    // Mock axios.post to return a successful response
    axios.post.mockResolvedValueOnce({
      status: 200,
      data: 'Login successful'
    });
    
    renderWithRouter(<Login />);
    
    // Fill in the form
    await userEvent.type(screen.getByLabelText(/username/i), 'testuser');
    await userEvent.type(screen.getByLabelText(/password/i), 'password123');
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    
    // Wait for the async operations to complete
    await waitFor(() => {
      // Check if axios.post was called with the correct arguments
      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:8081/api/auth/login',
        { username: 'testuser', password: 'password123' }
      );
      
      // Check if localStorage was updated
      expect(localStorage.setItem).toHaveBeenCalledWith('authToken', 'user-authenticated');
      expect(localStorage.setItem).toHaveBeenCalledWith('username', 'testuser');
      
      // Check if success message is displayed
      expect(screen.getByText(/login successful/i)).toBeInTheDocument();
    });
  });

  test('handles login failure', async () => {
    // Mock axios.post to return an error
    axios.post.mockRejectedValueOnce({
      response: {
        status: 401,
        data: 'Invalid username or password'
      }
    });
    
    renderWithRouter(<Login />);
    
    // Fill in the form
    await userEvent.type(screen.getByLabelText(/username/i), 'wronguser');
    await userEvent.type(screen.getByLabelText(/password/i), 'wrongpassword');
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    
    // Wait for the async operations to complete
    await waitFor(() => {
      // Check if axios.post was called with the correct arguments
      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:8081/api/auth/login',
        { username: 'wronguser', password: 'wrongpassword' }
      );
      
      // Check if error message is displayed
      expect(screen.getByText(/invalid username or password/i)).toBeInTheDocument();
      
      // Check that localStorage was not updated
      expect(localStorage.setItem).not.toHaveBeenCalledWith('authToken', expect.anything());
    });
  });

  test('handles network error', async () => {
    // Mock axios.post to simulate a network error
    axios.post.mockRejectedValueOnce({
      request: {},
      message: 'Network Error'
    });
    
    renderWithRouter(<Login />);
    
    // Fill in the form
    await userEvent.type(screen.getByLabelText(/username/i), 'testuser');
    await userEvent.type(screen.getByLabelText(/password/i), 'password123');
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    
    // Wait for the async operations to complete
    await waitFor(() => {
      // Check if error message is displayed
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
    });
  });

  test('navigates to register page when clicking the register link', () => {
    renderWithRouter(<Login />);
    
    const registerLink = screen.getByText(/register here/i);
    expect(registerLink.getAttribute('href')).toBe('/register');
  });
});
