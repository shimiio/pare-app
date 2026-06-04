import { useState } from "react";
import { useMutation } from "react-query";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Modal from "../ui/Modal";
import AuthInput from "../ui/AuthInput";
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
    <Modal onClose={handleClose} isClosing={isClosing} className="2xl:w-110">
      <form onSubmit={handleSignup} className="flex flex-col w-full">
        <h2 className="font-medium 2xl:text-3xl 2xl:mb-12">Sign Up</h2>
        <div className="flex flex-col 2xl:gap-5 2xl:mb-15">
          {/* Error Messages */}
          {errors.length > 0 && (
            <div className="text-red-400 text-sm space-y-1">
              {errors.map((err, i) => (
                <div key={i}>• {err}</div>
              ))}
            </div>
          )}

          <AuthInput
            name="name"
            value={name}
            placeholder="Name"
            onChange={(e) => setName(e.target.value)}
          />

          <AuthInput
            name="email"
            value={email}
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
          />

          <div className="flex flex-col">
            <AuthInput
              name="password"
              type="password"
              value={password}
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
            />
            <span className="text-white/40 text-xs pl-3 mt-2">
              Min 8 characters, 1 uppercase, 1 number
            </span>
          </div>
        </div>
        <button
          type="submit"
          className="cursor-pointer bg-white/5 duration-200 transition ease-in-out hover:bg-white/15 active:bg-white/10 rounded-xl 2xl:p-2.5 2xl:mx-10 2xl:text-xl"
        >
          Sign Up
        </button>
      </form>
    </Modal>
  );
}
