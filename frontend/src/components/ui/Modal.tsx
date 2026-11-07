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
      className={`flex fixed inset-0 items-center justify-center p-3 bg-black/50 z-50 ${isClosing ? "animate-fadeOut" : "animate-fadeIn"}`}
      onClick={onClose}
    >
      <div
        className={`bg-[#0c0c0c]/40 backdrop-blur-md border border-white/5 rounded-2xl max-h-full overflow-y-auto ${isClosing ? "animate-scaleOut" : "animate-scaleIn"} ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
