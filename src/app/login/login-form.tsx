"use client";

import { useActionState } from "react";
import { loginAction } from "./actions";

export default function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, null);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {/* Error Banner */}
      {state && !state.success && (
        <div className="flex items-center gap-2 py-3 px-4 bg-[var(--error-bg)] border border-[var(--error-border)] rounded-xl text-[#fca5a5] text-[0.8125rem] animate-[fadeIn_0.3s_ease]" role="alert">
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M8 1C4.13 1 1 4.13 1 8s3.13 7 7 7 7-3.13 7-7-3.13-7-7-7zm.5 10.5h-1v-1h1v1zm0-2h-1v-5h1v5z"
              fill="currentColor"
            />
          </svg>
          <span>{state.message}</span>
        </div>
      )}

      {/* Username Field */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="username" className="text-[0.8125rem] font-medium text-[var(--text-secondary)] tracking-[0.01em]">
          Username
        </label>
        <div className="relative flex items-center group/wrapper">
          <svg
            className="absolute left-3.5 text-[var(--text-muted)] pointer-events-none transition-colors duration-200 group-focus-within/wrapper:text-[var(--primary-hover)] peer-focus:text-[var(--primary-hover)]"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
              fill="currentColor"
            />
          </svg>
          <input
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            required
            minLength={3}
            maxLength={30}
            className="peer w-full py-3 pr-3.5 pl-11 bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl text-[var(--foreground)] text-[0.9375rem] outline-none transition-all duration-200 placeholder:text-[var(--text-muted)] hover:border-[rgba(255,255,255,0.2)] focus:border-[var(--primary)] focus:shadow-[0_0_0_3px_var(--primary-glow)] focus:bg-[rgba(255,255,255,0.08)] disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="Masukkan username"
            disabled={isPending}
          />
        </div>
        {state?.errors?.username && (
          <p className="text-xs text-[var(--error)] m-0 animate-[fadeIn_0.2s_ease]">{state.errors.username[0]}</p>
        )}
      </div>

      {/* Password Field */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-[0.8125rem] font-medium text-[var(--text-secondary)] tracking-[0.01em]">
          Password
        </label>
        <div className="relative flex items-center group/wrapper">
          <svg
            className="absolute left-3.5 text-[var(--text-muted)] pointer-events-none transition-colors duration-200 group-focus-within/wrapper:text-[var(--primary-hover)] peer-focus:text-[var(--primary-hover)]"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"
              fill="currentColor"
            />
          </svg>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            minLength={6}
            maxLength={128}
            className="peer w-full py-3 pr-3.5 pl-11 bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl text-[var(--foreground)] text-[0.9375rem] outline-none transition-all duration-200 placeholder:text-[var(--text-muted)] hover:border-[rgba(255,255,255,0.2)] focus:border-[var(--primary)] focus:shadow-[0_0_0_3px_var(--primary-glow)] focus:bg-[rgba(255,255,255,0.08)] disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="Masukkan password"
            disabled={isPending}
          />
        </div>
        {state?.errors?.password && (
          <p className="text-xs text-[var(--error)] m-0 animate-[fadeIn_0.2s_ease]">{state.errors.password[0]}</p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full py-[0.8125rem] bg-gradient-to-br from-[var(--primary)] to-[#7c3aed] border-none rounded-xl text-white text-[0.9375rem] font-semibold cursor-pointer transition-all duration-200 relative overflow-hidden mt-1 group before:absolute before:inset-0 before:bg-gradient-to-br before:from-[rgba(255,255,255,0.1)] before:to-transparent before:opacity-0 before:transition-opacity before:duration-200 hover:before:opacity-100 hover:not-disabled:-translate-y-[1px] hover:not-disabled:shadow-[0_8px_24px_var(--primary-glow)] active:not-disabled:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed"
        disabled={isPending}
      >
        {isPending ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-[18px] h-[18px] border-2 border-[rgba(255,255,255,0.3)] border-t-white rounded-full animate-[spin_0.6s_linear_infinite]" />
            <span>Memproses...</span>
          </span>
        ) : (
          "Masuk"
        )}
      </button>
    </form>
  );
}
