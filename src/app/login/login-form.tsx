"use client";

import { useActionState } from "react";
import { loginAction } from "./actions";

export default function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, null);

  return (
    <form action={formAction} className="login-form">
      {/* Error Banner */}
      {state && !state.success && (
        <div className="error-banner" role="alert">
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
      <div className="form-group">
        <label htmlFor="username" className="form-label">
          Username
        </label>
        <div className="input-wrapper">
          <svg
            className="input-icon"
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
            className="form-input"
            placeholder="Masukkan username"
            disabled={isPending}
          />
        </div>
        {state?.errors?.username && (
          <p className="field-error">{state.errors.username[0]}</p>
        )}
      </div>

      {/* Password Field */}
      <div className="form-group">
        <label htmlFor="password" className="form-label">
          Password
        </label>
        <div className="input-wrapper">
          <svg
            className="input-icon"
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
            className="form-input"
            placeholder="Masukkan password"
            disabled={isPending}
          />
        </div>
        {state?.errors?.password && (
          <p className="field-error">{state.errors.password[0]}</p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="submit-button"
        disabled={isPending}
      >
        {isPending ? (
          <span className="loading-wrapper">
            <span className="spinner" />
            <span>Memproses...</span>
          </span>
        ) : (
          "Masuk"
        )}
      </button>
    </form>
  );
}
