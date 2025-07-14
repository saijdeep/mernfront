import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { BASE_URL } from "../utils/constants";
import axios from "axios";

const ChatList = () => {
  const [loading, setLoading] = useState(true);
  const [recentChats, setRecentChats] = useState([]);
  const [error, setError] = useState("");
  const [connections, setConnections] = useState([]);
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);

  useEffect(() => {
    const fetchConnections = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await axios.get(`${BASE_URL}/user/connections`, {
          withCredentials: true
        });
        setConnections(response.data.data || []);
      } catch (err) {
        setError("Failed to load connections");
      } finally {
        setLoading(false);
      }
    };
    fetchConnections();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-100 text-red-700 px-6 py-4 rounded-lg shadow">{error}</div>
      </div>
    );
  }

  if (!connections || connections.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white text-gray-700 px-6 py-4 rounded-lg shadow">
          No connections yet. Connect with users to start chatting!
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 flex flex-col items-center">
      <h2 className="text-xl font-bold mb-4" style={{textShadow: '2px 2px 4px #800080'}}>Your Chats</h2>
      <ul className="space-y-6 w-full max-w-2xl">
        {connections.map((user) => (
          <li
            key={user._id}
            className="flex items-center gap-4 p-4 bg-white rounded-2xl shadow-lg hover:bg-indigo-50 cursor-pointer transition-all duration-200 border border-gray-200 w-full max-w-xl mx-auto"
            onClick={() => navigate(`/chat/${user._id}`)}
          >
            <img
              src={user.photoUrl || 'https://via.placeholder.com/56'}
              alt={user.firstName}
              className="w-14 h-14 rounded-full object-cover border-2 border-indigo-200 shadow"
            />
            <div className="flex flex-col justify-center">
              <div className="font-semibold text-lg text-gray-800">{user.firstName} {user.lastName}</div>
              <div className="text-xs text-gray-500">{user.branch}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ChatList; 