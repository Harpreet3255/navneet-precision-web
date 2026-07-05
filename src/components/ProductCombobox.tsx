/**
 * ProductCombobox — Searchable, client-scoped product picker for PO line items.
 *
 * Behaviour:
 *  1. Disabled (locked state) until a client_id is provided.
 *  2. When a client is active → shows only products that have a contract row
 *     in client_pricing for that client, with "Contract Active" badge.
 *  3. "Show All Products" toggle overrides the filter to show the entire catalog.
 *  4. Inline fuzzy search filters by both SKU and product name, debounced 200ms.
 *  5. On selection → calls onSelect with { productId, contractRate | null }.
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, CheckCircle2, Package, ChevronDown, Layers, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Product = {
    id: string;
    name: string;
    sku: string | null;
};

type ContractMap = Record<string, number>; // productId → custom_rate

type ProductComboboxProps = {
    clientId: string | null;
    allProducts: Product[];
    contractMap: ContractMap;       // productIds with verified contracts for this client
    value: string;                  // currently selected product_id
    onSelect: (productId: string, contractRate: number | null) => void;
    disabled?: boolean;
    placeholder?: string;
    index?: number;                 // for unique DOM IDs
};

const DEBOUNCE_MS = 200;

export function ProductCombobox({
    clientId,
    allProducts,
    contractMap,
    value,
    onSelect,
    disabled = false,
    placeholder = "Select product…",
    index = 0,
}: ProductComboboxProps) {
    const [open, setOpen]             = useState(false);
    const [query, setQuery]           = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");
    const [showAll, setShowAll]       = useState(false);
    const containerRef                = useRef<HTMLDivElement>(null);
    const inputRef                    = useRef<HTMLInputElement>(null);
    const debounceRef                 = useRef<ReturnType<typeof setTimeout> | null>(null);

    // ── Debounce search query ────────────────────────────────────────────────
    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => setDebouncedQuery(query), DEBOUNCE_MS);
        return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
    }, [query]);

    // ── Reset state when client changes ─────────────────────────────────────
    useEffect(() => {
        setShowAll(false);
        setQuery("");
        setDebouncedQuery("");
    }, [clientId]);

    // ── Close on outside click ───────────────────────────────────────────────
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    // Focus input when dropdown opens
    useEffect(() => {
        if (open) setTimeout(() => inputRef.current?.focus(), 50);
    }, [open]);

    // ── Derived product list ─────────────────────────────────────────────────
    const contractProductIds = new Set(Object.keys(contractMap));

    const sourceList = showAll
        ? allProducts
        : allProducts.filter(p => contractProductIds.has(p.id));

    const filtered = debouncedQuery
        ? sourceList.filter(p => {
            const q = debouncedQuery.toLowerCase();
            return (
                p.name.toLowerCase().includes(q) ||
                (p.sku?.toLowerCase().includes(q) ?? false)
            );
        })
        : sourceList;

    const selectedProduct = allProducts.find(p => p.id === value);
    const isLocked = !clientId || disabled;

    const handleSelect = useCallback((product: Product) => {
        const rate = contractMap[product.id] ?? null;
        onSelect(product.id, rate);
        setOpen(false);
        setQuery("");
    }, [contractMap, onSelect]);

    // ── Highlight matching text ──────────────────────────────────────────────
    const highlight = (text: string, q: string) => {
        if (!q) return <span>{text}</span>;
        const idx = text.toLowerCase().indexOf(q.toLowerCase());
        if (idx === -1) return <span>{text}</span>;
        return (
            <span>
                {text.slice(0, idx)}
                <mark className="bg-blue-500/30 text-blue-200 rounded-sm">{text.slice(idx, idx + q.length)}</mark>
                {text.slice(idx + q.length)}
            </span>
        );
    };

    return (
        <div ref={containerRef} className="relative w-full">
            {/* ── Trigger Button ── */}
            <button
                type="button"
                id={`product-combobox-trigger-${index}`}
                onClick={() => !isLocked && setOpen(prev => !prev)}
                className={cn(
                    "w-full flex items-center justify-between gap-2 h-10 px-3 rounded-md border text-sm transition-all",
                    "bg-white/5 border-white/10 text-left",
                    isLocked
                        ? "opacity-50 cursor-not-allowed text-white/30"
                        : "hover:bg-white/10 cursor-pointer text-white",
                    open && "ring-1 ring-blue-500/50 border-blue-500/30"
                )}
                aria-haspopup="listbox"
                aria-expanded={open}
                disabled={isLocked}
            >
                <span className="flex items-center gap-2 truncate">
                    {selectedProduct ? (
                        <>
                            <span className="font-mono text-blue-300 text-xs shrink-0">[{selectedProduct.sku}]</span>
                            <span className="truncate">{selectedProduct.name}</span>
                        </>
                    ) : (
                        <span className="text-white/30">
                            {isLocked && !disabled ? "Select a client first" : placeholder}
                        </span>
                    )}
                </span>
                <ChevronDown className={cn("w-4 h-4 text-white/30 shrink-0 transition-transform", open && "rotate-180")} />
            </button>

            {/* ── Dropdown Panel ── */}
            {open && (
                <div className="absolute z-50 top-full mt-1 w-full min-w-[320px] bg-gray-900 border border-white/10 rounded-lg shadow-2xl shadow-black/60 animate-in fade-in slide-in-from-top-2 duration-150">

                    {/* Search Input */}
                    <div className="p-2 border-b border-white/10">
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-white/30" />
                            <input
                                ref={inputRef}
                                type="text"
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                                placeholder="Search SKU or product name…"
                                className="w-full pl-8 pr-3 py-2 bg-white/5 border border-white/10 rounded-md text-sm text-white placeholder:text-white/30 outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30"
                            />
                        </div>
                    </div>

                    {/* Show All Toggle */}
                    {!showAll && (
                        <div className="px-3 py-1.5 border-b border-white/5 flex items-center justify-between">
                            <span className="text-xs text-white/30 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                Showing {sourceList.length} contracted products
                            </span>
                            <button
                                type="button"
                                onClick={() => setShowAll(true)}
                                className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
                            >
                                <Layers className="w-3 h-3" />
                                Show All Products
                            </button>
                        </div>
                    )}
                    {showAll && (
                        <div className="px-3 py-1.5 border-b border-white/5 flex items-center justify-between">
                            <span className="text-xs text-amber-400 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                Showing full master catalog ({allProducts.length})
                            </span>
                            <button
                                type="button"
                                onClick={() => setShowAll(false)}
                                className="text-xs text-white/40 hover:text-white/60 transition-colors"
                            >
                                ← Contract only
                            </button>
                        </div>
                    )}

                    {/* Results List */}
                    <div className="max-h-64 overflow-y-auto overscroll-contain">
                        {filtered.length === 0 ? (
                            <div className="px-4 py-6 text-center text-white/30 text-sm">
                                {debouncedQuery ? `No results for "${debouncedQuery}"` : "No products available"}
                            </div>
                        ) : (
                            <ul role="listbox" className="py-1">
                                {filtered.map(product => {
                                    const hasContract = contractProductIds.has(product.id);
                                    const isSelected  = product.id === value;
                                    const rate        = contractMap[product.id];
                                    return (
                                        <li
                                            key={product.id}
                                            role="option"
                                            aria-selected={isSelected}
                                            onClick={() => handleSelect(product)}
                                            className={cn(
                                                "flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors",
                                                isSelected
                                                    ? "bg-blue-500/20 text-white"
                                                    : "hover:bg-white/5 text-white/80",
                                            )}
                                        >
                                            <Package className="w-3.5 h-3.5 text-white/20 shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono text-blue-300 text-xs shrink-0">
                                                        [{highlight(product.sku || '—', debouncedQuery)}]
                                                    </span>
                                                    {hasContract && (
                                                        <Badge className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 text-[9px] px-1.5 py-0 h-4 shrink-0">
                                                            Contract Active
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="text-sm truncate mt-0.5">
                                                    {highlight(product.name, debouncedQuery)}
                                                </div>
                                            </div>
                                            {rate !== undefined && (
                                                <span className="text-xs font-mono text-green-400 shrink-0">₹{rate}</span>
                                            )}
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>

                    {filtered.length > 0 && (
                        <div className="px-3 py-1.5 border-t border-white/5 text-white/20 text-xs">
                            {filtered.length} result{filtered.length !== 1 ? 's' : ''}
                            {debouncedQuery && ` for "${debouncedQuery}"`}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
