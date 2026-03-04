import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface Props {
  label: string;
  type?: string;
  name: string; // Added this property
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; // Improved type safety
  placeholder?: string;
  error?: string;
}

export default function FormInput({
  label,
  type = "text",
  name, // Destructure name here
  value,
  onChange,
  placeholder,
  error,
}: Props) {
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";

  return (
    <div className="space-y-1 w-full">
      <label className="text-xs text-gray-400 ml-1">{label}</label>

      <div className="relative">
        <input
          name={name} // Pass name to the input
          type={isPassword && showPassword ? "text" : type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full p-3 rounded-xl text-sm outline-none border transition-all ${
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