import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import UserCard from "./UserCard";
import { BASE_URL } from "../utils/constants";
import axios from "axios";

const Feed = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");
  const currentUser = useSelector((state) => state.user);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");
      console.log("Fetching users...");
      const response = await axios.get(`${BASE_URL}/user/feed`, {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        }
      });
      
      console.log("Users data:", response.data);
      
      if (response.data && response.data.data) {
        setUsers(response.data.data || []);
        if (response.data.data.length === 0) {
          setError("No other users found in the database");
        }
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setError(error.response?.data?.message || error.message || "Failed to fetch users. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (userId) => {
    try {
      setError("");
      const response = await axios.post(`${BASE_URL}/request/send/connect/${userId}`, {}, {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        }
      });

      if (response.data.success) {
        setUsers(prevUsers => prevUsers.filter(user => user._id !== userId));
      } else {
        if ((response.data.error || "").includes("Already Exists")) {
          setUsers(prevUsers => prevUsers.filter(user => user._id !== userId));
        } else {
          throw new Error(response.data.error || "Failed to connect with user");
        }
      }
    } catch (error) {
      if ((error.response?.data?.error || "").includes("Already Exists")) {
        setUsers(prevUsers => prevUsers.filter(user => user._id !== userId));
      } else {
        setError(error.response?.data?.message || error.message || "Failed to connect with user. Please try again.");
      }
    }
  };

  const handleIgnore = async (userId) => {
    // Remove user from UI immediately
    setUsers(prevUsers => prevUsers.filter(user => user._id !== userId));
    try {
      setError("");
      await axios.post(`${BASE_URL}/request/send/ignore/${userId}`, {}, {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        }
      });
      // No need to remove user here, already done above
    } catch (error) {
      console.error("Error ignoring user:", error);
      // Optionally log or handle error silently
    }
  };

  const filteredUsers = users.filter(user => 
    user?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user?.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user?.branch?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Discover Users</h1>
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-purple-800 mb-6" style={{textShadow: '2px 2px 4px #800080'}}>Discover Users</h1>
        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search users by name or branch..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="space-y-6">
          {filteredUsers.length === 0 && !error ? (
            <div className="text-center text-gray-500 py-8 bg-white rounded-lg shadow-md">
              <p className="mb-2">No users found matching your search criteria</p>
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")}
                  className="text-indigo-600 hover:text-indigo-700"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            filteredUsers.map((user) => (
              <UserCard
                key={user._id}
                user={user}
                onConnect={handleConnect}
                onIgnore={handleIgnore}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Feed;
