import { useMutation, useQueryClient } from "react-query";
import { useState } from "react";
import { updateUserCurrency } from "../../api/user";
import axios from "axios";
import type { User } from "../../types";
import {
  sendVerificationEmail,
  verifyEmail,
} from "../../api/emailVerification";

export default function PreferencesSection({ user }: { user: User }) {
  const [currency, setCurrency] = useState<string>(user.currency);
  const [verificationCode, setVerificationCode] = useState<string>("");
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [sendError, setSendError] = useState("");
  const [verifyError, setVerifyError] = useState("");

  const queryClient = useQueryClient();

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["user"] });
  };

  const currencyMutation = useMutation({
    mutationFn: updateUserCurrency,
    onSuccess: () => handleSuccess(),
  });

  const sendCodeMutation = useMutation({
    mutationFn: sendVerificationEmail,
    onSuccess: () => {
      setIsCodeSent(true);
      setSendError("");
      setVerifyError("");
    },
    onError: (error: unknown) => {
      let backendError = axios.isAxiosError(error)
        ? error.response?.data?.error
        : undefined;

      if (backendError && backendError.includes("Too many request")) {
        backendError = "Please wait a minute before requesting a new code.";
      }

      setSendError(backendError || "Failed to send code. Please try again.");
    },
  });

  const verifyCodeMutation = useMutation({
    mutationFn: verifyEmail,
    onSuccess: () => {
      setIsCodeSent(false);
      setVerificationCode("");
      setVerifyError("");
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
    onError: (error: unknown) => {
      const backendError = axios.isAxiosError(error)
        ? error.response?.data?.error
        : undefined;
      setVerifyError(backendError || "Invalid verification code");
    },
  });

  return (
    <>
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
                className="appearance-none bg-[#161616] border border-white/10 text-sm rounded-lg text-neutral-200 pl-3 pr-8 py-1.5 focus:outline-none focus:border-indigo-500/50 cursor-pointer transition-colors divide-y"
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
            {!user.isEmailVerified && (
              <div className="mt-3 bg-amber-950/10 border border-amber-500/20 rounded-lg p-3 transition-all">
                {!isCodeSent ? (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-xs text-amber-200/80 leading-relaxed">
                        <span className="font-medium text-amber-500">
                          Action required:
                        </span>{" "}
                        Verify your email address to enable smart reminders.
                      </p>
                      <button
                        onClick={() => sendCodeMutation.mutate()}
                        disabled={sendCodeMutation.isLoading}
                        className="shrink-0 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg text-xs font-medium text-amber-500 transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        Send Code
                      </button>
                    </div>

                    {sendError && (
                      <p className="text-red-400 text-xs mt-1">• {sendError}</p>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <p className="text-xs text-amber-200/80">
                      We sent a code to{" "}
                      <span className="text-amber-500 font-medium">
                        {user.email}
                      </span>
                      . Enter it below:
                    </p>

                    <div className="flex items-center gap-5 mt-1 ml-3">
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="000000"
                        value={verificationCode}
                        onChange={(e) => {
                          setVerificationCode(
                            e.target.value.replace(/\D/g, ""),
                          );
                          // Clear the error
                          if (verifyError) setVerifyError("");
                        }}
                        // If there is an error, we highlight the inputs in red
                        className={`w-24 bg-[#161616] border ${
                          verifyError
                            ? "border-red-500 focus:border-red-400"
                            : "border-amber-500/30 focus:border-amber-500"
                        } rounded-md px-3 py-1.5 text-sm text-amber-100 placeholder-amber-900/50 focus:outline-none text-center tracking-widest transition-colors`}
                      />

                      <div>
                        <button
                          onClick={() =>
                            verifyCodeMutation.mutate(verificationCode)
                          }
                          disabled={verificationCode.length !== 6}
                          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-amber-950 rounded-md text-xs font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-amber-500 cursor-pointer"
                        >
                          Verify
                        </button>

                        <button
                          onClick={() => {
                            setIsCodeSent(false);
                            setVerificationCode("");
                            setVerifyError("");
                            setSendError("");
                          }}
                          className="px-2 py-1.5 text-xs text-neutral-500 hover:text-neutral-300 transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>

                      {verifyError && (
                        <p className="text-red-400 text-xs">{verifyError}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
