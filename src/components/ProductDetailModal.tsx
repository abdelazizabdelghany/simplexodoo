import React, { useState } from 'react';
import { 
  X, 
  Package, 
  Barcode, 
  Copy, 
  Check, 
  Tag, 
  Layers, 
  Calendar, 
  ExternalLink, 
  DollarSign, 
  ShieldCheck, 
  Clock, 
  TrendingUp,
  Boxes
} from 'lucide-react';
import { StockItem, WarehouseLocation } from '../types';

interface ProductDetailModalProps {
  item: StockItem | null;
  location: WarehouseLocation | null;
  onClose: () => void;
  odooUrl?: string;
  language: 'ar' | 'en';
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  item,
  location,
  onClose,
  odooUrl,
  language,
}) => {
  const isArabic = language === 'ar';
  const [copied, setCopied] = useState<string | null>(null);

  if (!item) return null;

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 1800);
  };

  const odooDirectLink = odooUrl
    ? `${odooUrl.replace(/\/+$/, '')}/web#id=${item.product_id}&model=product.product&view_type=form`
    : null;

  const isLowStock = item.status === 'low';
  const isOut = item.available_quantity <= 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full p-6 sm:p-7 max-h-[90vh] overflow-y-auto flex flex-col justify-between">
        
        {/* Header */}
        <div>
          <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-100">
                  {item.category}
                </span>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 mt-1 leading-snug">
                  {item.product_name}
                </h2>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-slate-100 text-slate-400 hover:text-slate-700 hover:bg-slate-200 flex items-center justify-center transition-colors shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Location & SKU Sub-bar */}
          <div className="flex items-center justify-between gap-3 py-3 border-b border-slate-100 flex-wrap text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-semibold">{isArabic ? 'الموقع المخزني:' : 'Bin Location:'}</span>
              <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md font-mono">
                {location?.complete_name || item.location_name}
              </span>
            </div>

            {item.default_code && (
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 font-semibold">{isArabic ? 'كود الـ SKU:' : 'SKU Code:'}</span>
                <span className="font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-100">
                  {item.default_code}
                </span>
                <button
                  onClick={() => handleCopy(item.default_code, 'sku')}
                  className="text-slate-400 hover:text-purple-600 p-0.5"
                >
                  {copied === 'sku' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            )}
          </div>

          {/* Hero Stock Breakdown Banner */}
          <div className="my-5 p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-xl relative overflow-hidden">
            <div className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-1">
              {isArabic ? 'الرصيد الحر المتاح للصرف (Available Quantity)' : 'Free Available Quantity'}
            </div>

            <div className="flex items-baseline gap-3 my-2">
              <span className={`text-4xl sm:text-5xl font-black tracking-tight ${
                isOut ? 'text-slate-400' : isLowStock ? 'text-amber-400' : 'text-emerald-400'
              }`}>
                {item.available_quantity.toLocaleString()}
              </span>
              <span className="text-lg font-semibold text-slate-300">
                {item.uom}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-700/80 text-xs">
              <div className="flex items-center justify-between bg-slate-800/80 px-3 py-2 rounded-xl">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Boxes className="w-3.5 h-3.5 text-purple-400" />
                  {isArabic ? 'الرصيد الفعلي (On Hand):' : 'Physical On Hand:'}
                </span>
                <strong className="text-white text-sm font-bold font-mono">
                  {item.quantity} {item.uom}
                </strong>
              </div>

              <div className="flex items-center justify-between bg-slate-800/80 px-3 py-2 rounded-xl">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  {isArabic ? 'محجوز لطلبيات (Reserved):' : 'Reserved Orders:'}
                </span>
                <strong className="text-amber-300 text-sm font-bold font-mono">
                  {item.reserved_quantity} {item.uom}
                </strong>
              </div>
            </div>
          </div>

          {/* Grid of Product Attributes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5 text-xs">
            {/* Barcode block */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
              <span className="text-slate-500 font-semibold block">{isArabic ? 'الباركود الدولي (Barcode)' : 'Product Barcode'}</span>
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm font-bold text-slate-800">{item.barcode || '—'}</span>
                {item.barcode && (
                  <button
                    onClick={() => handleCopy(item.barcode, 'barcode')}
                    className="text-slate-400 hover:text-purple-600"
                    title={isArabic ? 'نسخ الباركود' : 'Copy Barcode'}
                  >
                    {copied === 'barcode' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                )}
              </div>
            </div>

            {/* Warehouse Location Block */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
              <span className="text-slate-500 font-semibold block">{isArabic ? 'الموقع المخزني' : 'Stock Location'}</span>
              <div className="font-mono text-sm font-bold text-slate-800">
                {location?.complete_name || item.location_name}
              </div>
              <div className="text-[11px] text-slate-500">
                {location?.zone || 'Stock Bay'}
              </div>
            </div>

            {/* Lot / Serial number if exists */}
            {item.lot_number && (
              <div className="p-3.5 rounded-xl border border-indigo-200 bg-indigo-50/50 space-y-1 col-span-1 sm:col-span-2">
                <span className="text-indigo-800 font-semibold flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-indigo-600" />
                  {isArabic ? 'رقم التشغيلة (Lot / Serial Number)' : 'Lot / Serial Number'}
                </span>
                <div className="font-mono font-bold text-indigo-950 text-sm">
                  {item.lot_number}
                </div>
                {item.expiry_date && (
                  <div className="text-[11px] text-indigo-600 flex items-center gap-1 mt-1">
                    <Calendar className="w-3 h-3" />
                    <span>{isArabic ? 'تاريخ الصلاحية:' : 'Expiry Date:'} {item.expiry_date}</span>
                  </div>
                )}
              </div>
            )}

            {/* Package / Pallet if exists */}
            {item.package_name && (
              <div className="p-3.5 rounded-xl border border-purple-200 bg-purple-50/50 space-y-1 col-span-1 sm:col-span-2">
                <span className="text-purple-800 font-semibold flex items-center gap-1">
                  <Package className="w-3.5 h-3.5 text-purple-600" />
                  {isArabic ? 'الطرد أو البالتة (Package/Pallet)' : 'Packaging / Pallet ID'}
                </span>
                <div className="font-mono font-bold text-purple-950 text-sm">
                  {item.package_name}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3 flex-wrap">
          {odooDirectLink ? (
            <a
              href={odooDirectLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>{isArabic ? 'فتح المنتج في أودو 18 (Odoo 18)' : 'Open Product in Odoo 18'}</span>
            </a>
          ) : (
            <span className="text-xs text-slate-400">
              {isArabic ? 'معرف المنتج في أودو: ' : 'Odoo Product ID: '} #{item.product_id}
            </span>
          )}

          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors ms-auto"
          >
            {isArabic ? 'إغلاق' : 'Close'}
          </button>
        </div>

      </div>
    </div>
  );
};
