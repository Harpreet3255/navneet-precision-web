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

import { useState, useEffect, useMemo, useCallback } from "react";
import { CheckCircle2, Package, ChevronDown, Layers, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";

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
    const [open, setOpen] = useState(false);
    const [showAll, setShowAll] = useState(false);
    const [query, setQuery] = useState("");

    // Reset state when client changes
    useEffect(() => {
        setShowAll(false);
        setQuery("");
    }, [clientId]);

    const contractProductIds = useMemo(() => new Set(Object.keys(contractMap)), [contractMap]);

    const sourceList = useMemo(() => {
        return showAll
            ? allProducts
            : allProducts.filter(p => contractProductIds.has(p.id));
    }, [showAll, allProducts, contractProductIds]);

    const selectedProduct = allProducts.find(p => p.id === value);
    const isLocked = !clientId || disabled;

    const handleSelect = useCallback((product: Product) => {
        const rate = contractMap[product.id] ?? null;
        onSelect(product.id, rate);
        setOpen(false);
        setQuery("");
    }, [contractMap, onSelect]);

    return (
        <Popover open={open} onOpenChange={(newOpen) => !isLocked && setOpen(newOpen)}>
            <PopoverTrigger asChild>
                <button
                    type="button"
                    id={`product-combobox-trigger-${index}`}
                    className={cn(
                        "w-full flex items-center justify-between gap-2 h-10 px-3 rounded-md border text-sm transition-all outline-none",
                        "bg-white/5 border-white/10 text-left focus:ring-1 focus:ring-blue-500/50",
                        isLocked
                            ? "opacity-50 cursor-not-allowed text-white/30"
                            : "hover:bg-white/10 cursor-pointer text-white",
                        open && "ring-1 ring-blue-500/50 border-blue-500/30"
                    )}
                    disabled={isLocked}
                >
                    <span className="flex items-center gap-2 truncate">
                        {selectedProduct ? (
                            <>
                                <span className="font-bold text-blue-300 text-xs shrink-0">[{selectedProduct.sku}]</span>
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
            </PopoverTrigger>

            <PopoverContent 
                className="w-[var(--radix-popover-trigger-width)] min-w-[320px] p-0 bg-gray-900 border-white/10 shadow-2xl shadow-black/60 rounded-lg" 
                align="start"
                sideOffset={4}
            >
                <Command 
                    className="bg-transparent" 
                    filter={(val, search) => {
                        if (val.toLowerCase().includes(search.toLowerCase())) return 1;
                        return 0;
                    }}
                >
                    <CommandInput 
                        placeholder="Search SKU or product name…" 
                        className="text-white placeholder:text-white/30 border-none focus:ring-0 h-11 px-3 outline-none w-full"
                        value={query}
                        onValueChange={setQuery}
                    />
                    
                    {/* Toggles */}
                    {!showAll && (
                        <div className="px-3 py-2 border-y border-white/5 flex items-center justify-between bg-white/[0.02]">
                            <span className="text-xs text-white/40 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                Showing {sourceList.length} contracted products
                            </span>
                            <button
                                type="button"
                                onClick={() => setShowAll(true)}
                                className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
                            >
                                <Layers className="w-3 h-3" />
                                Show All
                            </button>
                        </div>
                    )}
                    {showAll && (
                        <div className="px-3 py-2 border-y border-white/5 flex items-center justify-between bg-white/[0.02]">
                            <span className="text-xs text-amber-500/80 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                Full master catalog ({allProducts.length})
                            </span>
                            <button
                                type="button"
                                onClick={() => setShowAll(false)}
                                className="text-xs text-white/50 hover:text-white transition-colors"
                            >
                                ← Contract only
                            </button>
                        </div>
                    )}

                    <CommandEmpty className="py-6 text-center text-sm text-white/40">
                        No products found.
                    </CommandEmpty>

                    <CommandList className="max-h-[350px] overflow-y-auto overscroll-contain p-0">
                        <CommandGroup className="p-0">
                            {sourceList.map(product => {
                                const hasContract = contractProductIds.has(product.id);
                                const isSelected = product.id === value;
                                const rate = contractMap[product.id];
                                
                                const searchString = `${product.sku || ''} ${product.name}`.toLowerCase();

                                return (
                                    <CommandItem
                                        key={product.id}
                                        value={searchString}
                                        onSelect={() => handleSelect(product)}
                                        className={cn(
                                            "flex items-center justify-between px-3 py-1.5 cursor-pointer transition-colors border-b border-white/5 rounded-none last:border-0",
                                            isSelected 
                                                ? "bg-blue-500/20 text-white" 
                                                : "text-white/80 data-[selected=true]:bg-white/10 data-[selected=true]:text-white hover:bg-white/5"
                                        )}
                                    >
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <Package className="w-3.5 h-3.5 text-white/20 shrink-0 hidden sm:block" />
                                            <div className="flex-1 min-w-0 flex items-center gap-2">
                                                <span className="font-bold text-blue-300 text-xs shrink-0 whitespace-nowrap">
                                                    [{product.sku || '—'}]
                                                </span>
                                                <span className="text-sm truncate">
                                                    {product.name}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 shrink-0 ml-3">
                                            {hasContract && (
                                                <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] px-1.5 py-0 h-4 rounded-sm hidden md:inline-flex shrink-0">
                                                    Contract
                                                </Badge>
                                            )}
                                            {rate !== undefined && (
                                                <span className="text-xs font-mono text-green-400 w-12 text-right shrink-0">₹{rate}</span>
                                            )}
                                        </div>
                                    </CommandItem>
                                );
                            })}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
