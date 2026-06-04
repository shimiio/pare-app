import { Plus } from "lucide-react";

interface ModalProps {
  onClose: () => void;
  isClosing: boolean;
  className?: string;
  children: React.ReactNode;
}

export default function Modal({
  onClose,
  isClosing,
  className,
  children,
}: ModalProps) {
  return (
    <div
      className={`flex fixed inset-0 items-center justify-center bg-black/50 ${isClosing ? "animate-fadeOut" : "animate-fadeIn"}`}
      onClick={onClose}
    >
      <div
        className={`flex flex-col relative bg-black/30 backdrop-blur-md rounded-3xl px-10 pb-8 pt-18 ${isClosing ? "animate-scaleOut" : "animate-scaleIn"} ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-4 right-4 cursor-pointer text-white duration-200 hover:bg-white/15 active:bg-white/10 rounded-full 2xl:p-1"
          onClick={onClose}
        >
          <Plus className="rotate-45 h-8 w-8" />
        </button>
        {children}
      </div>
    </div>
  );
}
