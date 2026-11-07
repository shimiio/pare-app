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
      className={`flex fixed inset-0 items-end md:items-center justify-center md:p-3 bg-black/50 z-50 ${isClosing ? "animate-fadeOut" : "animate-fadeIn"}`}
      onClick={onClose}
    >
      <div
        className={`bg-[#0c0c0c]/90 md:bg-[#0c0c0c]/40 backdrop-blur-md border border-b-0 md:border-b border-white/5 rounded-t-2xl md:rounded-2xl max-h-[90dvh] md:max-h-full overflow-y-auto overscroll-contain pb-[env(safe-area-inset-bottom)] md:pb-0 ${isClosing ? "animate-modalOut" : "animate-modalIn"} ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
