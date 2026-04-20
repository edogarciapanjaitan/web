"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchCatalogProducts, type ProductResult } from "./pos-actions";

interface ProductCatalogProps {
  onAddToCart: (product: ProductResult) => void;
}

export default function ProductCatalog({ onAddToCart }: ProductCatalogProps) {
  const [products, setProducts] = useState<ProductResult[]>([]);
  const [categories, setCategories] = useState<string[]>(["Semua"]);
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const loadCatalog = useCallback(async (c: string, p: number) => {
    setIsLoading(true);
    const { data, meta } = await fetchCatalogProducts(p, c);
    setProducts(data);
    if (meta.categories && meta.categories.length > 0) {
      setCategories(meta.categories);
    }
    setTotalPages(meta.pages || 1);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadCatalog(activeCategory, page);
  }, [activeCategory, page, loadCatalog]);

  const handleCategoryClick = (cat: string) => {
    setActiveCategory(cat);
    setPage(1);
  };

  function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`py-2 px-5 rounded-full text-sm font-medium cursor-pointer whitespace-nowrap transition-all duration-200 shadow-[0_1px_2px_rgba(0,0,0,0.05)] ${activeCategory === cat ? "bg-[#111827] text-white border-[#111827]" : "bg-white border border-[rgba(0,0,0,0.05)] text-[#111111] hover:bg-[#f9fafb]"}`}
            onClick={() => handleCategoryClick(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-3 gap-3.5 overflow-y-auto pr-2 max-[1200px]:grid-cols-2 max-[800px]:grid-cols-1">
        {isLoading ? (
          <div className="col-span-full text-center py-12 text-[var(--text-muted)] text-[0.9375rem]">Memuat produk...</div>
        ) : products.length === 0 ? (
          <div className="col-span-full text-center py-12 text-[var(--text-muted)] text-[0.9375rem]">Tidak ada produk ditemukan</div>
        ) : (
          products.map((product) => (
            <div key={product.id} className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-2.5 flex flex-col gap-2 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_25px_rgba(0,0,0,0.2)]">
              <div className="h-[110px] w-full bg-[rgba(255,255,255,0.03)] rounded-lg overflow-hidden relative flex items-center justify-center">
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.name} className="w-full h-full object-contain p-1 transition-transform duration-300 group-hover:scale-105" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-[#9ca3af] text-sm font-medium">No Image</div>
                )}
              </div>
              <div className="flex flex-col gap-2 px-1">
                <div className="text-[0.9375rem] font-medium text-[var(--foreground)] leading-tight whitespace-nowrap overflow-hidden text-ellipsis">{product.name}</div>
                <div className="flex items-center justify-between">
                  <div className="text-[1.125rem] font-bold text-[var(--foreground)]">{formatCurrency(product.price)}</div>
                  <button 
                    className="bg-[var(--foreground)] text-[var(--background)] border-none rounded-full w-[30px] h-[30px] flex items-center justify-center cursor-pointer transition-all duration-200 shadow-[0_2px_8px_rgba(0,0,0,0.1)] hover:not-disabled:scale-110 hover:not-disabled:bg-[var(--primary)] hover:not-disabled:text-white disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-[var(--text-muted)]"
                    onClick={() => onAddToCart(product)}
                    disabled={product.stock <= 0}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 pt-4 mt-auto">
          <button 
            disabled={page <= 1 || isLoading} 
            onClick={() => setPage(page - 1)}
            className="bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--foreground)] w-9 h-9 rounded-lg flex items-center justify-center cursor-pointer font-bold transition-all duration-200 hover:not-disabled:bg-[rgba(255,255,255,0.1)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            &lt;
          </button>
          <span>{page} / {totalPages}</span>
          <button 
            disabled={page >= totalPages || isLoading} 
            onClick={() => setPage(page + 1)}
            className="bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--foreground)] w-9 h-9 rounded-lg flex items-center justify-center cursor-pointer font-bold transition-all duration-200 hover:not-disabled:bg-[rgba(255,255,255,0.1)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            &gt;
          </button>
        </div>
      )}
    </div>
  );
}
