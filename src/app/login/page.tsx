import type { Metadata } from "next";
import LoginForm from "./login-form";

export const metadata: Metadata = {
  title: "Login — Cashier App",
  description: "Masuk ke aplikasi kasir untuk memulai transaksi",
};

export default function LoginPage() {
  return (
    <div className="login-page">
      {/* Background decoration */}
      <div className="bg-gradient" />
      <div className="bg-glow bg-glow-1" />
      <div className="bg-glow bg-glow-2" />

      {/* Login Card */}
      <main className="login-card">
        {/* Logo & Title */}
        <div className="login-header">
          <div className="logo-icon">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M17 2H7c-1.1 0-2 .9-2 2v2c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 4H7V4h10v2zM17 9H7c-1.1 0-2 .9-2 2v9c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2v-9c0-1.1-.9-2-2-2zm-5 8c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"
                fill="currentColor"
              />
            </svg>
          </div>
          <h1 className="login-title">Cashier App</h1>
          <p className="login-subtitle">
            Masuk untuk memulai shift dan transaksi
          </p>
        </div>

        {/* Divider */}
        <div className="divider" />

        {/* Login Form */}
        <LoginForm />
      </main>

      {/* Footer */}
      <footer className="login-footer">
        <p>&copy; 2026 Cashier App. All rights reserved.</p>
      </footer>
    </div>
  );
}
