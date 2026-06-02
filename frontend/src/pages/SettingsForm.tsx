import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "react-query";
import axios from "axios";
import type { User } from "../types";
import {
  changeUserEmail,
  changeUserPassword,
  deleteUser,
  updateUserCurrency,
  updateUserName,
} from "../api/user";
import { logout } from "../api/auth";
import { useAuthStore } from "../store/useAuthStore";

export default function SettingsForm({ user }: { user: User }) {
  const [name, setName] = useState<string>(user.name);
  const [email, setEmail] = useState<string>(user.email);
  const [currentPassword, setCurrentPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [currency, setCurrency] = useState<string>(user.currency);

  const [isEditing, setIsEditing] = useState(false);
  const [isPasswordEditing, setIsPasswordEditing] = useState(false);

  const [nameError, setNameError] = useState<string[]>([]);
  const [emailError, setEmailError] = useState<string[]>([]);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);

  const clearAuth = useAuthStore((state) => state.clearAuth);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["user"] });
  };

  // mutations
  const nameMutation = useMutation({
    mutationFn: updateUserName,
    onSuccess: () => {
      setNameError([]);
      handleSuccess();
    },
    onError: (error: unknown) => {
      if (axios.isAxiosError(error) && error.response?.data?.errors) {
        setNameError(
          Object.values(error.response.data.errors).flat() as string[],
        );
      }
    },
  });

  const emailMutation = useMutation({
    mutationFn: changeUserEmail,
    onSuccess: () => {
      setEmailError([]);
      handleSuccess();
    },
    onError: (error: unknown) => {
      if (axios.isAxiosError(error) && error.response?.data?.errors) {
        setEmailError(
          Object.values(error.response.data.errors).flat() as string[],
        );
      }
    },
  });

  const passwordMutation = useMutation({
    mutationFn: ({
      currentPassword,
      newPassword,
    }: {
      currentPassword: string;
      newPassword: string;
    }) => changeUserPassword(currentPassword, newPassword),
    onSuccess: () => {
      setPasswordErrors([]);
      handleSuccess();
      // Close form only when successful
      setIsPasswordEditing(false);
      setCurrentPassword("");
      setNewPassword("");
    },
    onError: (error: unknown) => {
      if (axios.isAxiosError(error) && error.response?.data) {
        const responseData = error.response.data;

        // 1. Checking domain error (string from your UnauthorizedException)
        if (responseData.error && typeof responseData.error === "string") {
          setPasswordErrors([responseData.error]);
        }
        // 2. Checking validation errors (object with arrays)
        else if (
          responseData.errors &&
          typeof responseData.errors === "object"
        ) {
          // Object.values gets the arrays ["Too short"], and flat() merges them into one
          setPasswordErrors(
            Object.values(responseData.errors).flat() as string[],
          );
        } else {
          setPasswordErrors([
            "An unexpected error occurred. Please try again.",
          ]);
        }
      }
    },
  });

  const currencyMutation = useMutation({
    mutationFn: updateUserCurrency,
    onSuccess: () => handleSuccess(),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.clear();
      clearAuth();
      navigate("/");
    },
  });

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.clear();
      clearAuth();
      navigate("/");
    },
  });

  // Save Handlers
  const handleSaveAccount = async () => {
    // 1. Local validation (to avoid sending obvious garbage to the backend)
    let hasLocalError = false;
    if (!name.trim()) {
      setNameError(["Name cannot be empty"]);
      hasLocalError = true;
    }
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      setEmailError(["Invalid email format"]);
      hasLocalError = true;
    }

    if (hasLocalError) return;

    // 2. Sending to backend with error handling (try/catch is required for mutateAsync)
    try {
      const promises = [];
      if (name !== user.name) promises.push(nameMutation.mutateAsync(name));
      if (email !== user.email) promises.push(emailMutation.mutateAsync(email));

      if (promises.length > 0) {
        await Promise.all(promises);
      }

      // Close form only when both promises are successful
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to save account changes", error);
    }
  };

  const handleSavePassword = async () => {
    // Do not send request if fields are empty
    if (!currentPassword || !newPassword) {
      setPasswordErrors(["Please fill in both password fields"]);
      return;
    }

    // The mutation itself will close the form on onSuccess
    passwordMutation.mutate({ currentPassword, newPassword });
  };

  return (
    <>
      <h1 className="2xl:text-3xl 2xl:mb-10 font-medium">Settings</h1>

      <div className="mx-2 2xl:space-y-13">
        {/* Account */}
        <div>
          <h2 className="2xl:text-2xl 2xl:mb-5 font-medium border-b border-white/30 pb-2.5">
            Account
          </h2>
          <div className="mx-6 text-xl">
            <div className="flex gap-2 mb-0.5 items-center">
              <span className="cursor-default">Name:</span>
              <input
                className={`focus:outline-none bg-transparent border-b border-transparent ${isEditing ? "border-white/50 px-1" : ""}`}
                name="name"
                value={name}
                onClick={() => setIsEditing(true)}
                onChange={(e) => {
                  setName(e.target.value);
                  setNameError([]); // Reset error immediately when user starts typing a new value
                }}
                autoComplete="off"
                readOnly={!isEditing}
              />
            </div>
            {nameError.length > 0 && (
              <div className="text-red-400 text-sm space-y-1 mb-2">
                {nameError.map((err, i) => (
                  <div key={i}>• {err}</div>
                ))}
              </div>
            )}

            <div className="flex gap-2 items-center mt-2">
              <span className="cursor-default">Email:</span>
              <input
                className={`focus:outline-none bg-transparent border-b border-transparent ${isEditing ? "border-white/50 px-1" : ""}`}
                name="email"
                value={email}
                onClick={() => setIsEditing(true)}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailError([]); // Reset error immediately when user starts typing a new value
                }}
                autoComplete="off"
                readOnly={!isEditing}
              />
            </div>
            {emailError.length > 0 && (
              <div className="text-red-400 text-sm space-y-1 pl-2 mt-1">
                {emailError.map((err, i) => (
                  <div key={i}>• {err}</div>
                ))}
              </div>
            )}

            {!isEditing && (
              <button
                onClick={() => logoutMutation.mutate()}
                className="hover:underline cursor-pointer mt-5 text-sm text-gray-400"
              >
                Logout
              </button>
            )}
          </div>

          {isEditing && (
            <div className="mt-6 mx-4 flex gap-2">
              <button
                onClick={handleSaveAccount}
                disabled={
                  nameMutation.isLoading ||
                  emailMutation.isLoading ||
                  nameError.length > 0 ||
                  emailError.length > 0
                }
                className="2xl:text-xl text-white hover:bg-white/5 p-2 px-5 rounded-xl duration-100 cursor-pointer font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {nameMutation.isLoading || emailMutation.isLoading
                  ? "Saving..."
                  : "Save Changes"}
              </button>

              <button
                onClick={() => {
                  setIsEditing(false);
                  setName(user.name); // Rollback changes
                  setEmail(user.email); // Rollback changes
                  setNameError([]);
                  setEmailError([]);
                }}
                disabled={nameMutation.isLoading || emailMutation.isLoading}
                className="2xl:text-xl text-red-400 hover:bg-red-500/10 p-2 px-5 rounded-xl duration-100 cursor-pointer font-medium disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Security */}
        <div>
          <h2 className="2xl:text-2xl 2xl:mb-5 font-medium border-b border-white/30 pb-2.5 mt-10">
            Security
          </h2>
          <div className="mx-6 text-xl space-y-1">
            {isPasswordEditing ? (
              <>
                <h3 className="mb-6 font-medium">Change Password</h3>
                <div className="flex flex-col">
                  {passwordErrors.length > 0 && (
                    <div className="text-red-400 text-sm space-y-1 mb-5">
                      {passwordErrors.map((err, i) => (
                        <div key={i}>• {err}</div>
                      ))}
                    </div>
                  )}
                  <div className="flex flex-col w-70 space-y-3 mb-6">
                    <input
                      className="2xl:p-2 2xl:text-xl border border-white/50 rounded-lg focus:outline-none focus:border-white bg-transparent"
                      name="Current Password"
                      type="password"
                      value={currentPassword}
                      placeholder="Current Password"
                      onChange={(e) => {
                        setCurrentPassword(e.target.value);
                      }}
                      autoComplete="off"
                    />

                    <input
                      className="2xl:p-2 2xl:text-xl border border-white/50 rounded-lg focus:outline-none focus:border-white bg-transparent"
                      name="New Password"
                      type="password"
                      value={newPassword}
                      placeholder="New Password"
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                      }}
                      autoComplete="off"
                    />
                    <span className="text-white/40 text-xs pl-3">
                      Min 8 characters, 1 uppercase, 1 number
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={handleSavePassword}
                      disabled={passwordMutation.isLoading}
                      className="2xl:text-xl text-white hover:bg-white/5 p-2 px-5 rounded-xl duration-100 cursor-pointer font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {passwordMutation.isLoading
                        ? "Saving..."
                        : "Save Changes"}
                    </button>

                    <button
                      onClick={() => {
                        setPasswordErrors([]);
                        setIsPasswordEditing(false);
                        setCurrentPassword("");
                        setNewPassword("");
                      }}
                      disabled={passwordMutation.isLoading}
                      className="2xl:text-xl text-red-400 hover:bg-red-500/10 p-2 px-5 rounded-xl duration-100 cursor-pointer font-medium disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <button
                onClick={() => setIsPasswordEditing(true)}
                className="hover:underline cursor-pointer text-gray-300"
              >
                Change Password
              </button>
            )}
          </div>
        </div>

        {/* Preferences */}
        <div>
          <h2 className="2xl:text-2xl 2xl:mb-5 font-medium border-b border-white/30 pb-2.5 mt-10">
            Preferences
          </h2>
          <div className="mx-6 text-xl space-y-1">
            <div>
              <span className="cursor-default">Currency:</span>
              <select
                className="cursor-pointer bg-black focus:outline-none ml-3 2xl:text-lg border border-white/20 rounded px-2"
                value={currency}
                onChange={(e) => {
                  const newCurrency = e.target.value;
                  setCurrency(newCurrency);
                  if (newCurrency !== user.currency) {
                    currencyMutation.mutate(newCurrency);
                  }
                }}
              >
                {/* Remove onClick from <option>, this cannot be done */}
                <option value="EUR">€ EUR</option>
                <option value="USD">$ USD</option>
                <option value="UAH">₴ UAH</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={() => {
          if (window.confirm("Are you sure? This cannot be undone.")) {
            deleteMutation.mutate();
          }
        }}
        className="mt-25 mx-2 2xl:text-xl text-red-400 hover:bg-red-400/10 p-2 px-5 rounded-xl duration-100 cursor-pointer font-medium"
      >
        Delete Account
      </button>
    </>
  );
}
