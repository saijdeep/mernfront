import React, { useState } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useDispatch } from "react-redux";
import { removeUserFromFeed } from "../utils/feedSlice";

const DEFAULT_PROFILE_IMAGE = "https://i.pravatar.cc/300";

const UserCard = ({ user, onConnect, onIgnore, showActions = true }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [imageError, setImageError] = useState(false);
  const [requested, setRequested] = useState(false);
  const dispatch = useDispatch();

  if (!user) {
    return null;
  }

  const { firstName, lastName, photoUrl, age, gender, about, branch, year } = user;

  const handleImageError = () => {
    setImageError(true);
  };

  const handleConnect = async () => {
    try {
      setIsLoading(true);
      setError("");
      console.log("Sending connect request to:", user._id);
      const res = await axios.post(
        `${BASE_URL}/request/send/connect/${user._id}`,
        {},
        { 
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          }
        }
      );
      
      if (res.data.success) {
        setRequested(true);
        dispatch(removeUserFromFeed(user._id));
        onConnect(user._id);
      } else {
        setError(res.data.error || "Failed to connect");
        if ((res.data.error || "").includes("Already Exists")) {
          setRequested(true);
        }
      }
    } catch (err) {
      console.error("Error sending connect request:", err);
      setError(err.response?.data?.error || err.message || "Failed to connect");
      if ((err.response?.data?.error || "").includes("Already Exists")) {
        setRequested(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleIgnore = async () => {
    try {
      setIsLoading(true);
      setError("");
      console.log("Sending ignore request to:", user._id);
      const res = await axios.post(
        `${BASE_URL}/request/send/ignore/${user._id}`,
        {},
        { 
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          }
        }
      );

      if (res.data.success) {
        dispatch(removeUserFromFeed(user._id));
        onIgnore(user._id);
      } else {
        setError(res.data.error || "Failed to ignore");
      }
    } catch (err) {
      console.error("Error sending ignore request:", err);
      setError(err.response?.data?.error || err.message || "Failed to ignore");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-grow">
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
        <div className="flex-shrink-0 ml-4">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-indigo-500 shadow-lg">
            <img
              src={imageError ? DEFAULT_PROFILE_IMAGE : (photoUrl || DEFAULT_PROFILE_IMAGE)}
              alt={`${firstName}'s photo`}
              className="w-full h-full object-cover"
              onError={handleImageError}
            />
          </div>
        </div>
        {showActions && (
          <div className="ml-4 flex flex-col gap-2">
            <button
              onClick={handleConnect}
              disabled={isLoading || requested}
              className={`px-4 py-2 ${
                isLoading || requested
                  ? "bg-gray-400"
                  : "bg-indigo-600 hover:bg-indigo-700"
              } text-white rounded-lg transition-colors`}
            >
              {requested ? "Requested" : isLoading ? "Connecting..." : "Connect"}
            </button>
            <button
              onClick={handleIgnore}
              disabled={isLoading}
              className={`px-4 py-2 ${
                isLoading
                  ? "bg-gray-200"
                  : "border border-gray-300 hover:bg-gray-50"
              } text-gray-700 rounded-lg transition-colors`}
            >
              {isLoading ? "Ignoring..." : "Ignore"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

UserCard.propTypes = {
  user: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    firstName: PropTypes.string.isRequired,
    lastName: PropTypes.string.isRequired,
    photoUrl: PropTypes.string,
    age: PropTypes.number,
    gender: PropTypes.string,
    about: PropTypes.string,
    branch: PropTypes.string,
    year: PropTypes.string
  }).isRequired,
  onConnect: PropTypes.func.isRequired,
  onIgnore: PropTypes.func.isRequired,
  showActions: PropTypes.bool
};

export default UserCard; 