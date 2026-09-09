import React, { useState } from 'react';
import { 
  Package, 
  Copy, 
  Check, 
  Barcode, 
  ArrowUpDown, 
  ExternalLink,
  AlertCircle
} from 'lucide-react';
import { StockItem } from '../types';

interface StockTableProps {
  items: StockItem[];
  onSelectProduct: (item: StockItem) => void;
  language: 'ar' | 'en';
}

export const StockTable: React.FC<StockTableProps> = ({
  items,
  onSelectProduct,
  language,
}) => {
  const isArabic = language === 'ar';
  const [copiedSku, setCopiedSku] = useState<string | null>(null);

  const handleCopy = (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedSku(text);
    setTimeout(() => setCopiedSku(null), 1800);
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4 text-start">{isArabic ? 'المنتج / الصنف' : 'Product / SKU'}</th>
                <th className="py-3.5 px-3 text-start">{isArabic ? 'الفئة' : 'Category'}</th>
                <th className="py-3.5 px-3 text-start">{isArabic ? 'الباركود' : 'Barcode'}</th>
                <th className="py-3.5 px-3 text-center bg-emerald-50/50 text-emerald-900 border-x border-emerald-100">
                  {isArabic ? 'الكمية المتاحة (Available)' : 'Available Qty'}
                </th>
                <th className="py-3.5 px-3 text-center">{isArabic ? 'الفعلي (On Hand)' : 'On Hand'}</th>
                <th className="py-3.5 px-3 text-center">{isArabic ? 'المحجوز (Reserved)' : 'Reserved'}</th>
                <th className="py-3.5 px-3 text-center">{isArabic ? 'الوحدة' : 'UoM'}</th>
                <th className="py-3.5 px-3 text-center">{isArabic ? 'الحالة' : 'Status'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {items.map((item) => {
                const isAvailableZero = item.available_quantity <= 0;
                const isLowStock = item.status === 'low';

                return (
                  <tr
                    key={item.id}
                    onClick={() => onSelectProduct(item)}
                    className="hover:bg-purple-50/50 cursor-pointer transition-colors group"
                  >
                    {/* Product Name & SKU */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 shrink-0 overflow-hidden flex items-center justify-center">
                          {item.image_url ? (
                            <img
                              src={item.image_url}
                              alt=""
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Package className="w-5 h-5 text-purple-400" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 group-hover:text-purple-700 transition-colors truncate max-w-xs">
                            {item.product_name}
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            {item.default_code && (
                              <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 border border-slate-200">
                                {item.default_code}
                              </span>
                            )}
                            {item.default_code && (
                              <button
                                onClick={(e) => handleCopy(e, item.default_code)}
                                title={isArabic ? 'نسخ SKU' : 'Copy SKU'}
                                className="text-slate-400 hover:text-purple-600"
                              >
                                {copiedSku === item.default_code ? (
                                  <Check className="w-3 h-3 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            )}
                            {item.lot_number && (
                              <span className="text-[10px] text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                                Lot: {item.lot_number}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-3">
                      <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] truncate max-w-[140px]">
                        {item.category}
                      </span>
                    </td>

                    {/* Barcode */}
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-500">
                      {item.barcode ? (
                        <div className="flex items-center gap-1">
                          <Barcode className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{item.barcode}</span>
                        </div>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>

                    {/* AVAILABLE QUANTITY (HERO COLUMN) */}
                    <td className="py-3 px-3 text-center bg-emerald-50/40 border-x border-emerald-100/70">
                      <span className={`inline-flex items-center justify-center px-3 py-1 rounded-lg font-black text-sm ${
                        isAvailableZero
                          ? 'bg-slate-100 text-slate-500'
                          : isLowStock
                          ? 'bg-rose-100 text-rose-800 font-bold'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {item.available_quantity.toLocaleString()}
                      </span>
                    </td>

                    {/* On Hand */}
                    <td className="py-3 px-3 text-center font-bold text-slate-800">
                      {item.quantity.toLocaleString()}
                    </td>

                    {/* Reserved */}
                    <td className="py-3 px-3 text-center">
                      {item.reserved_quantity > 0 ? (
                        <span className="font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                          {item.reserved_quantity.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-slate-300">0</span>
                      )}
                    </td>

                    {/* UoM */}
                    <td className="py-3 px-3 text-center text-slate-500 text-xs">
                      {item.uom}
                    </td>

                    {/* Status Pill */}
                    <td className="py-3 px-3 text-center">
                      {isAvailableZero ? (
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                          {isArabic ? 'منتهي' : 'Out'}
                        </span>
                      ) : isLowStock ? (
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">
                          {isArabic ? 'منخفض' : 'Low'}
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                          {isArabic ? 'متوفر' : 'In Stock'}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
