import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { BASE_URL } from "../utils/constants";
import { removeUser } from "../utils/userSlice";
import { useContext } from "react";
import { NotificationContext } from "../App";

const NavBar = () => {
  const user = useSelector((store) => store.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { notifications } = useContext(NotificationContext);

  const handleLogout = async () => {
    try {
      await axios.post(BASE_URL + "/auth/logout", {}, { withCredentials: true });
      dispatch(removeUser());
      navigate("/login");
    } catch (err) {
      console.error("Logout error:", err);
      dispatch(removeUser());
      navigate("/login");
    }
  };

  return (
    <nav className="navbar bg-base-300">
      <div className="flex-1">
        <Link to={user && user._id ? "/feed" : "/welcome"} className="btn btn-ghost text-xl">
          Student Hub
        </Link>
      </div>
      {user && user._id ? (
        <div className="flex items-center gap-6">
          <Link to="/feed" className="btn btn-ghost">Feed</Link>
          <Link to="/connections" className="btn btn-ghost">Connections</Link>
          <Link to="/requests" className="btn btn-ghost relative">
            Requests
            {notifications.requests > 0 && (
              <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 font-bold animate-bounce">
                {notifications.requests}
              </span>
            )}
          </Link>
          {/* Community Dropdown */}
          <div className="dropdown dropdown-hover relative">
            <label tabIndex={0} className="btn btn-ghost m-1">Community
              {notifications.posts > 0 && (
                <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 font-bold animate-bounce">
                  {notifications.posts}
                </span>
              )}
            </label>
            <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
              <li><a onClick={() => navigate('/community?tab=event')}>Event</a></li>
              <li><a onClick={() => navigate('/community?tab=internship')}>Internship</a></li>
              <li><a onClick={() => navigate('/community?tab=placement')}>Placement</a></li>
            </ul>
          </div>
          <Link to="/chat" className="btn btn-ghost relative">
            Chat
            {notifications.chat > 0 && (
              <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 font-bold animate-bounce">
                {notifications.chat}
              </span>
            )}
          </Link>
          <button onClick={handleLogout} className="btn btn-error">Logout</button>
          <div className="dropdown dropdown-end">
            <Link to="/profile" className="flex flex-col items-center cursor-pointer">
              <div className="btn btn-ghost btn-circle avatar">
                <div className="w-12 h-12 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                  <img 
                    alt={`${user.firstName}'s photo`} 
                    src={user.photoUrl || "https://i.pravatar.cc/300"} 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="text-center mt-1">
                <span className="block text-sm font-semibold text-gray-800">{user.firstName} {user.lastName}</span>
              </div>
            </Link>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <Link to="/login" className="btn btn-primary">Login</Link>
          <Link to="/login" className="btn btn-outline">Sign Up</Link>
        </div>
      )}
    </nav>
  );
};

export default NavBar;
