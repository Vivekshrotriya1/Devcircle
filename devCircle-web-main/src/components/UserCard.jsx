import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useDispatch } from "react-redux";
import { removeUserFromFeed } from "../utils/feedSlice";

const UserCard = ({ user }) => {
  const { _id, firstName, lastName, photoUrl, age, gender, city, about } = user;
  const dispatch = useDispatch();

  const handleSendRequest = async (status, userId) => {
    try {
      const res = await axios.post(
        BASE_URL + "/request/send/" + status + "/" + userId,
        {},
        { withCredentials: true }
      );
      dispatch(removeUserFromFeed(userId));
    } catch (err) {}
  };

  return (
    <div className="surface-card w-full max-w-sm overflow-hidden rounded-lg">
      <figure className="relative bg-slate-900">
        <img
          src={photoUrl}
          alt="photo"
          className="h-[25rem] w-full object-cover object-center"
        />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-slate-950 to-transparent" />
      </figure>
      <div className="space-y-4 p-6">
        <div>
          <h2 className="text-2xl font-black text-slate-50">
            {firstName + " " + lastName}
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {age && gender && (
              <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-sm font-semibold text-cyan-100">
                {age + ", " + gender}
              </span>
            )}
            {city && (
              <span className="rounded-full border border-fuchsia-300/20 bg-fuchsia-300/10 px-3 py-1 text-sm font-semibold text-fuchsia-100">
                {city}
              </span>
            )}
          </div>
        </div>
        <p className="leading-6 text-slate-300">{about}</p>
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            className="secondary-action"
            onClick={() => handleSendRequest("ignored", _id)}
          >
            Ignore
          </button>
          <button
            className="primary-action"
            onClick={() => handleSendRequest("interested", _id)}
          >
            Interested
          </button>
        </div>
      </div>
    </div>
  );
};
export default UserCard;
