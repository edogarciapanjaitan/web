"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { searchProducts, type ProductResult } from "./pos-actions";

// --- Types ---

interface ProductSearchProps {
  onAddToCart: (product: ProductResult) => void;
}

// --- Component ---

export default function ProductSearch({ onAddToCart }: ProductSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ProductResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Debounced search
  const doSearch = useCallback(async (q: string) => {
    if (q.trim().length === 0) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    const data = await searchProducts(q);
    setResults(data);
    setIsOpen(true);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(query), 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, doSearch]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelect(product: ProductResult) {
    onAddToCart(product);
    setQuery("");
    setResults([]);
    setIsOpen(false);
  }

  function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  return (
    <div className="relative" ref={wrapperRef}>
      <div className="relative flex items-center group/search">
        <svg
          className="absolute left-4 text-[var(--text-muted)] pointer-events-none transition-colors duration-200 group-focus-within/search:text-[var(--primary-hover)]"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
            fill="currentColor"
          />
        </svg>
        <input
          id="product-search-input"
          type="text"
          className="w-full py-3.5 pr-4 pl-11 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[0.875rem] text-[var(--foreground)] text-[0.9375rem] font-[inherit] outline-none transition-all duration-200 placeholder:text-[var(--text-muted)] focus:border-[var(--primary)] focus:shadow-[0_0_0_3px_var(--primary-glow)] focus:bg-[rgba(255,255,255,0.06)]"
          placeholder="Cari produk (nama atau kode SKU)..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          autoComplete="off"
        />
        {isLoading && <span className="absolute right-4 w-[18px] h-[18px] border-2 border-[rgba(255,255,255,0.15)] border-t-[var(--primary)] rounded-full animate-[spin_0.6s_linear_infinite]" />}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute top-[calc(100%+0.375rem)] left-0 right-0 bg-[rgba(18,18,28,0.98)] border border-[var(--card-border)] rounded-[0.875rem] overflow-hidden z-50 shadow-[0_16px_48px_-12px_rgba(0,0,0,0.6)] animate-[fadeIn_0.15s_ease] max-h-[400px] overflow-y-auto">
          {results.map((product) => (
            <button
              key={product.id}
              className="flex items-center justify-between w-full py-3 px-4 bg-transparent border-none border-b border-b-[rgba(255,255,255,0.04)] text-[var(--foreground)] font-[inherit] cursor-pointer text-left transition-colors duration-150 last:border-b-0 hover:bg-[rgba(99,102,241,0.08)]"
              onClick={() => handleSelect(product)}
              type="button"
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium">{product.name}</span>
                <span className="text-xs text-[var(--text-muted)]">
                  SKU: {product.sku}
                  {product.category && ` • ${product.category}`}
                </span>
              </div>
              <div className="flex flex-col items-end gap-0.5">
                <span className="text-sm font-semibold text-[var(--primary-hover)]">
                  {formatCurrency(product.price)}
                </span>
                <span className="text-[0.6875rem] text-[var(--text-muted)]">Stok: {product.stock}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {isOpen && query.trim().length > 0 && results.length === 0 && !isLoading && (
        <div className="absolute top-[calc(100%+0.375rem)] left-0 right-0 bg-[rgba(18,18,28,0.98)] border border-[var(--card-border)] rounded-[0.875rem] overflow-hidden z-50 shadow-[0_16px_48px_-12px_rgba(0,0,0,0.6)] animate-[fadeIn_0.15s_ease]">
          <div className="py-5 text-center text-[var(--text-muted)] text-sm">Produk tidak ditemukan</div>
        </div>
      )}
    </div>
  );
}
