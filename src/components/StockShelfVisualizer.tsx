import React from 'react';
import { 
  Grid3X3, 
  Layers, 
  Package, 
  MapPin, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';
import { StockItem, WarehouseLocation } from '../types';

interface StockShelfVisualizerProps {
  items: StockItem[];
  location: WarehouseLocation | null;
  onSelectProduct: (item: StockItem) => void;
  language: 'ar' | 'en';
}

export const StockShelfVisualizer: React.FC<StockShelfVisualizerProps> = ({
  items,
  location,
  onSelectProduct,
  language,
}) => {
  const isArabic = language === 'ar';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-6">
        
        {/* Header explanation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Grid3X3 className="w-5 h-5 text-purple-600" />
              <span>{isArabic ? 'خريطة الأرفف والمقصورات التخزينية' : 'Warehouse Bin & Slot Schematic'}</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {isArabic 
                ? `محاكاة توزيع الأصناف ومستوى امتلاء المخزون المتاح داخل ${location?.complete_name || 'الموقع'}`
                : `Visual layout of product slots and available inventory distribution in ${location?.complete_name || 'location'}`}
            </p>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-emerald-500"></span>
              <span className="text-slate-600">{isArabic ? 'متاح كافي' : 'Available (Optimal)'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-amber-400"></span>
              <span className="text-slate-600">{isArabic ? 'منخفض / حرج' : 'Low Stock'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-slate-300"></span>
              <span className="text-slate-600">{isArabic ? 'غير متاح' : 'Out of Stock'}</span>
            </div>
          </div>
        </div>

        {/* Bins Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item, index) => {
            const slotNumber = `SLOT-${String(index + 1).padStart(2, '0')}`;
            const isAvailableZero = item.available_quantity <= 0;
            const isLowStock = item.status === 'low';

            let slotBorder = 'border-emerald-300 hover:border-emerald-500 bg-emerald-50/20';
            let badgeBg = 'bg-emerald-100 text-emerald-800';

            if (isAvailableZero) {
              slotBorder = 'border-slate-300 hover:border-slate-400 bg-slate-50';
              badgeBg = 'bg-slate-100 text-slate-500';
            } else if (isLowStock) {
              slotBorder = 'border-amber-300 hover:border-amber-500 bg-amber-50/20';
              badgeBg = 'bg-amber-100 text-amber-800';
            }

            return (
              <div
                key={item.id}
                onClick={() => onSelectProduct(item)}
                className={`p-4 rounded-xl border-2 transition-all cursor-pointer shadow-xs hover:shadow-lg flex flex-col justify-between group ${slotBorder}`}
              >
                <div>
                  {/* Slot Tag & Category */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-mono text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-100">
                      {slotNumber}
                    </span>
                    <span className="text-[10px] text-slate-400 truncate max-w-[100px]">
                      {item.category}
                    </span>
                  </div>

                  {/* Product Title */}
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-purple-700 transition-colors line-clamp-2 mb-1.5">
                    {item.product_name}
                  </h4>

                  {/* SKU */}
                  <div className="text-[11px] font-mono text-slate-500 truncate mb-3">
                    SKU: {item.default_code || 'N/A'}
                  </div>
                </div>

                {/* Available Quantity Highlight */}
                <div className="pt-2 border-t border-slate-200/70">
                  <div className="flex items-baseline justify-between mb-1">
                    <span className="text-[11px] font-bold text-slate-600">
                      {isArabic ? 'المتاح:' : 'Available:'}
                    </span>
                    <span className={`font-black text-lg px-2 py-0.5 rounded-md ${badgeBg}`}>
                      {item.available_quantity} {item.uom}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>{isArabic ? 'الفعلي:' : 'On Hand:'} {item.quantity}</span>
                    <span>{isArabic ? 'المحجوز:' : 'Reserved:'} {item.reserved_quantity}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};
