"use client";

import { logoutAction } from "./actions";

export default function LogoutButton() {
  return (
    <form action={logoutAction}>
      <button type="submit" className="logout-button">
        Keluar
      </button>
    </form>
  );
}
