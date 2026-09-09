import React from 'react';
import { X, Printer, Warehouse, Barcode, Calendar } from 'lucide-react';
import { StockItem, WarehouseLocation } from '../types';

interface PrintAuditSheetProps {
  isOpen: boolean;
  onClose: () => void;
  location: WarehouseLocation | null;
  items: StockItem[];
  language: 'ar' | 'en';
}

export const PrintAuditSheet: React.FC<PrintAuditSheetProps> = ({
  isOpen,
  onClose,
  location,
  items,
  language,
}) => {
  const isArabic = language === 'ar';

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const currentDate = new Date().toLocaleDateString(isArabic ? 'ar-EG' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-4xl w-full p-6 sm:p-8 max-h-[95vh] overflow-y-auto print:max-h-none print:shadow-none print:border-none print:p-0">
        
        {/* Controls (Hidden when printing) */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-6 print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-purple-600" />
            <span className="font-bold text-slate-800 text-sm">
              {isArabic ? 'ورقة جرد المخزون الفعلية للموقع' : 'Physical Stock Audit Count Sheet'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>{isArabic ? 'طباعة الورقة (Print)' : 'Print Sheet'}</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
            >
              {isArabic ? 'إغلاق' : 'Close'}
            </button>
          </div>
        </div>

        {/* Printable Paper Canvas */}
        <div className="space-y-6 text-slate-900 print:text-black">
          
          {/* Header */}
          <div className="border-b-2 border-slate-800 pb-4 flex items-start justify-between">
            <div>
              <h1 className="text-xl font-black uppercase tracking-tight">
                {isArabic ? 'استمارة جرد ومطابقة المخزون بالموقع' : 'Warehouse Location Stock Audit Sheet'}
              </h1>
              <p className="text-xs text-slate-500 print:text-slate-700 mt-1">
                Odoo 18 Inventory Management System • {location?.complete_name}
              </p>
            </div>
            <div className="text-end text-xs space-y-1">
              <div className="font-bold">
                {isArabic ? 'التاريخ:' : 'Date:'} {currentDate}
              </div>
              <div className="font-mono text-slate-500">
                {location?.barcode ? `BARCODE: ${location.barcode}` : 'BIN-AUDIT'}
              </div>
            </div>
          </div>

          {/* Location Info Box */}
          <div className="grid grid-cols-3 gap-4 p-3.5 bg-slate-50 print:bg-white border border-slate-200 text-xs">
            <div>
              <span className="text-slate-400 block">{isArabic ? 'الموقع المخزني المحدد' : 'Warehouse Location'}</span>
              <strong className="text-sm font-bold">{location?.name}</strong>
              <div className="font-mono text-[11px] text-slate-500">{location?.complete_name}</div>
            </div>
            <div>
              <span className="text-slate-400 block">{isArabic ? 'المنطقة / الرف' : 'Zone / Rack'}</span>
              <strong className="text-sm font-bold">{location?.zone || 'General Zone'}</strong>
              <div className="text-[11px] text-slate-500">{location?.rack || 'Standard Bay'}</div>
            </div>
            <div>
              <span className="text-slate-400 block">{isArabic ? 'إجمالي الأصناف' : 'SKU Count'}</span>
              <strong className="text-sm font-bold">{items.length} {isArabic ? 'أصناف مسجلة' : 'Items'}</strong>
            </div>
          </div>

          {/* Audit Table */}
          <table className="w-full text-xs border border-slate-300">
            <thead>
              <tr className="bg-slate-100 print:bg-slate-200 border-b border-slate-300 text-slate-700 font-bold uppercase text-[10px]">
                <th className="py-2.5 px-3 text-start border-e border-slate-300">#</th>
                <th className="py-2.5 px-3 text-start border-e border-slate-300">{isArabic ? 'كود الـ SKU / الباركود' : 'SKU / Barcode'}</th>
                <th className="py-2.5 px-3 text-start border-e border-slate-300">{isArabic ? 'اسم المنتج' : 'Product Description'}</th>
                <th className="py-2.5 px-3 text-center border-e border-slate-300">{isArabic ? 'الوحدة' : 'UoM'}</th>
                <th className="py-2.5 px-3 text-center border-e border-slate-300">{isArabic ? 'الرصيد بالسيستم' : 'System On Hand'}</th>
                <th className="py-2.5 px-3 text-center border-e border-slate-300 font-bold text-purple-900 bg-purple-50 print:bg-transparent">
                  {isArabic ? 'المتاح (Available)' : 'Available'}
                </th>
                <th className="py-2.5 px-4 text-center border-e border-slate-300 w-24 bg-amber-50/50 print:bg-transparent font-bold">
                  {isArabic ? 'العد الفعلي' : 'Physical Count'}
                </th>
                <th className="py-2.5 px-3 text-center w-20">{isArabic ? 'الفارق (+/-)' : 'Variance'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {items.map((item, index) => (
                <tr key={item.id} className="h-9">
                  <td className="py-2 px-3 text-start border-e border-slate-300 font-mono">{index + 1}</td>
                  <td className="py-2 px-3 text-start border-e border-slate-300 font-mono">
                    <div className="font-bold text-slate-900">{item.default_code || '—'}</div>
                    <div className="text-[10px] text-slate-500">{item.barcode}</div>
                  </td>
                  <td className="py-2 px-3 text-start border-e border-slate-300">
                    <div className="font-medium text-slate-900">{item.product_name}</div>
                    {item.lot_number && (
                      <div className="text-[10px] text-slate-500">Lot: {item.lot_number}</div>
                    )}
                  </td>
                  <td className="py-2 px-3 text-center border-e border-slate-300 text-slate-600">{item.uom}</td>
                  <td className="py-2 px-3 text-center border-e border-slate-300 font-bold">{item.quantity}</td>
                  <td className="py-2 px-3 text-center border-e border-slate-300 font-black text-slate-900 bg-purple-50/30 print:bg-transparent">
                    {item.available_quantity}
                  </td>
                  <td className="py-2 px-4 border-e border-slate-300 text-center bg-amber-50/20 print:bg-transparent">
                    {/* Blank line for pen audit */}
                    <div className="border-b border-dashed border-slate-400 h-5 w-16 mx-auto"></div>
                  </td>
                  <td className="py-2 px-3 text-center">
                    <div className="border-b border-dashed border-slate-400 h-5 w-12 mx-auto"></div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Signatures footer */}
          <div className="pt-8 grid grid-cols-2 gap-8 text-xs border-t border-slate-200">
            <div>
              <span className="block text-slate-500 mb-1">{isArabic ? 'اسم أمين المخزن / القائم بالجرد:' : 'Auditor / Storekeeper Name:'}</span>
              <div className="border-b border-slate-400 h-7 w-full"></div>
            </div>
            <div>
              <span className="block text-slate-500 mb-1">{isArabic ? 'توقيع واعتماد مدير المستودع:' : 'Warehouse Supervisor Signature:'}</span>
              <div className="border-b border-slate-400 h-7 w-full"></div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
