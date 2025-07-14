import { useSelector } from "react-redux";
import EditProfile from "./EditProfile";
import { useState } from "react";

const Profile = () => {
    const user = useSelector((store) => store.user);
    const [editing, setEditing] = useState(false);
    if (!user) {
        return <div className="flex justify-center items-center min-h-[60vh] text-lg text-red-500">User not loaded. Please log in again.</div>;
    }
    return (
        user && (
    <div className="flex min-h-[60vh] justify-start items-center" style={{ minHeight: '80vh' }}>
      <div className="w-full max-w-md">
        {!editing ? (
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
            <button
              className="btn btn-primary mt-4"
              onClick={() => setEditing(true)}
            >
              Edit
            </button>
          </div>
        ) : (
          <EditProfile user={user} />
        )}
      </div>
    </div>
        )
    );
};
export default Profile;