import type { Metadata } from "next";
import LoginForm from "./login-form";

export const metadata: Metadata = {
  title: "Login — Cashier App",
  description: "Masuk ke aplikasi kasir untuk memulai transaksi",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden p-6">
      {/* Background decoration */}
      <div 
        className="fixed inset-0 pointer-events-none z-0" 
        style={{
          background: "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(99, 102, 241, 0.15), transparent), radial-gradient(ellipse 60% 40% at 80% 100%, rgba(139, 92, 246, 0.08), transparent)"
        }}
      />
      <div className="fixed rounded-full blur-[100px] pointer-events-none z-0 animate-[float_8s_ease-in-out_infinite] w-[400px] h-[400px] bg-[rgba(99,102,241,0.08)] -top-[10%] -right-[5%]" />
      <div className="fixed rounded-full blur-[100px] pointer-events-none z-0 animate-[float_8s_ease-in-out_infinite] w-[300px] h-[300px] bg-[rgba(139,92,246,0.06)] -bottom-[5%] -left-[5%]" style={{ animationDelay: "-4s" }} />

      {/* Login Card */}
      <main className="relative z-10 w-full max-w-[420px] bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[1.25rem] p-10 backdrop-blur-[24px] shadow-[0_0_0_1px_rgba(255,255,255,0.03),0_25px_50px_-12px_rgba(0,0,0,0.5),0_0_80px_-20px_var(--primary-glow)] animate-[fadeInUp_0.6s_ease-out]">
        {/* Logo & Title */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--primary)] to-[#8b5cf6] flex items-center justify-center mx-auto mb-4 text-white shadow-[0_8px_24px_var(--primary-glow)]">
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
          <h1 className="text-[1.625rem] font-bold tracking-tight m-0 bg-gradient-to-br from-white to-[rgba(255,255,255,0.7)] text-transparent bg-clip-text">Cashier App</h1>
          <p className="text-sm text-[var(--text-muted)] mt-[0.375rem]">
            Masuk untuk memulai shift dan transaksi
          </p>
        </div>

        {/* Divider */}
        <div 
          className="h-px w-full mb-6" 
          style={{
            background: "linear-gradient(90deg, transparent, var(--card-border), transparent)"
          }}
        />

        {/* Login Form */}
        <LoginForm />
      </main>

      {/* Footer */}
      <footer className="relative z-10 mt-8 text-xs text-[var(--text-muted)]">
        <p>&copy; 2026 Cashier App. All rights reserved.</p>
      </footer>
    </div>
  );
}
