import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  const initializeAuth = useAuthStore((state) => state.initializeAuth);
  const navigate = useNavigate();

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => onClose(), 200);
  };

  const handleSignup = async () => {
    const response = await register(name, email, password);
    localStorage.setItem("jwtToken", response.data.jwtToken);
    initializeAuth(response.data.jwtToken);
    navigate("/dashboard");
  };

  return (
    <Modal onClose={handleClose} isClosing={isClosing} className="2xl:w-110">
      <h2 className="font-medium 2xl:text-3xl 2xl:mb-12">Sign Up</h2>

      <div className="flex flex-col 2xl:gap-5 2xl:mb-15">
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
        onClick={handleSignup}
      >
        Sign Up
      </button>
    </Modal>
  );
}
