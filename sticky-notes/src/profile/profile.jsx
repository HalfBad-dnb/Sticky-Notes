import { useState, useEffect } from "react";
import axios from "axios";
import "../profile/profile.css";
import ProfileBoard from "../components/ProfileBoard";
import { Link } from "react-router-dom";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      setError("Unauthorized. Please log in.");
      setLoading(false);
      return;
    }

    axios
      .get("http://localhost:8082/api/profile")
      .then((response) => {
        setUser(response.data);
      })
      .catch(() => {
        setError("Failed to fetch profile data.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    window.location.href = "/login"; // Redirect to login page
  };

  if (loading) return <p>Loading profile...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="app-container">
      <div className="navbar">
        <div className="nav-content">
          <div className="nav-center">
            <div className="user-info-inline">
              <span className="user-name">Welcome, {user.username || "User"}!</span>
              <span className="user-email">{user.email || ""}</span>
              <span className="notes-count">Notes: {user.notesCount || "0"}</span>
            </div>
            
            <div className="nav-buttons">
              <Link to="/" className="home-square-button" title="Back to Main Board">🏠 Main Board</Link>
              <button onClick={handleLogout} className="logout-button">Logout</button>
            </div>
          </div>
        </div>
      </div>
      <div className="main-content">
        <div className="profile-header">
          <h2 className="profile-title">My Personal Board</h2>
          <p className="profile-subtitle">This is your private space. Notes you create here can be set as private or public.</p>
        </div>
        <ProfileBoard username={user.username} />
      </div>
    </div>
  );
};

export default Profile;
