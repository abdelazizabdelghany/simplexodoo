import React, { useState } from 'react';
import { 
  Package, 
  Copy, 
  Check, 
  Barcode, 
  Layers, 
  Tag, 
  AlertCircle, 
  Info,
  Calendar,
  Eye
} from 'lucide-react';
import { StockItem } from '../types';

interface StockCardGridProps {
  items: StockItem[];
  onSelectProduct: (item: StockItem) => void;
  language: 'ar' | 'en';
}

export const StockCardGrid: React.FC<StockCardGridProps> = ({
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
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-4">
          <Package className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-700">
          {isArabic ? 'لا توجد منتجات تطابق الفلاتر في هذا الموقع' : 'No products found matching filters'}
        </h3>
        <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto">
          {isArabic ? 'جرّب تغيير عبارة البحث أو اختيار فئة أخرى أو تغيير الموقع المختار.' : 'Try adjusting your search query, filter criteria, or selecting a different location.'}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {items.map((item) => {
          // Available vs Reserved percentage calculation
          const totalOnHand = Math.max(1, item.quantity);
          const availablePercent = Math.min(100, Math.round((item.available_quantity / totalOnHand) * 100));
          const reservedPercent = Math.min(100, Math.round((item.reserved_quantity / totalOnHand) * 100));

          const isAvailableZero = item.available_quantity <= 0;
          const isLowStock = item.status === 'low';

          return (
            <div
              key={item.id}
              onClick={() => onSelectProduct(item)}
              className="group bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-xl hover:border-purple-300 transition-all duration-200 flex flex-col justify-between overflow-hidden cursor-pointer"
            >
              {/* Card Header: Category & Stock Status Pill */}
              <div className="p-4 pb-3 border-b border-slate-100/80 flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg truncate max-w-[180px]">
                  <Tag className="w-3 h-3 text-slate-400 shrink-0" />
                  <span className="truncate">{item.category}</span>
                </span>

                {/* Status Indicator */}
                {isAvailableZero ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                    {isArabic ? 'غير متاح (0)' : 'Out of Stock'}
                  </span>
                ) : isLowStock ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200 animate-pulse">
                    <AlertCircle className="w-3 h-3 text-rose-600" />
                    {isArabic ? 'مخزون حرج' : 'Low Stock'}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    {isArabic ? 'متوفر' : 'In Stock'}
                  </span>
                )}
              </div>

              {/* Card Body: Image, Name, SKU, Barcode */}
              <div className="p-4 space-y-3">
                <div className="flex gap-3.5">
                  {/* Thumbnail */}
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-slate-50 border border-slate-200/80 overflow-hidden shrink-0 flex items-center justify-center p-1 relative">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.product_name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <Package className="w-8 h-8 text-purple-300" />
                    )}
                  </div>

                  {/* Title & SKU */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug group-hover:text-purple-700 transition-colors line-clamp-2">
                      {item.product_name}
                    </h3>
                    
                    {/* SKU / Internal Reference */}
                    {item.default_code && (
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <span className="text-xs font-mono font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/60 truncate">
                          {item.default_code}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => handleCopy(e, item.default_code)}
                          title={isArabic ? 'نسخ كود الـ SKU' : 'Copy SKU'}
                          className="text-slate-400 hover:text-purple-600 p-0.5"
                        >
                          {copiedSku === item.default_code ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    )}

                    {/* Barcode line */}
                    {item.barcode && (
                      <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400 mt-1">
                        <Barcode className="w-3 h-3 text-slate-400" />
                        <span className="truncate">{item.barcode}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* HERO STAT: Available Quantity Display */}
                <div className={`p-3.5 rounded-xl border transition-all ${
                  isAvailableZero
                    ? 'bg-slate-50 border-slate-200'
                    : isLowStock
                    ? 'bg-rose-50/70 border-rose-200'
                    : 'bg-gradient-to-r from-emerald-50/90 to-teal-50/70 border-emerald-200/80'
                }`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-600 flex items-center gap-1">
                      <span>{isArabic ? 'الكمية المتاحة (Available):' : 'Available Stock:'}</span>
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      {item.uom}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className={`text-3xl font-black tracking-tight ${
                      isAvailableZero ? 'text-slate-400' : isLowStock ? 'text-rose-600' : 'text-emerald-700'
                    }`}>
                      {item.available_quantity.toLocaleString()}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      {isArabic ? 'جاهزة للصرف الفوري' : 'ready for dispatch'}
                    </span>
                  </div>

                  {/* Visual ratio bar: Available vs Reserved */}
                  <div className="mt-2.5">
                    <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden flex">
                      <div
                        style={{ width: `${availablePercent}%` }}
                        className={`h-full ${isAvailableZero ? 'bg-slate-300' : isLowStock ? 'bg-rose-500' : 'bg-emerald-500'}`}
                        title={`${availablePercent}% Available`}
                      />
                      <div
                        style={{ width: `${reservedPercent}%` }}
                        className="h-full bg-amber-400"
                        title={`${reservedPercent}% Reserved`}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1.5 font-medium">
                      <span>
                        {isArabic ? 'الرصيد الفعلي:' : 'On Hand:'}{' '}
                        <strong className="text-slate-800">{item.quantity}</strong>
                      </span>
                      {item.reserved_quantity > 0 && (
                        <span className="text-amber-700">
                          {isArabic ? 'محجوز:' : 'Reserved:'}{' '}
                          <strong>{item.reserved_quantity}</strong>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {item.lot_number && (
                  <div className="flex items-center gap-1.5 text-[11px] text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
                    <Layers className="w-3 h-3 text-indigo-500" />
                    <span className="font-semibold">{isArabic ? 'تشغيلة (Lot):' : 'Lot:'}</span>
                    <span className="font-mono">{item.lot_number}</span>
                  </div>
                )}
              </div>

              {/* Card Footer: Action */}
              <div className="p-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 text-[11px] flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {item.in_date ? `${isArabic ? 'تاريخ الإدخال: ' : 'In date: '}${item.in_date}` : (isArabic ? 'محدث للتو' : 'Up to date')}
                </span>
                <span className="font-semibold text-purple-700 group-hover:underline flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" />
                  {isArabic ? 'تفاصيل كاملة' : 'Details'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
