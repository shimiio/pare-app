import { useState } from "react";
import { useMutation } from "react-query";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import axios from "axios";
import Modal from "../ui/Modal";
import { login } from "../../api/auth";
import { useAuthStore } from "../../store/useAuthStore";

type Props = {
  onClose: () => void;
};

export default function LoginModal({ onClose }: Props) {
  const [isClosing, setIsClosing] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const setToken = useAuthStore((state) => state.setToken);
  const navigate = useNavigate();

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => onClose(), 200);
  };

  const mutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      login(email, password),
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
          setErrors(Object.values(responseData.errors).flat() as string[]);
        } else {
          setErrors(["An unexpected error occurred. Please try again."]);
        }
      }
    },
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({ email, password });
  };

  return (
    <Modal
      onClose={handleClose}
      isClosing={isClosing}
      className="max-w-sm w-full"
    >
      <form
        onSubmit={handleLogin}
        className="flex flex-col w-full text-left select-none"
      >
        {/* HEADER */}
        <div className="p-4 pt-5 px-6 flex justify-between items-center border-b border-white/5">
          <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-widest px-1">
            Log In
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
            <label className="text-[10px] font-semibold text-neutral-500 uppercase tracking-widest mb-0.5 2xl:mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={password}
              placeholder="••••••••"
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="off"
              className="w-full bg-[#121212]/50 border border-white/5 rounded-xl py-2.5 px-4 text-xs 2xl:text-sm text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-indigo-500/50 transition-all [&::-ms-reveal]:invert [&::-ms-reveal]:opacity-60 [&::-webkit-credentials-store-indicator]:invert"
            />
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
            {mutation.isLoading ? "Logging in..." : "Log In"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
