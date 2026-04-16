import { Outlet, useNavigate } from "react-router-dom";
import NavBar from "./NavBar";
import Footer from "./Footer";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useDispatch, useSelector } from "react-redux";
import { addUser } from "../utils/userSlice";
import { useEffect } from "react";

const Body = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userData = useSelector((store) => store.user);

  const fetchUser = async () => {
    if (userData) return;

    try {
      const token = localStorage.getItem("token");

      // ✅ If token missing → redirect
      if (!token) {
        navigate("/login");
        return;
      }

      const res = await axios.get(BASE_URL + "/profile/view", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      dispatch(addUser(res.data));
    } catch (err) {
      console.error("Auth error:", err?.response?.data || err.message);

      // ✅ Token invalid → clear + redirect
      localStorage.removeItem("token");
      navigate("/login");
    }
  };

  useEffect(() => {
    fetchUser();
  }, [userData]); // ✅ added dependency

  return (
    <div>
      <NavBar />
      <Outlet />
      <Footer />
    </div>
  );
};

export default Body;