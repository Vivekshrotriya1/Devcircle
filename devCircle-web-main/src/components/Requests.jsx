import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useDispatch, useSelector } from "react-redux";
import { addRequests, removeRequest } from "../utils/requestSlice";
import { useEffect } from "react";

const Requests = () => {
  const requests = useSelector((store) => store.requests);
  const dispatch = useDispatch();

  const reviewRequest = async (status, _id) => {
    try {
      const res = axios.post(
        BASE_URL + "/request/review/" + status + "/" + _id,
        {},
        { withCredentials: true }
      );
      dispatch(removeRequest(_id));
    } catch (err) {}
  };

  const fetchRequests = async () => {
    try {
      const res = await axios.get(BASE_URL + "/user/requests/received", {
        withCredentials: true,
      });

      dispatch(addRequests(res.data.data));
    } catch (err) {}
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  if (!requests) return;

  if (requests.length === 0)
    return (
      <div className="app-container">
        <div className="soft-panel mx-auto max-w-xl rounded-lg p-8 text-center">
          <h1 className="text-2xl font-black text-slate-50">
            No requests found
          </h1>
          <p className="page-subtitle">
            New connection requests will land here.
          </p>
        </div>
      </div>
    );

  return (
    <div className="app-container">
      <div className="mb-7 text-center">
        <h1 className="page-title">Connection Requests</h1>
        <p className="page-subtitle">
          Review builders who want to join your circle.
        </p>
      </div>

      {requests.map((request) => {
        const { _id, firstName, lastName, photoUrl, age, gender, city, about } =
          request.fromUserId;

        return (
          <div
            key={_id}
            className="soft-panel mx-auto mb-4 flex max-w-4xl flex-col gap-4 rounded-lg p-4 sm:flex-row sm:items-center"
          >
            <div className="shrink-0">
              <img
                alt="photo"
                className="h-20 w-20 rounded-full object-cover ring-2 ring-fuchsia-300/50"
                src={photoUrl}
              />
            </div>
            <div className="min-w-0 flex-1 text-left">
              <h2 className="text-xl font-black text-slate-50">
                {firstName + " " + lastName}
              </h2>
              <div className="mt-1 flex flex-wrap gap-2 text-sm text-slate-300">
                {age && gender && <span>{age + ", " + gender}</span>}
                {city && <span>{city}</span>}
              </div>
              <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-400">
                {about}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:flex">
              <button
                className="secondary-action"
                onClick={() => reviewRequest("rejected", request._id)}
              >
                Reject
              </button>
              <button
                className="primary-action"
                onClick={() => reviewRequest("accepted", request._id)}
              >
                Accept
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
export default Requests;
