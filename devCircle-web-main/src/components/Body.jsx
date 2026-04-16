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

      // 🔥 If no token → redirect immediately
      if (!token) {
        return navigate("/login");
      }

      const res = await axios.get(BASE_URL + "/profile/view", {
        headers: {
          Authorization: `Bearer ${token}`, // ✅ send token
        },
      });

      dispatch(addUser(res.data));
    } catch (err) {
      console.error(err);

      // 🔥 If token invalid/expired → logout
      if (err.response && err.response.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <div>
      <NavBar />
      <Outlet />
      <Footer />
    </div>
  );
};

export default Body;