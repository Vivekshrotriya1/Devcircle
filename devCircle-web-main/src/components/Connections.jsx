import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addConnections } from "../utils/conectionSlice";
import { Link } from "react-router-dom";

const Connections = () => {
  const connections = useSelector((store) => store.connections);
  const dispatch = useDispatch();
  const fetchConnections = async () => {
    try {
      const res = await axios.get(BASE_URL + "/user/connections", {
        withCredentials: true,
      });
      dispatch(addConnections(res.data.data));
    } catch (err) {
      // Handle Error Case
      console.error(err);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, []);

  if (!connections) return;

  if (connections.length === 0)
    return (
      <div className="app-container">
        <div className="soft-panel mx-auto max-w-xl rounded-lg p-8 text-center">
          <h1 className="text-2xl font-black text-slate-50">
            No connections found
          </h1>
          <p className="page-subtitle">
            Accepted builders will appear here when your circle starts growing.
          </p>
        </div>
      </div>
    );

  return (
    <div className="app-container">
      <div className="mb-7 text-center">
        <h1 className="page-title">Connections</h1>
        <p className="page-subtitle">
          People you have matched with and can message anytime.
        </p>
      </div>

      {connections.map((connection) => {
        const { _id, firstName, lastName, photoUrl } = connection;

        return (
          <div
            key={_id}
            className="soft-panel mx-auto mb-4 flex max-w-3xl flex-col gap-4 rounded-lg p-4 sm:flex-row sm:items-center"
          >
            <div className="shrink-0">
              <img
                alt="photo"
                className="h-20 w-20 rounded-full object-cover ring-2 ring-cyan-300/50"
                src={photoUrl}
              />
            </div>
            <div className="min-w-0 flex-1 text-left">
              <h2 className="text-xl font-black text-slate-50">
                {firstName + " " + lastName}
              </h2>
            </div>
            <Link to={"/chat/" + _id}>
              <button className="primary-action w-full sm:w-auto">Chat</button>
            </Link>
          </div>
        );
      })}
    </div>
  );
};
export default Connections;
