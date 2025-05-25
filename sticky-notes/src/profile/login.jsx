import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "../profile/profile.css";
import { getApiUrl } from "../utils/api";



const Login = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(""); // Clear previous messages

    try {
      const url = getApiUrl("auth/login");
      console.log('Attempting login at:', url);
      
      // For local development, we'll send the credentials in the request body
      // For production, we'll use Basic Auth
      const isLocal = url.includes('localhost');
      
      let response;
      if (isLocal) {
        // Local development - send credentials in request body
        response = await axios.post(url, {
          username: formData.username,
          password: formData.password
        }, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
      } else {
        // Production - use Basic Auth
        const token = btoa(`${formData.username}:${formData.password}`);
        response = await axios.post(url, {}, {
          headers: {
            'Authorization': `Basic ${token}`,
            'Content-Type': 'application/json'
          }
        });
      }
      
      console.log('Login response:', response.data);
      
      if (response.status === 200) {
        console.log('Login successful, response:', response.data);
        
        // Extract token and user data from response
        const { token, username, email, role } = response.data;
        
        if (!token) {
          throw new Error('No token received from server');
        }
        
        // Store token and user data
        localStorage.setItem("authToken", token);
        localStorage.setItem("username", username || formData.username);
        
        // Create a user object and store in sessionStorage
        const userData = {
          username: username || formData.username,
          email: email || `${formData.username}@example.com`,
          role: role || "USER"
        };
        
        console.log('Storing user data in session storage:', userData);
        sessionStorage.setItem("user", JSON.stringify(userData));
        
        setMessage("Login successful! Redirecting...");
        setFormData({ username: "", password: "" });

        // Redirect to profile page after successful login
        window.location.href = "/profile";
      } else {
        setMessage("Invalid credentials.");
      }
    } catch (error) {
      console.error("Error during login:", error);
      if (error.response) {
        // Server returned an error
        setMessage(error.response?.data || "Login failed. Please try again.");
      } else if (error.request) {
        // Network error or no response from the server
        setMessage("Network error. Please check your connection and try again.");
      } else {
        // Something else went wrong
        setMessage("Login failed. Please try again.");
      }
    } finally {
      setLoading(false); // Disable loading spinner after process finishes
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-container">
        <h2>Login to Sticky Notes</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username:</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              placeholder="Enter your username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {message && <p className={`message ${message.includes("successful") ? "success-message" : "error-message"}`}>{message}</p>}
        
        <div className="auth-links">
          <span>Don&apos;t have an account? </span>
          <Link to="/register" className="auth-link">Register</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
