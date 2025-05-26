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

const Register = () => {
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
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Client-side validation
    if (formData.password !== formData.confirmPassword) {
      setMessage("Passwords do not match!");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const url = getApiUrl("registration/register");
      console.log('Making request to:', url);
      
      const response = await axios.post(url, {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        roles: ["USER"] // Changed to array to match backend's expected format
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true // Important for CORS with credentials
      });

      console.log('Registration response:', response);
      
      setMessage("Registration successful! Redirecting to login page...");
      setFormData({ username: "", email: "", password: "", confirmPassword: "" });
      
      // Redirect to login page after successful registration
      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
    } catch (error) {
      console.error("Registration error:", error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers,
          data: error.config?.data
        },
        response: error.response ? {
          status: error.response.status,
          statusText: error.response.statusText,
          headers: error.response.headers,
          data: error.response.data
        } : 'No response received'
      });
      
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        if (error.response.data && error.response.data.message) {
          setMessage(error.response.data.message);
        } else {
          setMessage(`Registration failed: ${error.response.status} - ${error.response.statusText}`);
        }
      } else if (error.request) {
        // The request was made but no response was received
        setMessage(`Network error: ${error.message}. Please check your connection and try again.`);
      } else {
        // Something happened in setting up the request that triggered an Error
        setMessage(`Registration failed: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {getBackgroundComponent()}
      <div className="login-overlay" style={getOverlayStyle()}></div>
      <div className="login-wrapper">
        <div className="login-container">
          <h2>Create Your Account</h2>
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
                placeholder="Choose a username"
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="form-input"
                placeholder="your.email@example.com"
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
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="form-input"
                placeholder="••••••••"
              />
            </div>
            <button type="submit" disabled={loading} className="primary-button">
              {loading ? (
                <span className="button-loading">Creating Account...</span>
              ) : (
                'Sign Up'
              )}
            </button>
          </form>
          <p className="auth-link">
            Already have an account?{' '}
            <Link to="/login" className="auth-link-text">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
