import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useDispatch, useSelector } from "react-redux";
import { addFeed } from "../utils/feedSlice";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UserCard from "./UserCard";

const Feed = () => {
  const feed = useSelector((store) => store.feed);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const getFeed = async () => {
    try {
      const token = localStorage.getItem("token");

      // ✅ If no token → redirect
      if (!token) {
        navigate("/login");
        return;
      }

      const res = await axios.get(BASE_URL + "/feed", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      dispatch(addFeed(res?.data?.data));
    } catch (err) {
      console.error("Feed error:", err?.response?.data || err.message);

      // ✅ If token invalid → clear + redirect
      if (err.response && err.response.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    }
  };

  useEffect(() => {
    // ✅ Only fetch if feed is empty or not loaded
    if (!feed || feed.length === 0) {
      getFeed();
    }
  }, [feed]);

  if (!feed) return;

  if (feed.length <= 0)
    return <h1 className="flex justify-center my-10">No new users found!</h1>;

  return (
    <div className="flex justify-center my-10">
      <UserCard user={feed[0]} />
    </div>
  );
};

export default Feed;