import React from 'react';
import { 
  Search, 
  Filter, 
  LayoutGrid, 
  ListOrdered, 
  Grid3X3, 
  ArrowUpDown,
  X
} from 'lucide-react';
import { ViewMode, FilterStatus } from '../types';

interface StockFiltersProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  categories: string[];
  filterStatus: FilterStatus;
  onFilterStatusChange: (status: FilterStatus) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  sortBy: string;
  onSortByChange: (sort: string) => void;
  totalFiltered: number;
  totalAll: number;
  language: 'ar' | 'en';
}

export const StockFilters: React.FC<StockFiltersProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  categories,
  filterStatus,
  onFilterStatusChange,
  viewMode,
  onViewModeChange,
  sortBy,
  onSortByChange,
  totalFiltered,
  totalAll,
  language,
}) => {
  const isArabic = language === 'ar';

  const statusOptions: { id: FilterStatus; label: string }[] = [
    { id: 'all', label: isArabic ? 'الكل' : 'All' },
    { id: 'available', label: isArabic ? 'متاح فقط (>0)' : 'Available Only' },
    { id: 'low', label: isArabic ? 'مخزون منخفض' : 'Low Stock' },
    { id: 'reserved', label: isArabic ? 'يحتوي حجز' : 'Reserved' },
    { id: 'out', label: isArabic ? 'غير متوفر (0)' : 'Out of Stock' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4">
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs space-y-3.5">
        
        {/* Top Row: Search & View Switcher & Sorting */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute start-3.5 top-3" />
            <input
              type="text"
              placeholder={isArabic ? 'ابحث باسم المنتج، كود الـ SKU، الباركود أو رقم التشغيلة (Lot)...' : 'Search by product name, SKU, barcode, lot number...'}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full text-sm bg-slate-50 border border-slate-300 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl py-2.5 ps-10 pe-9 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute end-3 top-3 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Right Controls: Sort & Layout Mode */}
          <div className="flex items-center gap-2.5 justify-end">
            
            {/* Sort Select */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-700">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <select
                value={sortBy}
                onChange={(e) => onSortByChange(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-hidden cursor-pointer"
              >
                <option value="available_desc">{isArabic ? 'الكمية المتاحة (الأعلى أولاً)' : 'Available (High to Low)'}</option>
                <option value="available_asc">{isArabic ? 'الكمية المتاحة (الأقل أولاً)' : 'Available (Low to High)'}</option>
                <option value="onhand_desc">{isArabic ? 'الرصيد الفعلي (الأعلى أولاً)' : 'On Hand (High to Low)'}</option>
                <option value="name_asc">{isArabic ? 'الاسم (أ - ي)' : 'Name (A - Z)'}</option>
                <option value="reserved_desc">{isArabic ? 'الأعلى حجوزات' : 'Most Reserved'}</option>
              </select>
            </div>

            {/* View Mode Toggle: Cards vs Table vs Shelf Grid */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => onViewModeChange('cards')}
                title={isArabic ? 'عرض البطاقات' : 'Card View'}
                className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
                  viewMode === 'cards'
                    ? 'bg-white text-purple-700 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => onViewModeChange('table')}
                title={isArabic ? 'عرض الجدول المفصل' : 'Table View'}
                className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
                  viewMode === 'table'
                    ? 'bg-white text-purple-700 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <ListOrdered className="w-4 h-4" />
              </button>
              <button
                onClick={() => onViewModeChange('visual_bins')}
                title={isArabic ? 'خريطة أرفف الموقع (Shelf Map)' : 'Shelf Map View'}
                className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
                  viewMode === 'visual_bins'
                    ? 'bg-white text-purple-700 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>

        {/* Bottom Row: Category & Status Filter Pills */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
          
          {/* Status Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {statusOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => onFilterStatusChange(opt.id)}
                className={`px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap transition-all ${
                  filterStatus === opt.id
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Category Dropdown & Items Count info */}
          <div className="flex items-center gap-3 justify-between sm:justify-end text-xs text-slate-500">
            {categories.length > 1 && (
              <div className="flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={selectedCategory}
                  onChange={(e) => onSelectCategory(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium rounded-lg px-2 py-1 focus:outline-hidden"
                >
                  <option value="all">{isArabic ? 'جميع الفئات' : 'All Categories'}</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="font-semibold text-slate-700 shrink-0">
              {isArabic ? (
                <span>عرض {totalFiltered} من {totalAll} صنف</span>
              ) : (
                <span>Showing {totalFiltered} of {totalAll} items</span>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
