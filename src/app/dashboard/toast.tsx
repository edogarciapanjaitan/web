"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";

// --- Navigation Confirm Link ---

interface NavConfirmLinkProps {
  href: string;
  message: string;
  children: React.ReactNode;
  className?: string;
}

export function NavConfirmLink({ href, message, children, className }: NavConfirmLinkProps) {
  const [showDialog, setShowDialog] = useState(false);
  const router = useRouter();

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setShowDialog(true);
  }, []);

  const handleConfirm = useCallback(() => {
    setShowDialog(false);
    router.push(href);
  }, [href, router]);

  const handleCancel = useCallback(() => {
    setShowDialog(false);
  }, []);

  return (
    <>
      <a href={href} onClick={handleClick} className={className}>
        {children}
      </a>

      {showDialog && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.6)] backdrop-blur-[4px] flex items-center justify-center z-[9999] p-6 animate-[fadeIn_0.2s_ease]" onClick={handleCancel}>
          <div className="w-full max-w-[360px] bg-[rgba(18,18,28,0.98)] border border-[var(--card-border)] rounded-[1.25rem] p-8 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7),0_0_0_1px_rgba(255,255,255,0.04)] animate-[fadeInUp_0.3s_ease-out] flex flex-col items-center gap-4 text-center" onClick={(e) => e.stopPropagation()}>
            <div className="w-[52px] h-[52px] rounded-full bg-[rgba(99,102,241,0.12)] border border-[rgba(99,102,241,0.2)] flex items-center justify-center text-[var(--primary-hover)]">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="currentColor"/>
              </svg>
            </div>
            <p className="text-[0.9375rem] text-[var(--text-secondary)] m-0 leading-relaxed">{message}</p>
            <div className="flex gap-2.5 w-full mt-1">
              <button className="flex-1 py-2.5 bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] rounded-[0.625rem] text-[var(--text-secondary)] text-sm font-medium font-[inherit] cursor-pointer transition-all duration-150 hover:bg-[rgba(255,255,255,0.1)] hover:text-[var(--foreground)]" onClick={handleCancel}>
                Batal
              </button>
              <button className="flex-1 py-2.5 bg-gradient-to-br from-[var(--primary)] to-[#7c3aed] border-none rounded-[0.625rem] text-white text-sm font-semibold font-[inherit] cursor-pointer transition-all duration-150 hover:shadow-[0_6px_20px_var(--primary-glow)] hover:-translate-y-px" onClick={handleConfirm}>
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
