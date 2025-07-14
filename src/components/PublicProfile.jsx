import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { BASE_URL } from "../utils/constants";
import axios from "axios";

const PublicProfile = () => {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await axios.get(`${BASE_URL}/user/${userId}`, {
          withCredentials: true,
        });
        setUser(response.data);
      } catch (err) {
        setError("Failed to load user profile");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [userId]);

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }
  if (error) {
    return <div className="text-center text-red-500 py-8">{error}</div>;
  }
  if (!user) {
    return <div className="text-center text-gray-500 py-8">User not found</div>;
  }

  return (
    <div className="flex min-h-[70vh] justify-center items-center w-full">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-md p-8 flex flex-col items-center">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-indigo-500 shadow-lg mb-4">
            <img
              src={user.photoUrl || "https://i.pravatar.cc/300"}
              alt={`${user.firstName}'s photo`}
              className="w-full h-full object-cover"
            />
          </div>
          <h2 className="text-2xl font-bold mb-2">{user.firstName} {user.lastName}</h2>
          <p className="text-gray-600 mb-1">{user.age ? `${user.age} years old` : null} {user.gender ? `• ${user.gender}` : null}</p>
          <p className="text-gray-600 mb-1">{user.semester ? `Semester: ${user.semester}` : null} {user.yearOfEducation ? `• Year: ${user.yearOfEducation}` : null}</p>
          {user.about && <p className="text-gray-500 mb-2 text-center">{user.about}</p>}
        </div>
      </div>
    </div>
  );
};

export default PublicProfile; 