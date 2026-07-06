import axios from "axios";
import { Bell, Code2 } from "lucide-react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { BASE_URL } from "../utils/constants";
import { clearFeed } from "../utils/feedSlice";
import {
  clearNotifications,
  setNotifications,
  upsertNotification,
} from "../utils/notificationSlice";
import { createSocketConnection } from "../utils/socket";
import { removeUser } from "../utils/userSlice";

const NavBar = () => {
  const user = useSelector((store) => store.user);
  const notifications = useSelector((store) => store.notifications);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const unreadNotificationCount = notifications.filter(
    (notification) => !notification?.isRead
  ).length;

  useEffect(() => {
    if (!user) return;

    const fetchNotifications = async () => {
      try {
        const res = await axios.get(BASE_URL + "/notifications", {
          withCredentials: true,
        });

        dispatch(setNotifications(res.data.data));
      } catch (err) {
        console.error(err);
      }
    };

    fetchNotifications();

    const socket = createSocketConnection();
    socket.on("notificationReceived", (notification) => {
      dispatch(upsertNotification(notification));
    });

    return () => {
      socket.disconnect();
    };
  }, [dispatch, user]);

  const handleLogout = async () => {
    try {
      sessionStorage.setItem("devcircleLoggingOut", "true");
      await axios.post(BASE_URL + "/logout", {}, { withCredentials: true });
      dispatch(clearNotifications());
      dispatch(clearFeed());
      dispatch(removeUser());
      window.location.replace("/");
    } catch (err) {
      console.log(err);
      window.location.replace("/");
    }
  };

  const handleLogoClick = (e) => {
    if (!user) return;

    e.preventDefault();
    dispatch(clearFeed());
    navigate("/feed", { state: { refreshFeedAt: Date.now() } });
  };

  const handleFeedClick = (e) => {
    e.preventDefault();
    dispatch(clearFeed());
    navigate("/feed", { state: { refreshFeedAt: Date.now() } });
  };

  return (
    <div className="navbar sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 px-4 shadow-xl shadow-black/20 backdrop-blur-xl sm:px-6">
      <div className="flex-1">
        <Link
          to="/"
          onClick={handleLogoClick}
          className="flex items-center gap-3 text-2xl font-black text-white"
        >
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-cyan-400 via-sky-500 to-fuchsia-500 text-slate-950 shadow-lg shadow-cyan-950/30">
            <Code2 size={22} strokeWidth={3} />
          </span>
          <span className="bg-gradient-to-r from-cyan-200 to-fuchsia-200 bg-clip-text text-transparent">
            DevCircle
          </span>
        </Link>
      </div>

      {user && (
        <div className="flex items-center gap-4">
          <Link
            to="/notifications"
            className="btn btn-ghost btn-circle relative text-slate-200 hover:bg-white/10"
            aria-label="Notifications"
          >
            <Bell size={22} />
            {unreadNotificationCount > 0 && (
              <span className="badge badge-error badge-sm absolute -right-1 -top-1 min-w-5 border-none px-1 text-white">
                {unreadNotificationCount > 99 ? "99+" : unreadNotificationCount}
              </span>
            )}
          </Link>

          <div className="hidden rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-semibold text-slate-300 md:block">
            Welcome, <span className="text-cyan-200">{user.firstName}</span>
          </div>

          <div className="dropdown dropdown-end">
            <div
              tabIndex={0}
              role="button"
              className="relative btn btn-ghost btn-circle avatar hover:bg-white/10"
            >
              <div className="w-10 rounded-full ring-2 ring-cyan-300/80 ring-offset-2 ring-offset-slate-950">
                <img alt="user" src={user.photoUrl} />
              </div>
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-slate-950 bg-emerald-400"></span>
            </div>

            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content surface-card z-[1] mt-3 w-60 rounded-lg p-3 text-slate-100"
            >
              <li className="px-2 text-lg font-bold">{user.firstName}</li>

              <div className="divider my-1"></div>

              <li>
                <Link to="/profile">Profile</Link>
              </li>
              <li>
                <Link to="/feed" onClick={handleFeedClick}>
                  Feed
                </Link>
              </li>
              <li>
                <Link to="/connections">Connections</Link>
              </li>
              <li>
                <Link to="/requests">Requests</Link>
              </li>
              <li>
                <Link to="/notifications">Notifications</Link>
              </li>
              <li>
                <Link to="/premium">Premium</Link>
              </li>

              <div className="divider my-1"></div>

              <li>
                <button
                  onClick={handleLogout}
                  className="text-red-500 font-semibold"
                >
                  Logout
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
