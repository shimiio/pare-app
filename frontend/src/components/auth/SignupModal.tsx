import { useState } from "react";
import { useMutation } from "react-query";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import axios from "axios";
import Modal from "../ui/Modal";
import { register } from "../../api/auth";
import { useAuthStore } from "../../store/useAuthStore";

type Props = {
  onClose: () => void;
};

export default function SignupModal({ onClose }: Props) {
  const [isClosing, setIsClosing] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const setToken = useAuthStore((state) => state.setToken);
  const navigate = useNavigate();

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => onClose(), 200);
  };

  // mutation
  const mutation = useMutation({
    mutationFn: ({
      name,
      email,
      password,
    }: {
      name: string;
      email: string;
      password: string;
    }) => register(name, email, password),
    onSuccess: (response) => {
      setToken(response.data.jwtToken);
      navigate("/dashboard");
      onClose();
    },
    onError: (error: unknown) => {
      if (axios.isAxiosError(error) && error.response?.data) {
        const responseData = error.response.data;

        // 1. Checking domain error (string from your UnauthorizedException)
        if (responseData.error && typeof responseData.error === "string") {
          setErrors([responseData.error]);
        }
        // 2. Checking validation errors (object with arrays)
        else if (
          responseData.errors &&
          typeof responseData.errors === "object"
        ) {
          // Object.values gets the arrays ["Too short"], and flat() merges them into one
          setErrors(Object.values(responseData.errors).flat() as string[]);
        } else {
          setErrors(["An unexpected error occurred. Please try again."]);
        }
      }
    },
  });

  // handle
  const handleSignup = async (e: React.SubmitEvent) => {
    e.preventDefault();
    mutation.mutate({ name, email, password });
  };

  return (
    <Modal
      onClose={handleClose}
      isClosing={isClosing}
      className="max-w-sm w-full"
    >
      <form
        onSubmit={handleSignup}
        className="flex flex-col w-full text-left select-none"
      >
        {/* HEADER */}
        <div className="p-4 pt-5 px-6 flex justify-between items-center border-b border-white/5">
          <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-widest px-1">
            Sign Up
          </h3>
          <button
            type="button"
            onClick={handleClose}
            className="text-neutral-500 hover:text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* FORM CONTENT */}
        <div className="p-6 space-y-4">
          {/* Name */}
          <div className="flex flex-col">
            <label className="text-[10px] font-semibold text-neutral-500 uppercase tracking-widest px-1 mb-0.5 2xl:mb-1">
              Name
            </label>
            <input
              name="name"
              value={name}
              placeholder="Name"
              onChange={(e) => setName(e.target.value)}
              autoComplete="off"
              className="w-full bg-[#121212]/50 border border-white/5 rounded-xl py-2.5 px-4 text-xs 2xl:text-sm text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-indigo-500/50 transition-all"
            />
          </div>

          {/* Email */}
          <div className="flex flex-col">
            <label className="text-[10px] font-semibold text-neutral-500 uppercase tracking-widest px-1 mb-0.5 2xl:mb-1">
              Email address
            </label>
            <input
              name="email"
              value={email}
              placeholder="email@gmail.com"
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="off"
              className="w-full bg-[#121212]/50 border border-white/5 rounded-xl py-2.5 px-4 text-xs 2xl:text-sm text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-indigo-500/50 transition-all"
            />
          </div>

          {/* Password */}
          <div className="flex flex-col">
            <label className="text-[10px] font-semibold text-neutral-500 uppercase tracking-widest mb-0.5 2xl:px-1">
              Password
            </label>
            <div>
              <input
                type="password"
                name="password"
                value={password}
                placeholder="••••••••"
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="off"
                className="w-full bg-[#121212]/50 border border-white/5 rounded-xl py-2.5 px-4 text-xs 2xl:text-sm text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-indigo-500/50 transition-all [&::-ms-reveal]:invert [&::-ms-reveal]:opacity-60 [&::-webkit-credentials-store-indicator]:invert"
              />
              <span className="text-white/40 text-[10px] 2xl:text-xs pl-3">
                Min 8 characters, 1 uppercase, 1 number
              </span>
            </div>
          </div>
        </div>

        {/* FOOTER & ACTIONS */}
        <div className="p-5 border-t border-white/5 bg-[#0a0a0a]/70">
          {errors.length > 0 && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs space-y-1">
              {errors.map((err, i) => (
                <div key={i}>• {err}</div>
              ))}
            </div>
          )}

          <button
            type="submit"
            disabled={mutation.isLoading}
            className="flex justify-center items-center cursor-pointer w-full bg-linear-to-br from-pink-400/15 via-violet-500/10 to-blue-500/20 hover:bg-violet-400/5 text-white py-3 rounded-xl text-xs 2xl:text-sm font-semibold shadow-md shadow-indigo-600/10 transition-all active:scale-98"
          >
            {mutation.isLoading ? "Logging in..." : "Sign Up"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
