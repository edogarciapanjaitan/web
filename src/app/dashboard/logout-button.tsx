"use client";

import { logoutAction } from "./actions";

export default function LogoutButton() {
  return (
    <form action={logoutAction}>
      <button type="submit" className="py-2 px-4 bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)] rounded-lg text-[#fca5a5] text-[0.8125rem] font-medium font-[inherit] cursor-pointer transition-all duration-200 hover:bg-[rgba(239,68,68,0.2)] hover:border-[rgba(239,68,68,0.4)]">
        Keluar
      </button>
    </form>
  );
}
