import { useMutation, useQueryClient } from "react-query";
import { useState } from "react";
import { changeUserPassword } from "../../api/user";
import axios from "axios";

export default function SecuritySection() {
  const [isPasswordEditing, setIsPasswordEditing] = useState(false);
  const [currentPassword, setCurrentPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);

  const queryClient = useQueryClient();

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["user"] });
  };

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
                className="bg-[#161616] border border-white/10 rounded-lg px-3 py-2 text-sm text-neutral-200 focus:outline-none focus:border-indigo-500/50 placeholder-neutral-600 transition-colors"
                name="Current Password"
                type="password"
                value={currentPassword}
                placeholder="Current Password"
                onChange={(e) => setCurrentPassword(e.target.value)}
                autoComplete="off"
              />
              <input
                className="bg-[#161616] border border-white/10 rounded-lg px-3 py-2 text-sm text-neutral-200 focus:outline-none focus:border-indigo-500/50 placeholder-neutral-600 transition-colors"
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
  );
}
