import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useDispatch, useSelector } from "react-redux";
import { addFeed } from "../utils/feedSlice";
import { useCallback, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import UserCard from "./UserCard";

const Feed = () => {
  const feed = useSelector((store) => store.feed);
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  const getFeed = useCallback(async (forceRefresh = false) => {
    if (!forceRefresh && feed && feed.length > 0) return;

    try {
      const res = await axios.get(BASE_URL + "/feed", {
        withCredentials: true,
      });

      dispatch(addFeed(res?.data?.data));
    } catch (err) {
      console.log(err?.response?.data);

      if (err.response?.status === 401) {
        if (sessionStorage.getItem("devcircleLoggingOut") === "true") {
          navigate("/");
          return;
        }

        navigate("/login");
      }
    }
  }, [dispatch, feed, navigate]);

  useEffect(() => {
    getFeed(Boolean(location.state?.refreshFeedAt));
  }, [getFeed, location.state?.refreshFeedAt]);

  if (!feed)
    return (
      <div className="app-container flex justify-center">
        <div className="soft-panel rounded-lg px-6 py-4 font-semibold text-slate-300">
          Loading...
        </div>
      </div>
    );

  if (feed.length === 0)
    return (
      <div className="app-container">
        <div className="soft-panel mx-auto max-w-xl rounded-lg p-8 text-center">
          <h1 className="text-2xl font-black text-slate-50">
            No new users found
          </h1>
          <p className="page-subtitle">
            Your circle is caught up for now. Check back later for fresh builders.
          </p>
        </div>
      </div>
    );

  return (
    <div className="app-container flex justify-center">
      <UserCard user={feed[0]} />
    </div>
  );
};
export default Feed;
