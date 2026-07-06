import { Outlet, useLocation, useNavigate } from "react-router-dom";
import NavBar from "./NavBar";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useDispatch, useSelector } from "react-redux";
import { addUser } from "../utils/userSlice";
import { useEffect } from "react";

const Body = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const userData = useSelector((store) => store.user);
  const isPublicPage =
    location.pathname === "/" ||
    location.pathname === "/login" ||
    location.pathname === "/signup" ||
    location.pathname === "/forgot-password";

  useEffect(() => {
    if (isPublicPage) {
      sessionStorage.removeItem("devcircleLoggingOut");
      return;
    }
    if (userData) return;

    const fetchUser = async () => {
      try {
        const res = await axios.get(BASE_URL + "/profile/view", {
          withCredentials: true,
        });
        dispatch(addUser(res.data));
      } catch (err) {
        if (err.response && err.response.status === 401) {
          if (sessionStorage.getItem("devcircleLoggingOut") === "true") {
            navigate("/");
            return;
          }

          navigate("/login");
        }
        console.error(err);
      }
    };

    fetchUser();
  }, [dispatch, isPublicPage, navigate, userData]);

  return (
    <div className="app-shell flex min-h-screen flex-col">
      {!isPublicPage && <NavBar />}
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};
export default Body;
