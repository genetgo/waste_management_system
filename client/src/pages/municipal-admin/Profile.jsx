import React, { useEffect, useState } from "react";
import API from "../../services/api";

const Profile = () => {
    const [loading, setLoading] = useState(true);

    const [profile, setProfile] = useState({
        full_name: "",
        email: "",
        phone_number: "",
        assigned_kifle_ketema: "",
        last_login: "",
    });

    const [passwords, setPasswords] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await API.get("/auth/profile");

            if (res.data.success) {
                setProfile(res.data.data);
            }
        } catch (err) {
            console.error(err);

            setProfile({
                full_name: "hana kebe",
                email: "hana@gmail.com",
                phone_number: "0978787865",
                assigned_kifle_ketema: "Menkorer",
                last_login: "",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setProfile({
            ...profile,
            [e.target.name]: e.target.value,
        });
    };

    const handlePasswordChange = (e) => {
        setPasswords({
            ...passwords,
            [e.target.name]: e.target.value,
        });
    };

    const updateProfile = async () => {
        try {
            await API.put("/auth/profile", {
                full_name: profile.full_name,
                email: profile.email,
                phone_number: profile.phone_number,
            });

            alert("Profile updated successfully.");
            fetchProfile();
        } catch (err) {
            alert(
                err.response?.data?.message ||
                "Profile update failed."
            );
        }
    };

    const changePassword = async () => {
        if (
            passwords.newPassword !==
            passwords.confirmPassword
        ) {
            return alert("Passwords do not match.");
        }

        try {
            await API.put("/auth/change-password", {
                currentPassword: passwords.currentPassword,
                newPassword: passwords.newPassword,
            });

            alert("Password changed successfully.");

            setPasswords({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });

        } catch (err) {
            alert(
                err.response?.data?.message ||
                "Failed to change password."
            );
        }
    };

    if (loading) {
        return (
            <div className="p-8 text-center">
                Loading...
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto p-6 space-y-6">

            {/* Header */}

            <div>
                <h1 className="text-3xl font-bold text-gray-800">
                    Municipal Administrator Profile
                </h1>

                <p className="text-gray-500 mt-2">
                    Manage your account information
                </p>
            </div>

            {/* Summary */}

            <div className="bg-white rounded-2xl shadow border p-6">

                <h2 className="text-2xl font-bold">
                    {profile.full_name}
                </h2>

                <p className="text-gray-500">
                    Municipal Administrator
                </p>

                <p className="mt-2">
                    📍 {profile.assigned_kifle_ketema}
                </p>

                <p>
                    🕒 Last Login: {profile.last_login || "-"}
                </p>

            </div>

            {/* Personal Information */}

            <div className="bg-white rounded-2xl shadow border p-6">

                <h2 className="text-xl font-bold mb-6">
                    Personal Information
                </h2>

                <div className="grid md:grid-cols-2 gap-5">

                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Full Name
                        </label>

                        <input
                            type="text"
                            name="full_name"
                            value={profile.full_name}
                            onChange={handleChange}
                            className="w-full border rounded-lg px-4 py-3"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Email Address
                        </label>

                        <input
                            type="email"
                            name="email"
                            value={profile.email}
                            onChange={handleChange}
                            className="w-full border rounded-lg px-4 py-3"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Phone Number
                        </label>

                        <input
                            type="text"
                            name="phone_number"
                            value={profile.phone_number}
                            onChange={handleChange}
                            className="w-full border rounded-lg px-4 py-3"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Assigned Kifle Ketema
                        </label>

                        <input
                            type="text"
                            value={profile.assigned_kifle_ketema}
                            disabled
                            className="w-full border rounded-lg px-4 py-3 bg-gray-100"
                        />
                    </div>

                </div>

                <div className="mt-8">

                    <button
                        onClick={updateProfile}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
                    >
                        Update Profile
                    </button>

                </div>

            </div>

            {/* Change Password */}

            <div className="bg-white rounded-2xl shadow border p-6">

                <h2 className="text-xl font-bold mb-6">
                    Change Password
                </h2>

                <div className="space-y-4">

                    <input
                        type="password"
                        name="currentPassword"
                        placeholder="Current Password"
                        value={passwords.currentPassword}
                        onChange={handlePasswordChange}
                        className="w-full border rounded-lg px-4 py-3"
                    />

                    <input
                        type="password"
                        name="newPassword"
                        placeholder="New Password"
                        value={passwords.newPassword}
                        onChange={handlePasswordChange}
                        className="w-full border rounded-lg px-4 py-3"
                    />

                    <input
                        type="password"
                        name="confirmPassword"
                        placeholder="Confirm New Password"
                        value={passwords.confirmPassword}
                        onChange={handlePasswordChange}
                        className="w-full border rounded-lg px-4 py-3"
                    />

                </div>

                <div className="mt-8">

                    <button
                        onClick={changePassword}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg"
                    >
                        Change Password
                    </button>

                </div>

            </div>

        </div>
    );
};

export default Profile;