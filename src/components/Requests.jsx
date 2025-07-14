import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addRequests, removeRequest } from "../utils/requestSlice";
import { addConnection } from "../utils/connectionSlice";
import { BASE_URL } from "../utils/constants";
import axios from "axios";

const Requests = () => {
  const requests = useSelector((state) => state.requests) || [];
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await axios.get(`${BASE_URL}/user/requests/received`, {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        }
      });

      console.log("Fetched requests:", response.data);
      
      if (response.data && response.data.data) {
        dispatch(addRequests(response.data.data || []));
      } else {
        console.warn("Unexpected response format:", response.data);
        dispatch(addRequests([]));
      }
    } catch (err) {
      console.error("Error fetching requests:", err);
      setError(err.response?.data?.message || err.message || "Failed to fetch requests");
      dispatch(addRequests([]));
    } finally {
      setLoading(false);
    }
  };

  const handleRequestAction = async (requestId, status) => {
    try {
      setError("");
      const response = await axios.post(
        `${BASE_URL}/request/review/${status}/${requestId}`,
        {},
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          }
        }
      );
      if (response.data.success) {
        dispatch(removeRequest(requestId));
        if (status === "accepted" && response.data.data && response.data.data.fromUserId) {
          // Add the new connection to Redux
          const user = response.data.data.fromUserId;
          dispatch(addConnection(user));
        }
      } else {
        setError(response.data.error || `Failed to ${status} request`);
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || `Failed to ${status} request`);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-indigo-900 mb-6" style={{textShadow: '2px 2px 4px #800080'}}>Connection Requests</h1>
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
          <h1 className="text-2xl font-bold text-indigo-900 mb-6" style={{textShadow: '2px 2px 4px #800080'}}>Connection Requests</h1>
          <div className="text-center text-red-500 mb-6 p-4 bg-red-50 rounded-lg">
            <p className="mb-4">{error}</p>
            <button 
              onClick={fetchRequests}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!requests || requests.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-indigo-900 mb-6" style={{textShadow: '2px 2px 4px #800080'}}>Connection Requests</h1>
          <div className="text-center p-8 bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">No Connection Requests</h2>
            <p className="text-gray-600 mb-6">You don't have any pending connection requests.</p>
            <a 
              href="/feed" 
              className="inline-block px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Find Users
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-indigo-900 mb-6" style={{textShadow: '2px 2px 4px #800080'}}>Connection Requests</h1>
        <div className="space-y-4">
          {requests.map((request) => {
            const fromUser = request.fromUserId;
            if (!fromUser) {
              console.warn("Missing fromUser data:", request);
              return null;
            }

            return (
              <div key={request._id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <img
                      alt={`${fromUser.firstName}'s photo`}
                      className="w-16 h-16 rounded-full object-cover"
                      src={fromUser.photoUrl || "https://via.placeholder.com/100"}
                    />
                  </div>
                  <div className="ml-4 flex-grow">
                    <h2 className="text-xl font-semibold text-gray-800">
                      {fromUser.firstName} {fromUser.lastName}
                    </h2>
                    <div className="text-sm text-gray-600 mt-1">
                      {fromUser.branch && <span className="mr-3">{fromUser.branch}</span>}
                    </div>
                    {fromUser.about && <p className="text-gray-500 mt-2 text-sm">{fromUser.about}</p>}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleRequestAction(request._id, "accepted")}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleRequestAction(request._id, "rejected")}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Reject
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

export default Requests;

