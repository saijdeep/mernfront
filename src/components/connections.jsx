import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addConnections } from "../utils/connectionSlice";
import { BASE_URL } from "../utils/constants";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Connections = () => {
  const connections = useSelector((state) => state.connections) || [];
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchConnections = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await axios.get(`${BASE_URL}/user/connections`, {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        }
      });

      console.log("Connections response:", response.data);

      if (response.data && response.data.success) {
        dispatch(addConnections(response.data.data || []));
      } else {
        setError("No connections found. Connect with other users to see them here!");
      }
    } catch (err) {
      console.error("Error fetching connections:", err);
      if (err.response?.status === 404) {
        setError("No connections found. Connect with other users to see them here!");
      } else {
        setError(err.response?.data?.message || err.message || "Failed to fetch connections");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-indigo-900 mb-6" style={{textShadow: '2px 2px 4px #800080'}}>Your Connections</h1>
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-indigo-900 mb-6" style={{textShadow: '2px 2px 4px #800080'}}>Your Connections</h1>
          <div className="text-center text-gray-600 mb-6 p-6 bg-white rounded-lg shadow-md">
            <p className="mb-4">{error}</p>
            <div className="flex justify-center gap-4">
              <button 
                onClick={fetchConnections}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Retry
              </button>
              <a 
                href="/feed" 
                className="px-6 py-2 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
              >
                Find Users
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!connections || connections.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-indigo-900 mb-6" style={{textShadow: '2px 2px 4px #800080'}}>Your Connections</h1>
          <div className="text-center p-8 bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">No Connections Yet</h2>
            <p className="text-gray-600 mb-6">Start connecting with other users to build your network!</p>
            <a 
              href="/feed" 
              className="inline-block px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Explore Users
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-indigo-900 mb-6" style={{textShadow: '2px 2px 4px #800080'}}>Your Connections</h1>
        <div className="space-y-4">
          {connections.map((connection) => {
            const { _id, firstName, lastName, photoUrl, age, gender, about, branch, year } = connection;
            
            return (
              <div key={_id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center">
                  <div className="flex-shrink-0"> 
                    <img
                      alt={`${firstName}'s photo`}
                      className="w-16 h-16 rounded-full object-cover"
                      src={photoUrl || "https://via.placeholder.com/100"}
                    />
                  </div>
                  <div className="ml-4 flex-grow">
                    <h2 className="text-xl font-semibold text-gray-800">
                      {firstName} {lastName}
                    </h2>
                    <div className="text-sm text-gray-600 mt-1">
                      {branch && <span className="mr-3">{branch}</span>}
                      {year && <span>{year} Year</span>}
                    </div>
                    {age && gender && (
                      <p className="text-gray-600 text-sm mt-1">
                        {age} years old • {gender}
                      </p>
                    )}
                    {about && <p className="text-gray-500 mt-2 text-sm">{about}</p>}
                  </div>
                  <div className="ml-4 flex flex-col gap-2">
                    <button
                      onClick={() => navigate(`/chat/${_id}`)}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      Message
                    </button>
                    <button
                      onClick={() => navigate(`/profile/${_id}`)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      View Profile
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Connections;