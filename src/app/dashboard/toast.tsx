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
        <div className="confirm-overlay" onClick={handleCancel}>
          <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="currentColor"/>
              </svg>
            </div>
            <p className="confirm-message">{message}</p>
            <div className="confirm-actions">
              <button className="confirm-btn-cancel" onClick={handleCancel}>
                Batal
              </button>
              <button className="confirm-btn-ok" onClick={handleConfirm}>
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
