import { useState, useEffect } from "react";
import UserCard from "./UserCard";
import { BASE_URL } from "../utils/constants";
import { useDispatch } from "react-redux";
import { addUser } from "../utils/userSlice";
import axios from "axios";
import { useSelector } from "react-redux";

const EditProfile = () => {
  const user = useSelector((state) => state.user);
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [photoUrl, setPhotoUrl] = useState(user.photoUrl);
  const [age, setAge] = useState(user.age || "");
  const [gender, setGender] = useState(user.gender || "");
  const [about, setAbout] = useState(user.about || "");
  const [skills, setSkills] = useState(user.skills || []);
  const [semester, setSemester] = useState(user.semester || "");
  const [yearOfEducation, setYearOfEducation] = useState(user.yearOfEducation || "");
  const [newSkill, setNewSkill] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setPhotoUrl(user.photoUrl || "");
      setAge(user.age || "");
      setGender(user.gender || "");
      setAbout(user.about || "");
      setSkills(user.skills || []);
      setSemester(user.semester || "");
      setYearOfEducation(user.yearOfEducation || "");
    }
  }, [user]);

  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  const saveProfile = async () => {
    setError("");
    setLoading(true);
    try {
      // Prepare the payload with only valid fields
      const payload = {};
      if (firstName && firstName.trim()) payload.firstName = firstName.trim();
      if (lastName && lastName.trim()) payload.lastName = lastName.trim();
      if (photoUrl && photoUrl.trim()) payload.photoUrl = photoUrl.trim();
      if (about && about.trim()) payload.about = about.trim();
      if (skills && Array.isArray(skills) && skills.length > 0) payload.skills = skills;
      if (age && !isNaN(parseInt(age)) && parseInt(age) >= 16 && parseInt(age) <= 100) payload.age = parseInt(age);
      if (["Male", "Female", "Other"].includes(gender)) payload.gender = gender;
      if (semester && !isNaN(parseInt(semester)) && parseInt(semester) >= 1 && parseInt(semester) <= 8) payload.semester = parseInt(semester);
      if (!isNaN(parseInt(yearOfEducation)) && parseInt(yearOfEducation) >= 1 && parseInt(yearOfEducation) <= 4) payload.yearOfEducation = parseInt(yearOfEducation);

      console.log('Payload being sent:', payload);

      const response = await axios.patch(
        `${BASE_URL}/profile/profile/edit`,
        payload,
        { 
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          }
        }
      );

      if (response.data && response.data.data) {
        dispatch(addUser(response.data.data));
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 3000);
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err) {
      console.error("Profile update error:", err);
      setError(err.response?.data?.message || err.response?.data?.error || err.message || "Failed to update profile");
      // Show error toast
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-row justify-start items-start gap-20 w-full max-w-7xl mx-auto px-8 py-8" style={{background: '#160040'}}>
      {/* User Card */}
      <div className="max-w-xs w-full flex-shrink-0 flex items-start justify-start mb-8 md:mb-0">
        <div className="bg-[#4C0070] rounded-lg shadow-md p-8 flex flex-col items-center w-full h-full min-h-[400px] max-w-xs">
          <div className="w-56 h-40 rounded-lg overflow-hidden border-4 border-indigo-500 shadow-lg mb-4">
            <img
              src={photoUrl || user.photoUrl || "https://i.pravatar.cc/300"}
              alt={`${firstName}'s photo`}
              className="w-full h-full object-cover"
            />
          </div>
          <h2 className="text-2xl font-bold mb-2 w-full text-center">{firstName} {lastName}</h2>
          <p className="text-gray-300 mb-1 w-full text-center">{age ? `${age} years old` : null} {gender ? `• ${gender}` : null}</p>
          <p className="text-gray-300 mb-1 w-full text-center">{semester ? `Semester: ${semester}` : null} {yearOfEducation ? `• Year: ${yearOfEducation}` : null}</p>
          {about && <p className="text-gray-400 mb-2 text-center w-full">{about}</p>}
          {skills && skills.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2 justify-center w-full">
              {skills.map((skill, idx) => (
                <span key={idx} className="badge badge-primary">{skill}</span>
              ))}
            </div>
          )}
        </div>
      </div>
      {/* Edit Profile Form */}
      <div className="card bg-[#4C0070] max-w-lg w-full shadow-sm h-full min-h-[500px] flex flex-col justify-start">
        <div className="card-body w-full max-w-lg w-full">
          <h2 className="card-title justify-center">Edit Profile</h2>
          <div>
            <label className="form-control w-full max-w-none my-2">
              <div className="label flex justify-between">
                <span className="label-text">First Name:</span>
              </div>
              <input
                type="text"
                value={firstName}
                placeholder="Type here"
                className="input input-bordered w-full max-w-none"
                onChange={(e) => setFirstName(e.target.value)}
              />
            </label>

            <label className="form-control w-full max-w-none my-2">
              <div className="label flex justify-between">
                <span className="label-text">Last Name:</span>
              </div>
              <input
                type="text"
                value={lastName}
                placeholder="Type here"
                className="input input-bordered w-full max-w-none"
                onChange={(e) => setLastName(e.target.value)}
              />
            </label>

            <label className="form-control w-full max-w-none my-2">
              <div className="label flex justify-between">
                <span className="label-text">Photo URL:</span>
              </div>
              <input
                type="text"
                value={photoUrl}
                placeholder="Enter image URL"
                className="input input-bordered w-full max-w-none"
                onChange={(e) => setPhotoUrl(e.target.value)}
              />
            </label>

            <label className="form-control w-full max-w-none my-2">
              <div className="label flex justify-between">
                <span className="label-text">Age:</span>
              </div>
              <input
                type="number"
                value={age}
                placeholder="Enter your age"
                className="input input-bordered w-full max-w-none"
                onChange={(e) => setAge(e.target.value)}
              />
            </label>

            <label className="form-control w-full max-w-none my-2">
              <div className="label flex justify-between">
                <span className="label-text">Gender:</span>
              </div>
              <select
                value={gender}
                className="select select-bordered w-full max-w-none"
                onChange={(e) => setGender(e.target.value)}
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </label>

            <label className="form-control w-full max-w-none my-2">
              <div className="label flex justify-between">
                <span className="label-text">Semester:</span>
              </div>
              <select
                value={semester}
                className="select select-bordered w-full max-w-none"
                onChange={(e) => setSemester(e.target.value)}
              >
                <option value="">Select semester</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                  <option key={sem} value={sem}>
                    {sem}
                  </option>
                ))}
              </select>
            </label>

            <label className="form-control w-full max-w-none my-2">
              <div className="label flex justify-between">
                <span className="label-text">Year of Education:</span>
              </div>
              <select
                value={yearOfEducation}
                className="select select-bordered w-full max-w-none"
                onChange={(e) => setYearOfEducation(e.target.value)}
              >
                <option value="">Select year</option>
                <option value="1">First Year</option>
                <option value="2">Second Year</option>
                <option value="3">Third Year</option>
                <option value="4">Fourth Year</option>
              </select>
            </label>

            <label className="form-control w-full max-w-none my-2">
              <div className="label flex justify-between">
                <span className="label-text">Skills:</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSkill}
                  placeholder="Add a skill"
                  className="input input-bordered flex-1 w-full max-w-none"
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSkill();
                    }
                  }}
                />
                <button
                  className="btn btn-primary btn-sm"
                  onClick={handleAddSkill}
                  type="button"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {skills.map((skill, index) => (
                  <div
                    key={index}
                    className="badge badge-primary gap-2 w-full max-w-none"
                  >
                    {skill}
                    <button
                      className="btn btn-ghost btn-xs"
                      onClick={() => handleRemoveSkill(skill)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </label>

            <label className="form-control w-full max-w-none my-2">
              <div className="label flex justify-between">
                <span className="label-text">About:</span>
              </div>
              <textarea
                value={about}
                placeholder="Tell us about yourself"
                className="textarea textarea-bordered w-full max-w-none h-24"
                onChange={(e) => setAbout(e.target.value)}
              />
            </label>

            {error && <p className="text-error mt-2">{error}</p>}
            <div className="card-actions m-2">
              <button 
                className={`btn btn-primary w-full py-3 text-lg font-semibold ${loading ? 'loading' : ''}`}
                onClick={saveProfile}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {showToast && (
        <div className="toast toast-top toast-center">
          <div className={`alert ${error ? 'alert-error' : 'alert-success'}`}>
            <span>{error || 'Profile saved successfully.'}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditProfile;