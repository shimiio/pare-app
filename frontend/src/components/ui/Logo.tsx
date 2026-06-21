import { Sparkle } from "lucide-react";

export default function Logo() {
  return (
    <div className="flex items-center justify-center">
      <linearGradient
        id="my-lucide-gradient"
        x1="0"
        y1="0"
        x2="24"
        y2="24"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0%" stopColor="#ec4899" /> {/* Tailwind pink-500 */}
        <stop offset="50%" stopColor="#8b5cf6" /> {/* Tailwind violet-500 */}
        <stop offset="100%" stopColor="#3b82f6" /> {/* Tailwind blue-500 */}
      </linearGradient>

      <Sparkle className="h-5 w-5 stroke-[url(#my-lucide-gradient)] drop-shadow-lg" />
    </div>
  );
}
