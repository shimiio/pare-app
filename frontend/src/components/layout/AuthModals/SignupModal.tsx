import { useState } from "react";
import AuthInput from "../../ui/AuthInput";

type Props = {
  onClose: () => void;
};

export default function SignupModal({ onClose }: Props) {
  const [isClosing, setIsClosing] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => onClose(), 200);
  };

  const handleSignup = () => {
    console.log(name, email, password);
  };

  return (
    <div
      className={`flex fixed inset-0 items-center justify-center bg-black/10 backdrop-blur-sm ${isClosing ? "animate-fadeOut" : "animate-fadeIn"}`}
      onClick={handleClose}
    >
      <div
        className={`flex flex-col relative bg-black/60 backdrop-blur-sm border border-white/50 2xl:w-110 rounded-3xl 2xl:p-13 2xl:py-18 ${isClosing ? "animate-scaleOut" : "animate-scaleIn"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-6 right-1/12 cursor-pointer text-white duration-200 transition ease-in-out hover:text-white/60 2xl:text-2xl"
          onClick={handleClose}
        >
          ✕
        </button>

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
          className="cursor-pointer bg-white/15 duration-200 transition ease-in-out hover:bg-white/20 rounded-xl 2xl:p-2.5 2xl:mx-10 2xl:text-xl"
          onClick={handleSignup}
        >
          Sign Up
        </button>
      </div>
    </div>
  );
}
