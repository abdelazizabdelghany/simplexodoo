import React from 'react';
import { 
  Boxes, 
  Database, 
  Printer, 
  Download, 
  Globe, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw,
  Warehouse,
  ChevronDown
} from 'lucide-react';
import { WarehouseLocation, OdooConnectionStatus } from '../types';

interface NavbarProps {
  currentLocation: WarehouseLocation | null;
  locations: WarehouseLocation[];
  onSelectLocation: (location: WarehouseLocation) => void;
  connectionStatus: OdooConnectionStatus;
  onOpenSettings: () => void;
  onOpenAuditPrint: () => void;
  onExportCsv: () => void;
  onRefreshStock: () => void;
  isRefreshing: boolean;
  language: 'ar' | 'en';
  onToggleLanguage: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentLocation,
  locations,
  onSelectLocation,
  connectionStatus,
  onOpenSettings,
  onOpenAuditPrint,
  onExportCsv,
  onRefreshStock,
  isRefreshing,
  language,
  onToggleLanguage,
}) => {
  const isArabic = language === 'ar';

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-purple-600/20">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-slate-900 tracking-tight">
                  {isArabic ? 'مستكشف مخزون أودو 18' : 'Odoo 18 Stock Explorer'}
                </span>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                  v18 SaaS
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                {isArabic ? 'تتبع الكميات المتاحة (Available Quantity) حسب الموقع' : 'Real-time location available stock tracker'}
              </p>
            </div>
          </div>

          {/* Location Quick Switcher */}
          <div className="hidden md:flex items-center">
            <div className="relative group">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100/90 hover:bg-slate-200/80 border border-slate-300/80 rounded-lg text-sm text-slate-700 cursor-pointer transition-colors">
                <Warehouse className="w-4 h-4 text-purple-600 shrink-0" />
                <span className="font-semibold text-slate-800 max-w-[200px] truncate">
                  {currentLocation ? currentLocation.complete_name : (isArabic ? 'اختر الموقع' : 'Select Location')}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </div>
              
              {/* Dropdown Menu */}
              <div className="absolute top-full mt-1.5 start-0 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 hidden group-hover:block z-50 animate-in fade-in slide-in-from-top-1">
                <div className="px-3 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100 mb-1">
                  {isArabic ? 'مواقع المستودع المتوفرة' : 'Warehouse Locations'}
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {locations.map((loc) => (
                    <button
                      key={loc.id}
                      onClick={() => onSelectLocation(loc)}
                      className={`w-full text-start px-3 py-2 text-sm flex items-center justify-between hover:bg-purple-50 transition-colors ${
                        currentLocation?.id === loc.id ? 'bg-purple-50/80 text-purple-900 font-semibold' : 'text-slate-700'
                      }`}
                    >
                      <div className="truncate">
                        <div className="text-xs font-medium text-slate-900 truncate">{loc.name}</div>
                        <div className="text-[11px] text-slate-400 truncate">{loc.complete_name}</div>
                      </div>
                      {loc.barcode && (
                        <span className="text-[10px] font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 shrink-0 ms-2">
                          {loc.barcode}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons & Connection Badge */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Refresh Button */}
            <button
              onClick={onRefreshStock}
              disabled={isRefreshing}
              title={isArabic ? 'تحديث المخزون' : 'Refresh Stock'}
              className="p-2 text-slate-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg border border-slate-200 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-purple-600' : ''}`} />
            </button>

            {/* Audit Print Sheet */}
            <button
              onClick={onOpenAuditPrint}
              title={isArabic ? 'طباعة جرد الموقع' : 'Print Stock Audit Sheet'}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 rounded-lg transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>{isArabic ? 'ورقة جرد' : 'Stock Sheet'}</span>
            </button>

            {/* CSV Export */}
            <button
              onClick={onExportCsv}
              title={isArabic ? 'تصدير إكسيل / CSV' : 'Export to CSV'}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 rounded-lg transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>{isArabic ? 'تصدير' : 'Export'}</span>
            </button>

            {/* Connection Status Button */}
            <button
              onClick={onOpenSettings}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                connectionStatus.isConnected
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100/80'
                  : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100/80'
              }`}
            >
              <Database className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate max-w-[120px] sm:max-w-none">
                {connectionStatus.isConnected
                  ? (isArabic ? 'متصل بـ Odoo 18' : 'Odoo 18 Connected')
                  : (isArabic ? 'وضع المعاينة (Demo)' : 'Demo Mode')}
              </span>
              {connectionStatus.isConnected ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
              )}
            </button>

            {/* Language Toggle Button */}
            <button
              onClick={onToggleLanguage}
              title={isArabic ? 'Switch to English' : 'التبديل إلى العربية'}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
            >
              <Globe className="w-3.5 h-3.5 text-slate-500" />
              <span>{isArabic ? 'EN' : 'عربي'}</span>
            </button>

          </div>
        </div>
      </div>
    </header>
  );
};
