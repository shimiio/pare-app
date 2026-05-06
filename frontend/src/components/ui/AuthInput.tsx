interface AuthInputProps {
  name: string;
  value: string;
  placeholder: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
}

export default function AuthInput({
  name,
  value,
  placeholder,
  onChange,
  type = "text",
}: AuthInputProps) {
  return (
    <input
      className="2xl:p-2 2xl:text-xl border border-white/50 rounded-lg focus:outline-none focus:border-white"
      name={name}
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={onChange}
      autoComplete="off"
    />
  );
}
