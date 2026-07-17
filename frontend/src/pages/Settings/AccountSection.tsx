import { useMutation, useQueryClient } from "react-query";
import { logout } from "../../api/auth";
import { useState } from "react";
import type { User } from "../../types";
import { changeUserEmail, updateUserName } from "../../api/user";
import { extractErrors } from "../../utils/errorUtils";
import axios from "axios";
import { useAuthStore } from "../../store/useAuthStore";
import { useNavigate } from "react-router-dom";

export default function AccountSection({ user }: { user: User }) {
  const [name, setName] = useState<string>(user.name);
  const [email, setEmail] = useState<string>(user.email);
  const [nameError, setNameError] = useState<string[]>([]);
  const [emailError, setEmailError] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  const clearAuth = useAuthStore((state) => state.clearAuth);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["user"] });
  };

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

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.clear();
      clearAuth();
      navigate("/");
    },
  });

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

  return (
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
            {!user.isEmailVerified && (
              <span className="text-[10px] ml-1 bg-amber-950/30 text-amber-500 px-1.5 py-0.5 rounded border border-amber-900/30 lowercase tracking-normal">
                unverified
              </span>
            )}
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
  );
}
