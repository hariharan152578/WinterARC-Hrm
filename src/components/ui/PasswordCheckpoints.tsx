import { Check, X } from "lucide-react";

interface Props {
  password: string;
}

export default function PasswordCheckpoints({ password }: Props) {
  const checkpoints = [
    { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
    { label: "At least one uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
    { label: "At least one lowercase letter", test: (p: string) => /[a-z]/.test(p) },
    { label: "At least one number", test: (p: string) => /[0-9]/.test(p) },
    { label: "At least one special character", test: (p: string) => /[^A-Za-z0-9]/.test(p) },
  ];

  if (!password) return null;

  return (
    <div className="mt-3 space-y-2 p-4 bg-gray-50 rounded-2xl border border-gray-100">
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Password Requirements</p>
      <div className="grid grid-cols-1 gap-2">
        {checkpoints.map((checkpoint, index) => {
          const isMet = checkpoint.test(password);
          return (
            <div key={index} className="flex items-center gap-2">
              <div className={`p-0.5 rounded-full ${isMet ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-400'}`}>
                {isMet ? <Check size={10} /> : <X size={10} />}
              </div>
              <span className={`text-[11px] font-medium ${isMet ? 'text-green-600' : 'text-gray-400'}`}>
                {checkpoint.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
