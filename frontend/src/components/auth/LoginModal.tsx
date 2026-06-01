import { useState } from "react";
import { useMutation } from "react-query";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Modal from "../ui/Modal";
import AuthInput from "../ui/AuthInput";
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

  // mutation
  const mutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      login(email, password),
    onSuccess: (response) => {
      setToken(response.data.jwtToken);
      navigate("/dashboard");
      onClose();
    },
    onError: (error: unknown) => {
      if (axios.isAxiosError(error)) {
        const data = error.response?.data?.errors as
          | Record<string, string[]>
          | undefined;
        if (data) {
          const messages = Object.values(data).flat();
          setErrors(messages);
        }
      }
    },
  });

  // handle
  const handleLogin = async () => {
    mutation.mutate({ email, password });
  };

  return (
    <Modal onClose={handleClose} isClosing={isClosing} className="2xl:w-110">
      <h2 className="font-medium 2xl:text-3xl 2xl:mb-12">Log In</h2>

      <div className="flex flex-col 2xl:gap-5 2xl:mb-15">
        {errors.length > 0 && (
          <div className="text-red-400 text-sm space-y-1">
            {errors.map((err, i) => (
              <div key={i}>• {err}</div>
            ))}
          </div>
        )}
        
        <AuthInput
          name="email"
          value={email}
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <AuthInput
          name="password"
          type="password"
          value={password}
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <button
        className="cursor-pointer bg-white/5 duration-200 transition ease-in-out hover:bg-white/15 rounded-xl 2xl:p-2.5 2xl:mx-10 2xl:text-xl"
        onClick={handleLogin}
      >
        Log In
      </button>
    </Modal>
  );
}
