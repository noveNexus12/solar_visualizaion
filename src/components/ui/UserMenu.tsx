import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface UserMenuProps {
  name: string;
  role: string;
}

export default function UserMenu({ name, role }: UserMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      {/* Avatar circle */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 bg-emerald-900 text-white px-3 py-2 rounded-full shadow-md hover:bg-emerald-800 transition"
      >
        <div className="w-8 h-8 flex items-center justify-center rounded-full bg-emerald-700 font-semibold">
          {name.charAt(0).toUpperCase()}
        </div>
        <ChevronDown size={16} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white border rounded-xl shadow-lg p-3 text-gray-800 z-50">
          <p className="font-medium">{name}</p>
          <p className="text-sm text-gray-500">{role}</p>
          <hr className="my-2" />
          <button
            onClick={() => console.log("Logout clicked")}
            className="w-full text-left text-red-600 hover:bg-red-50 px-2 py-1 rounded-md"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}