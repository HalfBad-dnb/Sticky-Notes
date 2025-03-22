import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "../profile/profile.css";


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
      const response = await axios.post("http://localhost:8082/api/auth/login", formData);
      
      console.log('Login response:', response.data);
      
      if (response.status === 200) {
        console.log('Login successful, response:', response.data);
        
        // Always use a consistent token format
        // If server doesn't return a token, create a simple one
        const token = response.data.token || 
                     `user-authenticated-${formData.username}-${Date.now()}`;
        
        localStorage.setItem("authToken", token);
        localStorage.setItem("username", formData.username);
        
        // Create a user object and store in sessionStorage
        const userData = {
          username: formData.username,
          email: response.data?.email || "",
          role: response.data?.role || "Standard User"
        };
        
        // Store the user object in sessionStorage
        sessionStorage.setItem("user", JSON.stringify(userData));
        
        setMessage("Login successful!");
        setFormData({ username: "", password: "" }); // Reset form data on successful login

        // Redirect user to profile page after successful login
        setTimeout(() => {
          window.location.href = "/profile"; // Redirect to profile page after successful login
        }, 1500);
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
