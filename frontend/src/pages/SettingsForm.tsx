import { useState } from "react";
import type { User } from "../types";
import { useMutation, useQueryClient } from "react-query";
import {
  changeUserEmail,
  changeUserPassword,
  deleteUser,
  updateUserCurrency,
  updateUserName,
} from "../api/user";

export default function SettingsForm({ user }: { user: User }) {
  const [name, setName] = useState<string>(user.name);
  const [email, setEmail] = useState<string>(user.email);
  const [currentPassword, setCurrenctPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [currency, setCurrency] = useState<string>(user.currency);
  const [isEditing, setIsEditing] = useState(false);
  const [isPasswordEditing, setIsPasswordEditing] = useState(false);

  // mutations
  const queryClient = useQueryClient();

  const nameMutation = useMutation({
    mutationFn: updateUserName,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });

  const emailMutation = useMutation({
    mutationFn: changeUserEmail,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
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
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });

  const currencyMutation = useMutation({
    mutationFn: updateUserCurrency,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });

  // axios
  const handleSaveAccount = () => {
    if (name !== user.name) nameMutation.mutate(name);
    if (email !== user.email) emailMutation.mutate(email);
  };

  const handleChangePassword = () => {
    if (currentPassword && newPassword) {
      passwordMutation.mutate({ currentPassword, newPassword });
    }
  };

  const handleSaveCurrency = () => {
    if (currency !== user.currency) {
      currencyMutation.mutate(currency);
    }
  };

  const handleDeleteUser = () => {
    deleteMutation.mutate();
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
          <div className="mx-6 text-xl space-y-2">
            <div className="flex gap-2">
              <span className="cursor-default">Name:</span>
              <input
                className="focus:outline-none"
                name="name"
                value={name}
                onClick={() => setIsEditing(true)}
                onChange={(e) => setName(e.target.value)}
                autoComplete="off"
              />
            </div>

            <div className="flex gap-2 items-center">
              <span className="cursor-default">Email:</span>
              <input
                className="focus:outline-none"
                name="email"
                value={email}
                onClick={() => setIsEditing(true)}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="off"
              />
            </div>
          </div>

          {isEditing ? (
            <div className="mt-6 mx-4">
              <button
                onClick={() => {
                  setIsEditing(false);
                  handleSaveAccount();
                }}
                className="2xl:text-xl text-white hover:bg-white/5 p-2 px-5 rounded-xl duration-100 cursor-pointer font-medium"
              >
                Save Changes
              </button>

              <button
                onClick={() => {
                  setIsEditing(false);
                  setName(user.name);
                  setEmail(user.email);
                }}
                className="2xl:text-xl text-red-400 hover:bg-red-500/10 p-2 px-5 rounded-xl duration-100 cursor-pointer font-medium"
              >
                Cancel
              </button>
            </div>
          ) : (
            <></>
          )}
        </div>

        {/* Security */}
        <div>
          <h2 className="2xl:text-2xl 2xl:mb-5 font-medium border-b border-white/30 pb-2.5">
            Security
          </h2>
          <div className="mx-6 text-xl space-y-1">
            {isPasswordEditing ? (
              <>
                <h3 className="mb-6 font-medium">Change Password</h3>
                <div className="flex flex-col space-y-8">
                  <div className="flex flex-col w-70 space-y-3">
                    <input
                      className="2xl:p-2 2xl:text-xl border border-white/50 rounded-lg focus:outline-none focus:border-white"
                      name="Current Password"
                      type="password"
                      value={currentPassword}
                      placeholder="Current Password"
                      onChange={(e) => setCurrenctPassword(e.target.value)}
                      autoComplete="off"
                    />

                    <input
                      className="2xl:p-2 2xl:text-xl border border-white/50 rounded-lg focus:outline-none focus:border-white"
                      name="New Password"
                      type="password"
                      value={newPassword}
                      placeholder="New Password"
                      onChange={(e) => setNewPassword(e.target.value)}
                      autoComplete="off"
                    />
                  </div>

                  <div>
                    <button
                      onClick={() => {
                        setIsPasswordEditing(false);
                        handleChangePassword();
                        setCurrenctPassword("");
                        setNewPassword("");
                      }}
                      className="2xl:text-xl text-white hover:bg-white/5 p-2 px-5 rounded-xl duration-100 cursor-pointer font-medium"
                    >
                      Save Changes
                    </button>

                    <button
                      onClick={() => {
                        setIsPasswordEditing(false);
                        setCurrenctPassword("");
                        setNewPassword("");
                      }}
                      className="2xl:text-xl text-red-400 hover:bg-red-500/10 p-2 px-5 rounded-xl duration-100 cursor-pointer font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <button
                onClick={() => setIsPasswordEditing(true)}
                className="hover:underline cursor-pointer"
              >
                Change Password
              </button>
            )}
          </div>
        </div>

        {/* Preferences */}
        <div>
          <h2 className="2xl:text-2xl 2xl:mb-5 font-medium border-b border-white/30 pb-2.5">
            Preferences
          </h2>
          <div className="mx-6 text-xl space-y-1">
            <div>
              <span className="cursor-default">Currency:</span>
              <select
                className="cursor-pointer bg-black focus:outline-none ml-3 2xl:text-lg"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              >
                <option onClick={handleSaveCurrency} value={"EUR"}>
                  €
                </option>
                <option onClick={handleSaveCurrency} value={"USD"}>
                  $
                </option>
                <option onClick={handleSaveCurrency} value={"UAH"}>
                  ₴
                </option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={handleDeleteUser}
        className="mt-25 2xl:text-xl text-red-400 hover:bg-red-500/10 p-2 px-5 rounded-xl duration-100 cursor-pointer font-medium"
      >
        Delete Account
      </button>
    </>
  );
}
