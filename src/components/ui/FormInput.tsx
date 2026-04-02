import { useState } from "react";
import { Eye, EyeOff, LucideIcon } from "lucide-react";

interface Props {
  label: string;
  type?: string;
  name: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  error?: string;
  icon?: LucideIcon;
}

export default function FormInput({
  label,
  type = "text",
  name,
  value,
  onChange,
  placeholder,
  error,
  icon: Icon,
}: Props) {
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";

  return (
    <div className="space-y-1 w-full">
      <label className="text-xs text-gray-400 ml-1">{label}</label>

      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
            <Icon size={18} />
          </div>
        )}
        <input
          name={name}
          type={isPassword && showPassword ? "text" : type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full ${Icon ? 'pl-11 pr-4' : 'p-3'} py-3 rounded-xl text-sm outline-none border transition-all ${
            error
              ? "border-red-500 bg-red-50/30"
              : "border-gray-200 focus:border-purple-400 focus:ring-1 ring-purple-100"
          }`}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>

      {error && <p className="text-[10px] text-red-500 ml-1">{error}</p>}
    </div>
  );
}