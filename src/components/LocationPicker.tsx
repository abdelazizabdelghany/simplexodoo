import React, { useState } from 'react';
import { 
  MapPin, 
  Barcode, 
  Layers, 
  Building2, 
  CheckCircle2
} from 'lucide-react';
import { WarehouseLocation } from '../types';

interface LocationPickerProps {
  locations: WarehouseLocation[];
  currentLocation: WarehouseLocation | null;
  onSelectLocation: (loc: WarehouseLocation) => void;
  language: 'ar' | 'en';
}

export const LocationPicker: React.FC<LocationPickerProps> = ({
  locations,
  currentLocation,
  onSelectLocation,
  language,
}) => {
  const isArabic = language === 'ar';
  const [barcodeQuery, setBarcodeQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Strict constraint: ONLY WH05/Stock and WH04/Stock
  const allowedLocations = locations
    .filter((loc) => {
      const cName = loc.complete_name || loc.name;
      return cName === 'WH05/Stock' || cName === 'WH04/Stock' || loc.id === 688 || loc.id === 680;
    })
    .sort((a) => (a.complete_name === 'WH05/Stock' || a.id === 688 ? -1 : 1));

  // If no matching filtered locations found in list, fallback to WH05 and WH04 structures
  const displayLocations: WarehouseLocation[] = allowedLocations.length > 0 ? allowedLocations : [
    {
      id: 688,
      name: 'Stock',
      complete_name: 'WH05/Stock',
      barcode: 'WH05STOCK',
      usage: 'internal',
      zone: 'Warehouse 05 - Heavy Machinery & Production',
      rack: 'Stock Bay A',
    },
    {
      id: 680,
      name: 'Stock',
      complete_name: 'WH04/Stock',
      barcode: 'WH04STOCK',
      usage: 'internal',
      zone: 'Warehouse 04 - Assembly & Storage',
      rack: 'Bay 1',
    },
  ];

  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeQuery.trim()) return;
    const match = displayLocations.find(
      (l) => l.barcode?.toLowerCase() === barcodeQuery.trim().toLowerCase() ||
             l.complete_name?.toLowerCase() === barcodeQuery.trim().toLowerCase()
    );
    if (match) {
      onSelectLocation(match);
      setBarcodeQuery('');
      setIsModalOpen(false);
    } else {
      alert(isArabic ? `لم يتم العثور على موقع بين WH05/Stock و WH04/Stock بهذا الباركود: ${barcodeQuery}` : `No location found matching WH05/Stock or WH04/Stock with barcode: ${barcodeQuery}`);
    }
  };

  // Breadcrumb segments
  const breadcrumbs = currentLocation ? (currentLocation.complete_name || currentLocation.name).split('/') : ['WH05', 'Stock'];

  return (
    <div className="bg-white border-b border-slate-200/90 py-3.5 px-4 sm:px-6 lg:px-8 shadow-2xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        
        {/* Left: Active Location Info */}
        <div className="flex-1">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-1 flex-wrap">
            <span className="flex items-center gap-1 text-slate-400">
              <Building2 className="w-3.5 h-3.5" />
              {isArabic ? 'مستودع أودو المعتمد' : 'Selected Warehouse'}
            </span>
            <span className="text-slate-300">/</span>
            {breadcrumbs.map((segment, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <span className="text-slate-300">/</span>}
                <span className={idx === breadcrumbs.length - 1 ? 'text-purple-700 font-bold' : 'text-slate-600'}>
                  {segment}
                </span>
              </React.Fragment>
            ))}
            {currentLocation?.barcode && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[11px] border border-slate-200 ms-1">
                <Barcode className="w-3 h-3 text-slate-500" />
                {currentLocation.barcode}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <MapPin className="w-5 h-5 text-purple-600 shrink-0" />
              <span>{currentLocation?.complete_name || 'WH05/Stock'}</span>
            </h1>
            {currentLocation?.zone && (
              <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 hidden sm:inline-block">
                {currentLocation.zone}
              </span>
            )}
          </div>
        </div>

        {/* Right: Direct 2-Location Switcher (WH05/Stock & WH04/Stock) */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <div className="inline-flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            {displayLocations.map((loc) => {
              const isSelected = currentLocation?.id === loc.id || 
                (currentLocation?.complete_name === loc.complete_name);
              const isWH05 = loc.complete_name === 'WH05/Stock';

              return (
                <button
                  key={loc.id}
                  onClick={() => onSelectLocation(loc)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    isSelected
                      ? 'bg-purple-700 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <CheckCircle2 className={`w-3.5 h-3.5 ${isSelected ? 'opacity-100' : 'opacity-0'}`} />
                  <span>{loc.complete_name}</span>
                  {isWH05 && (
                    <span className={`text-[10px] px-1 py-0.5 rounded font-mono ${
                      isSelected ? 'bg-purple-800 text-purple-200' : 'bg-purple-100 text-purple-700'
                    }`}>
                      {isArabic ? 'الرئيسي' : 'Primary'}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Direct Barcode input for mobile scan gun */}
          <form onSubmit={handleBarcodeSubmit} className="relative flex items-center">
            <input
              type="text"
              placeholder={isArabic ? 'امسح باركود WH05 أو WH04...' : 'Scan WH05/WH04 barcode...'}
              value={barcodeQuery}
              onChange={(e) => setBarcodeQuery(e.target.value)}
              className="w-40 sm:w-48 text-xs bg-slate-50 border border-slate-300 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl py-2 px-3 pe-8 transition-all font-mono"
            />
            <button
              type="submit"
              title={isArabic ? 'مسح باركود' : 'Scan barcode'}
              className="absolute end-2 text-slate-400 hover:text-purple-600"
            >
              <Barcode className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Modal if opened */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-purple-600" />
                <h2 className="font-bold text-slate-900 text-base">
                  {isArabic ? 'المواقع المعتمدة (WH05/Stock و WH04/Stock)' : 'Target Locations (WH05 & WH04)'}
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              {displayLocations.map((loc) => {
                const isSelected = currentLocation?.id === loc.id || 
                  (currentLocation?.complete_name === loc.complete_name);
                return (
                  <div
                    key={loc.id}
                    onClick={() => {
                      onSelectLocation(loc);
                      setIsModalOpen(false);
                    }}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'border-purple-500 bg-purple-50/70 shadow-xs ring-1 ring-purple-500'
                        : 'border-slate-200 hover:border-purple-300 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-base text-slate-900 flex items-center gap-2">
                        <span>{loc.complete_name}</span>
                        {loc.barcode && (
                          <span className="font-mono text-xs bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded">
                            {loc.barcode}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        {loc.zone}
                      </div>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="w-5 h-5 text-purple-600 shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
