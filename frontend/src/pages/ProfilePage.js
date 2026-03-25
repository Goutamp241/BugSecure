import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../services/api";
import MemojiAvatarPicker from "../components/MemojiAvatarPicker";

const ProfilePage = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [avatarPickerOpen, setAvatarPickerOpen] = useState(false);
  const [avatarSaving, setAvatarSaving] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    bio: "",
    phoneNumber: "",
    address: "",
    website: "",
    companyName: "",
    profileImage: "",
  });
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [contractAgreeChecked, setContractAgreeChecked] = useState(false);
  const [contractAcceptLoading, setContractAcceptLoading] = useState(false);
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const isOwnProfile = !id || id === currentUser.id?.toString();

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const handleDeleteMyAccount = async () => {
    if (deleteLoading) return;
    if (!window.confirm("Permanently delete your account? This cannot be undone.")) {
      return;
    }

    setDeleteLoading(true);
    setError("");
    try {
      const res = await API.delete("/api/users/me");
      if (res.data.success) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
      } else {
        setError(res.data.error || "Failed to delete account");
      }
    } catch (e) {
      setError(e.response?.data?.error || "Failed to delete account");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleSaveAvatar = async (avatarDataUri) => {
    if (avatarSaving) return;
    setAvatarSaving(true);
    setError("");
    try {
      const res = await API.put("/api/profile", { profileImage: avatarDataUri });
      if (res.data.success) {
        setProfile(res.data.data);
        setFormData((prev) => ({
          ...prev,
          profileImage: res.data.data.profileImage,
        }));
        localStorage.setItem("user", JSON.stringify(res.data.data));
        setAvatarPickerOpen(false);
      } else {
        setError(res.data.error || "Failed to save avatar");
      }
    } catch (e) {
      setError(e.response?.data?.error || "Failed to save avatar");
    } finally {
      setAvatarSaving(false);
    }
  };

  const fetchProfile = async () => {
    try {
      const endpoint = id ? `/api/profile/${id}` : "/api/profile";
      const res = await API.get(endpoint);
      if (res.data.success) {
        const userData = res.data.data;
        setProfile(userData);
        setFormData({
          username: userData.username || "",
          bio: userData.bio || "",
          phoneNumber: userData.phoneNumber || "",
          address: userData.address || "",
          website: userData.website || "",
          companyName: userData.companyName || "",
          profileImage: userData.profileImage || "",
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptSmartContract = async () => {
    if (!contractAgreeChecked) return;

    setContractAcceptLoading(true);
    setError("");
    try {
      const contractText =
        "Terms and Conditions for Bug Bounty Researchers: "
        + "You agree to conduct security testing only on authorized targets and within the scope defined by the company. "
        + "You will not access, modify, or delete data beyond what is necessary to demonstrate the vulnerability. "
        + "You will not disclose vulnerabilities publicly before the company has had reasonable time to fix them. "
        + "You will not perform any denial of service attacks or actions that could harm the company's infrastructure. "
        + "You agree to comply with all applicable laws and regulations. ";

      const res = await API.post("/api/contract/accept", { contractText });
      if (!res.data?.success) {
        throw new Error(res.data?.error || "Failed to accept contract");
      }

      // Update local state + localStorage so researchers immediately see preview/sandbox buttons.
      const updatedProfile = {
        ...(profile || {}),
        contractAccepted: true,
        contractHash: res.data.contractHash,
      };
      setProfile(updatedProfile);

      if (currentUser?.id) {
        const updatedUser = {
          ...currentUser,
          contractAccepted: true,
          contractHash: res.data.contractHash,
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }

      setContractAgreeChecked(false);
      setContractAcceptLoading(false);
    } catch (e) {
      setError(e.response?.data?.error || e.message || "Failed to accept contract");
      setContractAcceptLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("Please select an image file");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size must be less than 5MB");
        return;
      }

      try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await API.post("/api/profile/upload-image", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        if (res.data.success) {
          setProfile(res.data.data);
          setFormData({
            ...formData,
            profileImage: res.data.data.profileImage,
          });
          localStorage.setItem("user", JSON.stringify(res.data.data));
          alert("Profile image uploaded successfully!");
        } else {
          setError(res.data.error || "Failed to upload image");
        }
      } catch (error) {
        setError(error.response?.data?.error || "Failed to upload image");
      }
    }
  };

  const handleSaveProfile = async () => {
    try {
      const res = await API.put("/api/profile", formData);
      if (res.data.success) {
        setProfile(res.data.data);
        setIsEditing(false);
        localStorage.setItem("user", JSON.stringify(res.data.data));
        alert("Profile updated successfully!");
      }
    } catch (error) {
      setError(error.response?.data?.error || "Failed to update profile");
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    try {
      const res = await API.put("/api/profile/password", {
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword,
      });
      if (res.data.success) {
        setShowPasswordForm(false);
        setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
        alert("Password changed successfully!");
      }
    } catch (error) {
      setError(error.response?.data?.error || "Failed to change password");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-white text-xl">Profile not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white pt-24 px-4 sm:px-6 lg:px-8 pb-12">
      <div className="container mx-auto max-w-4xl">
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 md:p-8">
          {/* Profile Header */}
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8">
            <div className="relative">
              <img
                src={
                  formData.profileImage ||
                  profile.profileImage ||
                  "https://via.placeholder.com/150"
                }
                alt={profile.username}
                className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-blue-500 object-cover"
              />
              {isEditing && isOwnProfile && (
                <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </label>
              )}
            </div>

            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl md:text-4xl font-bold text-blue-400 mb-2">
                {profile.username || profile.companyName}
              </h1>
              {profile.companyName && (
                <p className="text-gray-300 text-lg mb-2">{profile.companyName}</p>
              )}
              <p className="text-gray-400 mb-2">{profile.email}</p>
              <span className="inline-block px-3 py-1 bg-blue-600 rounded-full text-sm font-semibold">
                {profile.role}
              </span>
              {isOwnProfile && !isEditing && (
                <div className="mt-4 flex flex-wrap gap-2 justify-center md:justify-start">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition"
                  >
                    Edit Profile
                  </button>
                  <button
                    onClick={() => setShowPasswordForm(!showPasswordForm)}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg font-semibold transition"
                  >
                    Change Password
                  </button>
                  <button
                    onClick={() => setAvatarPickerOpen(true)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={avatarSaving}
                  >
                    {avatarSaving ? "Updating..." : "Choose Avatar"}
                  </button>
                  {profile.role !== "ADMIN" && (
                    <button
                      onClick={handleDeleteMyAccount}
                      disabled={deleteLoading}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {deleteLoading ? "Deleting..." : "Delete My Account"}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="bg-red-600 text-white p-3 rounded mb-4">{error}</div>
          )}

          {/* Researchers must accept the smart contract to unlock code preview/sandbox testing */}
          {profile?.role === "USER" &&
            isOwnProfile &&
            !isEditing &&
            !profile?.contractAccepted && (
              <div className="mb-6 p-4 bg-gray-900 rounded-lg border border-yellow-500/50">
                <h2 className="text-xl font-bold text-yellow-300 mb-2">
                  Smart Contract Required
                </h2>
                <p className="text-gray-300 text-sm mb-3">
                  Accepting the contract is required to preview submitted code and start sandbox testing.
                </p>
                <label className="flex items-center gap-2 text-gray-300 text-sm mb-4">
                  <input
                    type="checkbox"
                    checked={contractAgreeChecked}
                    onChange={(e) => setContractAgreeChecked(e.target.checked)}
                    className="w-4 h-4"
                  />
                  I have read and agree to the terms and conditions.
                </label>
                <button
                  type="button"
                  onClick={handleAcceptSmartContract}
                  disabled={!contractAgreeChecked || contractAcceptLoading}
                  className="px-6 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {contractAcceptLoading ? "Accepting..." : "Accept Contract"}
                </button>
              </div>
            )}

          {avatarPickerOpen && isOwnProfile && (
            <MemojiAvatarPicker
              onCancel={() => setAvatarPickerOpen(false)}
              onSave={handleSaveAvatar}
            />
          )}

          {/* Profile Information */}
          <div className="space-y-6">
            {profile.bio && !isEditing && (
              <div>
                <h2 className="text-xl font-bold text-blue-400 mb-2">Bio</h2>
                <p className="text-gray-300">{profile.bio}</p>
              </div>
            )}

            {isEditing && isOwnProfile && (
              <div>
                <label className="block mb-2 font-medium text-gray-300">Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-500"
                  rows="4"
                  placeholder="Tell us about yourself..."
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {profile.phoneNumber && !isEditing && (
                <div>
                  <h3 className="text-lg font-semibold text-blue-400 mb-1">Phone</h3>
                  <p className="text-gray-300">{profile.phoneNumber}</p>
                </div>
              )}

              {isEditing && isOwnProfile && (
                <div>
                  <label className="block mb-2 font-medium text-gray-300">Phone Number</label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    className="w-full p-3 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              {profile.address && !isEditing && (
                <div>
                  <h3 className="text-lg font-semibold text-blue-400 mb-1">Address</h3>
                  <p className="text-gray-300">{profile.address}</p>
                </div>
              )}

              {isEditing && isOwnProfile && (
                <div>
                  <label className="block mb-2 font-medium text-gray-300">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full p-3 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              {profile.website && !isEditing && (
                <div>
                  <h3 className="text-lg font-semibold text-blue-400 mb-1">Website</h3>
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline"
                  >
                    {profile.website}
                  </a>
                </div>
              )}

              {isEditing && isOwnProfile && (
                <div>
                  <label className="block mb-2 font-medium text-gray-300">Website</label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    className="w-full p-3 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              {profile.role === "COMPANY" && isEditing && isOwnProfile && (
                <div>
                  <label className="block mb-2 font-medium text-gray-300">Company Name</label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    className="w-full p-3 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>

            {isEditing && isOwnProfile && (
              <div className="flex gap-4">
                <button
                  onClick={handleSaveProfile}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      username: profile.username || "",
                      bio: profile.bio || "",
                      phoneNumber: profile.phoneNumber || "",
                      address: profile.address || "",
                      website: profile.website || "",
                      companyName: profile.companyName || "",
                      profileImage: profile.profileImage || "",
                    });
                  }}
                  className="px-6 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg font-semibold transition"
                >
                  Cancel
                </button>
              </div>
            )}

            {/* Change Password Form */}
            {showPasswordForm && isOwnProfile && (
              <div className="mt-8 p-6 bg-gray-700 rounded-lg border border-gray-600">
                <h2 className="text-xl font-bold text-blue-400 mb-4">Change Password</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block mb-2 font-medium text-gray-300">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.oldPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          oldPassword: e.target.value,
                        })
                      }
                      className="w-full p-3 rounded-lg bg-gray-600 text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 font-medium text-gray-300">New Password</label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          newPassword: e.target.value,
                        })
                      }
                      className="w-full p-3 rounded-lg bg-gray-600 text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 font-medium text-gray-300">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          confirmPassword: e.target.value,
                        })
                      }
                      className="w-full p-3 rounded-lg bg-gray-600 text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex gap-4">
                    <button
                      onClick={handleChangePassword}
                      className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition"
                    >
                      Change Password
                    </button>
                    <button
                      onClick={() => {
                        setShowPasswordForm(false);
                        setPasswordData({
                          oldPassword: "",
                          newPassword: "",
                          confirmPassword: "",
                        });
                      }}
                      className="px-6 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg font-semibold transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;







