import { useState } from "react";
import UserCard from "./UserCard";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useDispatch } from "react-redux";
import { addUser } from "../utils/userSlice";

const EditProfile = ({ user }) => {
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [photoUrl, setPhotoUrl] = useState(user.photoUrl);
  const [age, setAge] = useState(user.age || "");
  const [gender, setGender] = useState(user.gender || "");
  const [city, setCity] = useState(user.city || "");
  const [about, setAbout] = useState(user.about || "");
  const [error, setError] = useState("");
  const dispatch = useDispatch();
  const [showToast, setShowToast] = useState(false);

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setError("");

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }

    if (file.size > 1024 * 1024) {
      setError("Please select an image smaller than 1 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const saveProfile = async () => {
    //Clear Errors
    setError("");
    try {
      const res = await axios.patch(
        BASE_URL + "/profile/edit",
        {
          firstName,
          lastName,
          photoUrl,
          age,
          gender,
          city,
          about,
        },
        { withCredentials: true }
      );
      dispatch(addUser(res?.data?.data));
      setShowToast(true);
    } catch (err) {
      setError(err.response.data);
    }
  };

  return (
    <>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start">
        <div className="surface-card rounded-lg">
          <div className="p-6 sm:p-8">
            <div className="mb-6">
              <h2 className="page-title">Edit Profile</h2>
              <p className="page-subtitle">
                Keep your profile sharp so the right builders can discover you.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="form-control w-full">
                <div className="label">
                  <span className="field-label">First Name</span>
                </div>
                <input
                  type="text"
                  value={firstName}
                  className="field-input"
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </label>
              <label className="form-control w-full">
                <div className="label">
                  <span className="field-label">Last Name</span>
                </div>
                <input
                  type="text"
                  value={lastName}
                  className="field-input"
                  onChange={(e) => setLastName(e.target.value)}
                />
              </label>
              <label className="form-control w-full sm:col-span-2">
                <div className="label">
                  <span className="field-label">Profile Photo</span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="file-input file-input-bordered w-full border-white/10 bg-slate-900/80 text-slate-100"
                  onChange={handlePhotoChange}
                />
              </label>
              <label className="form-control w-full">
                <div className="label">
                  <span className="field-label">Age</span>
                </div>
                <input
                  type="text"
                  value={age}
                  className="field-input"
                  onChange={(e) => setAge(e.target.value)}
                />
              </label>
              <label className="form-control w-full">
                <div className="label">
                  <span className="field-label">Gender</span>
                </div>
                <input
                  type="text"
                  value={gender}
                  className="field-input"
                  onChange={(e) => setGender(e.target.value)}
                />
              </label>
              <label className="form-control w-full sm:col-span-2">
                <div className="label">
                  <span className="field-label">City</span>
                </div>
                <input
                  type="text"
                  value={city}
                  className="field-input"
                  onChange={(e) => setCity(e.target.value)}
                />
              </label>
              <label className="form-control w-full sm:col-span-2">
                <div className="label">
                  <span className="field-label">About</span>
                </div>
                <input
                  type="text"
                  value={about}
                  className="field-input"
                  onChange={(e) => setAbout(e.target.value)}
                />
              </label>
            </div>
            {error && (
              <p className="mt-4 text-sm font-semibold text-rose-300">
                {error}
              </p>
            )}
            <div className="mt-6 flex justify-end">
              <button className="primary-action" onClick={saveProfile}>
                Save Profile
              </button>
            </div>
          </div>
        </div>
        <div className="lg:sticky lg:top-28">
          <p className="mb-3 text-sm font-bold uppercase tracking-widest text-cyan-200">
            Live Preview
          </p>
          <UserCard
            user={{ firstName, lastName, photoUrl, age, gender, city, about }}
          />
        </div>
      </div>
      {showToast && (
        <div className="toast toast-top toast-center">
          <div className="alert border border-emerald-300/30 bg-emerald-400 text-slate-950 shadow-xl">
            <span>Profile saved successfully.</span>
          </div>
        </div>
      )}
    </>
  );
};
export default EditProfile;
