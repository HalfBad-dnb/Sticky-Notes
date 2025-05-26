import { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "../profile/profile.css";
import { getApiUrl } from "../utils/api";
import { useTheme } from "../context/themeUtils";
import { THEMES } from "../constants/themes";
import BubbleBackgroundTheme from "../components/backgroundstyles/theme/BubleBackgroundTheme";
import HeartBackgroundTheme from "../components/backgroundstyles/theme/HeartBackgroundTheme";
import TriangleBackgroundTheme from "../components/backgroundstyles/theme/TriangleBackgroundTheme";

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

  const { theme } = useTheme();
  const navigate = useNavigate();

  // Redirect to profile if already logged in
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      navigate('/profile');
    }
  }, [navigate]);

  const getBackgroundComponent = () => {
    switch (theme) {
      case THEMES.BUBBLES:
        return <BubbleBackgroundTheme />;
      case THEMES.HEARTS:
        return <HeartBackgroundTheme />;
      case THEMES.TRIANGLES:
      default:
        return <TriangleBackgroundTheme />;
    }
  };

  const getOverlayStyle = () => {
    switch (theme) {
      case THEMES.BUBBLES:
        return { backgroundColor: 'rgba(15, 15, 20, 0.7)' };
      case THEMES.HEARTS:
        return { backgroundColor: 'rgba(10, 10, 10, 0.3)' };
      case THEMES.TRIANGLES:
      default:
        return { backgroundColor: 'rgba(10, 10, 15, 0.6)' };
    }
  };

  return (
    <div className="login-page">
      {getBackgroundComponent()}
      <div className="login-overlay" style={getOverlayStyle()}></div>
      <div className="login-wrapper">
        <div className="login-container">
          <h2>Welcome Back</h2>
          {message && (
            <div className={`message ${message.includes('success') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className="form-input"
                placeholder="Enter your username"
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="form-input"
                placeholder="••••••••"
              />
            </div>
            <button type="submit" disabled={loading} className="primary-button">
              {loading ? (
                <span className="button-loading">Logging in...</span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
          <p className="auth-link">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="auth-link-text">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
