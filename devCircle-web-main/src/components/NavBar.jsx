import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { BASE_URL } from "../utils/constants";
import { removeUser } from "../utils/userSlice";
import { Bell, Sun, Moon } from "lucide-react";
import { useState } from "react";



const NavBar = () => {
  const user = useSelector((store) => store.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);

  const handleLogout = async () => {
    try {
      await axios.post(BASE_URL + "/logout", {}, { withCredentials: true });
      dispatch(removeUser());
      navigate("/login");
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="navbar bg-base-300 px-6 shadow-md sticky top-0 z-50">

      {/* Logo */}
      <div className="flex-1">
        <Link
          to="/"
          className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent"
        >
          👩‍💻 DevCircle
        </Link>
      </div>

      {user && (
        <div className="flex items-center gap-4">

          {/* Dark Mode Toggle */}
          {/* <button
            onClick={() => setDarkMode(!darkMode)}
            className="btn btn-ghost btn-circle"
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button> */}

          {/* Notification Icon */}
          {/* <div className="relative cursor-pointer">
            <Bell size={22} />
            <span className="absolute -top-1 -right-1 bg-red-500 text-xs rounded-full px-1">
              3
            </span>
          </div> */}

          {/* Welcome Text */}
          <div className="hidden md:block font-medium">
            Welcome, <span className="text-primary">{user.firstName}</span>
          </div>

          {/* Avatar Dropdown */}
          <div className="dropdown dropdown-end">
            <div
              tabIndex={0}
              role="button"
              className="relative btn btn-ghost btn-circle avatar"
            >
              <div className="w-10 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                <img alt="user" src={user.photoUrl} />
              </div>

              {/* Online Indicator */}
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
            </div>

            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content bg-base-100 rounded-xl z-[1] mt-3 w-56 p-3 shadow-lg"
            >
              <li className="font-semibold text-lg px-2">
                {user.firstName}
              </li>

              <div className="divider my-1"></div>

              <li>
                <Link to="/profile">👤 Profile</Link>
              </li>
              <li>
                <Link to="/connections">🤝 Connections</Link>
              </li>
              <li>
                <Link to="/requests">📩 Requests</Link>
              </li>
              <li>
                <Link to="/premium">💎 Premium</Link>
              </li>

              <div className="divider my-1"></div>

              <li>
                <button
                  onClick={handleLogout}
                  className="text-red-500 font-semibold"
                >
                  🚪 Logout
                </button>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default NavBar;