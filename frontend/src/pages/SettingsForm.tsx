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
import { extractErrors } from "../utils/errorUtils";

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
      setNameError(extractErrors(error));
    },
  });

  const emailMutation = useMutation({
    mutationFn: changeUserEmail,
    onSuccess: () => {
      setEmailError([]);
      handleSuccess();
    },
    onError: (error: unknown) => {
      if (axios.isAxiosError(error) && error.response?.data) {
        const responseData = error.response.data;

        // 1. Checking domain error (string from your UnauthorizedException)
        if (responseData.error && typeof responseData.error === "string") {
          setEmailError([responseData.error]);
        }
        // 2. Checking validation errors (object with arrays)
        else if (
          responseData.errors &&
          typeof responseData.errors === "object"
        ) {
          // Object.values gets the arrays ["Too short"], and flat() merges them into one
          setEmailError(Object.values(responseData.errors).flat() as string[]);
        } else {
          setEmailError(["An unexpected error occurred. Please try again."]);
        }
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
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Account */}
      <div className="mb-8 max-w-2xl">
        <h3 className="text-lg font-medium text-white mb-4">Account</h3>

        <div className="bg-[#121212]/40 border border-white/5 rounded-xl flex flex-col">
          {/* Name */}
          <div className="p-4 border-b border-white/5">
            <label className="block text-xs text-neutral-500 uppercase tracking-wider mb-1">
              Name
            </label>
            <input
              className={`w-full bg-transparent text-sm font-medium text-neutral-200 focus:outline-none transition-colors ${
                isEditing
                  ? "border-b border-white/30 pb-1"
                  : "border-b border-transparent pb-1 cursor-pointer"
              }`}
              name="name"
              value={name}
              onClick={() => setIsEditing(true)}
              onChange={(e) => {
                setName(e.target.value);
                setNameError([]);
              }}
              autoComplete="off"
              readOnly={!isEditing}
            />
            {nameError.length > 0 && (
              <div className="text-red-400 text-xs mt-2 space-y-1">
                {nameError.map((err, i) => (
                  <div key={i}>• {err}</div>
                ))}
              </div>
            )}
          </div>

          {/* Email */}
          <div className="p-4 border-b border-white/5">
            <label className="block text-xs text-neutral-500 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <input
              className={`w-full bg-transparent text-sm font-medium text-neutral-200 focus:outline-none transition-colors ${
                isEditing
                  ? "border-b border-white/30 pb-1"
                  : "border-b border-transparent pb-1 cursor-pointer"
              }`}
              name="email"
              value={email}
              onClick={() => setIsEditing(true)}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailError([]);
              }}
              autoComplete="off"
              readOnly={!isEditing}
            />
            {emailError.length > 0 && (
              <div className="text-red-400 text-xs mt-2 space-y-1">
                {emailError.map((err, i) => (
                  <div key={i}>• {err}</div>
                ))}
              </div>
            )}
          </div>

          {/* Footer card */}
          <div className="p-4 bg-white/1 rounded-b-xl flex items-center justify-between">
            {!isEditing ? (
              <button
                onClick={() => logoutMutation.mutate()}
                className="text-xs font-medium text-neutral-500 hover:text-white transition-colors cursor-pointer"
              >
                Logout
              </button>
            ) : (
              <div className="flex gap-3 w-full justify-end">
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setName(user.name);
                    setEmail(user.email);
                    setNameError([]);
                    setEmailError([]);
                  }}
                  disabled={nameMutation.isLoading || emailMutation.isLoading}
                  className="px-4 py-1.5 rounded-lg text-xs font-medium text-neutral-400 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveAccount}
                  disabled={
                    nameMutation.isLoading ||
                    emailMutation.isLoading ||
                    nameError.length > 0 ||
                    emailError.length > 0
                  }
                  className="px-4 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {nameMutation.isLoading || emailMutation.isLoading
                    ? "Saving..."
                    : "Save Changes"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="mb-8 max-w-2xl">
        <h3 className="text-lg font-medium text-white mb-4">Security</h3>

        <div className="bg-[#121212]/40 border border-white/5 rounded-xl p-4">
          {!isPasswordEditing ? (
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-neutral-200">Password</p>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Change your password to keep your account secure.
                </p>
              </div>
              <button
                onClick={() => setIsPasswordEditing(true)}
                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-medium text-neutral-200 transition-colors cursor-pointer"
              >
                Change Password
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <p className="text-sm font-medium text-neutral-200">
                Change Password
              </p>

              {passwordErrors.length > 0 && (
                <div className="text-red-400 text-xs space-y-1">
                  {passwordErrors.map((err, i) => (
                    <div key={i}>• {err}</div>
                  ))}
                </div>
              )}

              <div className="flex flex-col gap-3 max-w-sm">
                <input
                  className="bg-[#161616] border border-white/10 rounded-lg px-3 py-2 text-sm text-neutral-200 focus:border-white/30 focus:outline-none placeholder-neutral-600 transition-colors"
                  name="Current Password"
                  type="password"
                  value={currentPassword}
                  placeholder="Current Password"
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  autoComplete="off"
                />
                <input
                  className="bg-[#161616] border border-white/10 rounded-lg px-3 py-2 text-sm text-neutral-200 focus:border-white/30 focus:outline-none placeholder-neutral-600 transition-colors"
                  name="New Password"
                  type="password"
                  value={newPassword}
                  placeholder="New Password"
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="off"
                />
                <span className="text-neutral-500 text-xs">
                  Min 8 characters, 1 uppercase, 1 number
                </span>
              </div>

              <div className="flex gap-3 mt-2">
                <button
                  onClick={handleSavePassword}
                  disabled={passwordMutation.isLoading}
                  className="px-4 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {passwordMutation.isLoading ? "Saving..." : "Save Password"}
                </button>
                <button
                  onClick={() => {
                    setPasswordErrors([]);
                    setIsPasswordEditing(false);
                    setCurrentPassword("");
                    setNewPassword("");
                  }}
                  disabled={passwordMutation.isLoading}
                  className="px-4 py-1.5 rounded-lg text-xs font-medium text-neutral-400 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Preferences */}
      <div className="mb-10 max-w-2xl">
        <h3 className="text-lg font-medium text-white mb-4">Preferences</h3>

        <div className="bg-[#121212]/40 border border-white/5 rounded-xl p-4 flex flex-col divide-y divide-white/5">
          <div className="flex items-center justify-between pb-2">
            <div>
              <p className="text-sm font-medium text-neutral-200">
                Primary Currency
              </p>
              <p className="text-xs text-neutral-500 mt-0.5">
                Choose the currency for your analytics and subscription costs.
              </p>
            </div>

            <div className="relative">
              <select
                className="appearance-none bg-[#161616] border border-white/10 text-sm rounded-lg text-neutral-200 pl-3 pr-8 py-1.5 focus:outline-none focus:border-white/30 cursor-pointer transition-colors divide-y"
                value={currency}
                onChange={(e) => {
                  const newCurrency = e.target.value;
                  setCurrency(newCurrency);
                  if (newCurrency !== user.currency) {
                    currencyMutation.mutate(newCurrency);
                  }
                }}
              >
                <option value="EUR">€ EUR</option>
                <option value="USD">$ USD</option>
                <option value="GBP">£ GBP</option>
                <option value="UAH">₴ UAH</option>
                <option value="CZK">Kč CZK</option>
                <option value="PLN">zł PLN</option>
                <option value="JPY">¥ JPY</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-neutral-500 text-xs">
                ▼
              </div>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-200 pt-2">
              Email Notifications
            </p>
            <p className="text-xs text-neutral-500 mt-0.5">
              You will receive a smart reminder 3 days before any subscription
              billing date.
            </p>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="max-w-2xl">
        <h3 className="text-lg font-medium text-red-500 mb-4">Danger Zone</h3>

        <div className="border border-red-900/30 bg-red-950/5 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-red-200">Delete Account</p>
            <p className="text-xs text-neutral-500 mt-0.5">
              Permanently remove your account and all subscription data.
            </p>
          </div>

          <button
            onClick={() => {
              if (
                window.confirm(
                  "Are you sure? This action cannot be undone and you will lose all data.",
                )
              ) {
                deleteMutation.mutate();
              }
            }}
            className="px-4 py-2 bg-red-950/20 hover:bg-red-900/40 border border-red-500/30 hover:border-red-500/50 rounded-lg text-xs font-medium text-red-400 transition-colors cursor-pointer"
          >
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}
