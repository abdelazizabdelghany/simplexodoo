import React from 'react';
import { 
  PackageCheck, 
  Layers, 
  Clock, 
  ShieldCheck, 
  AlertTriangle, 
  TrendingUp,
  Boxes
} from 'lucide-react';
import { LocationSummary, FilterStatus } from '../types';

interface LocationSummaryBannerProps {
  summary: LocationSummary;
  activeFilter: FilterStatus;
  onSelectFilter: (filter: FilterStatus) => void;
  language: 'ar' | 'en';
}

export const LocationSummaryBanner: React.FC<LocationSummaryBannerProps> = ({
  summary,
  activeFilter,
  onSelectFilter,
  language,
}) => {
  const isArabic = language === 'ar';
  const availabilityRate = summary.totalOnHand > 0 
    ? Math.min(100, Math.round((summary.totalAvailable / summary.totalOnHand) * 100))
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        
        {/* HERO CARD: Available Quantity (الكمية المتاحة للبيع أو الصرف) */}
        <div 
          onClick={() => onSelectFilter(activeFilter === 'available' ? 'all' : 'available')}
          className={`col-span-2 sm:col-span-1 p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
            activeFilter === 'available'
              ? 'bg-gradient-to-br from-emerald-600 to-teal-700 text-white border-emerald-600 shadow-lg shadow-emerald-700/20 ring-2 ring-emerald-400'
              : 'bg-white border-slate-200/90 hover:border-emerald-300 hover:shadow-md'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-bold uppercase tracking-wider ${
              activeFilter === 'available' ? 'text-emerald-100' : 'text-slate-500'
            }`}>
              {isArabic ? 'الكمية المتاحة (Available)' : 'Available Quantity'}
            </span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              activeFilter === 'available' ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-600'
            }`}>
              <PackageCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl sm:text-3xl font-black tracking-tight ${
              activeFilter === 'available' ? 'text-white' : 'text-emerald-600'
            }`}>
              {summary.totalAvailable.toLocaleString()}
            </span>
            <span className={`text-xs font-medium ${
              activeFilter === 'available' ? 'text-emerald-200' : 'text-slate-400'
            }`}>
              {isArabic ? 'وحدة جاهزة للصرف' : 'units free'}
            </span>
          </div>
          <div className={`mt-2 text-[11px] flex items-center gap-1 ${
            activeFilter === 'available' ? 'text-emerald-100' : 'text-slate-500'
          }`}>
            <span className="font-semibold">
              {summary.totalOnHand > 0 ? Math.round((summary.totalAvailable / summary.totalOnHand) * 100) : 0}%
            </span>
            <span>{isArabic ? 'من إجمالي رصيد المخزن' : 'of on-hand stock'}</span>
          </div>
        </div>

        {/* Card 2: Total On Hand (إجمالي الرصيد الفعلي) */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {isArabic ? 'الرصيد الفعلي (On Hand)' : 'Total On Hand'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {summary.totalOnHand.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              {isArabic ? 'وحدة' : 'units'}
            </span>
          </div>
          <p className="mt-2 text-[11px] text-slate-500">
            {isArabic ? 'الموجود فعلياً باللوكيشن' : 'Physical count in bin'}
          </p>
        </div>

        {/* Card 3: Reserved Quantity (الكميات المحجوزة) */}
        <div 
          onClick={() => onSelectFilter(activeFilter === 'reserved' ? 'all' : 'reserved')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeFilter === 'reserved'
              ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-300'
              : 'bg-white border-slate-200/90 hover:border-amber-300 hover:shadow-md'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {isArabic ? 'المحجوز (Reserved)' : 'Reserved Quantity'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-amber-600 tracking-tight">
              {summary.totalReserved.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              {isArabic ? 'وحدة محجوزة' : 'reserved'}
            </span>
          </div>
          <p className="mt-2 text-[11px] text-slate-500">
            {isArabic ? 'طلبيات تسليم / شحن قيد التنفيذ' : 'Allocated for delivery orders'}
          </p>
        </div>

        {/* Card 4: Total SKUs / Products Count */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {isArabic ? 'عدد الأصناف (SKUs)' : 'Unique Products'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {summary.totalSkus}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              {isArabic ? 'صنف مختلف' : 'items'}
            </span>
          </div>
          <p className="mt-2 text-[11px] text-slate-500">
            {isArabic ? 'مسجلة في هذا اللوكيشن' : 'Distinct products assigned'}
          </p>
        </div>

        {/* Card 5: Availability Rate & Alerts */}
        <div className="col-span-2 sm:col-span-1 p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {isArabic ? 'نسبة الجاهزية للطلب' : 'Availability Rate'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {availabilityRate}%
            </span>
            <span className="text-xs text-slate-400 font-medium">
              {isArabic ? 'متاح فورياً' : 'unreserved'}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-2">
            {summary.lowStockItems > 0 && (
              <button
                onClick={() => onSelectFilter(activeFilter === 'low' ? 'all' : 'low')}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 px-2 py-0.5 rounded-md border border-rose-200 transition-colors"
              >
                <AlertTriangle className="w-3 h-3" />
                <span>{summary.lowStockItems} {isArabic ? 'منخفض' : 'low'}</span>
              </button>
            )}
            {summary.outOfStockItems > 0 && (
              <button
                onClick={() => onSelectFilter(activeFilter === 'out' ? 'all' : 'out')}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded-md border border-slate-200 transition-colors"
              >
                <span>{summary.outOfStockItems} {isArabic ? 'نفد' : 'out'}</span>
              </button>
            )}
            {summary.lowStockItems === 0 && summary.outOfStockItems === 0 && (
              <span className="text-[11px] font-medium text-emerald-600 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                {isArabic ? 'المستويات مثالية' : 'Stock levels optimal'}
              </span>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
