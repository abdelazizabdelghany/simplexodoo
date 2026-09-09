import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  WarehouseLocation, 
  StockItem, 
  OdooCredentials, 
  OdooConnectionStatus, 
  ViewMode, 
  FilterStatus, 
  LocationSummary 
} from './types';
import { MOCK_LOCATIONS, MOCK_STOCK_ITEMS } from './data/mockData';
import { Navbar } from './components/Navbar';
import { LocationPicker } from './components/LocationPicker';
import { LocationSummaryBanner } from './components/LocationSummaryBanner';
import { StockFilters } from './components/StockFilters';
import { StockCardGrid } from './components/StockCardGrid';
import { StockTable } from './components/StockTable';
import { StockShelfVisualizer } from './components/StockShelfVisualizer';
import { ProductDetailModal } from './components/ProductDetailModal';
import { OdooSettingsModal } from './components/OdooSettingsModal';
import { PrintAuditSheet } from './components/PrintAuditSheet';
import { 
  Loader2, 
  TableProperties, 
  BarChart3, 
  RefreshCw, 
  Building2,
  PackageCheck,
  CheckCircle2
} from 'lucide-react';

export default function App() {
  const [language, setLanguage] = useState<'ar' | 'en'>('ar');
  const isArabic = language === 'ar';

  // Navigation tab: 'inventory' (focused table & search) vs 'metrics' (quantities & indicators)
  const [activeMainTab, setActiveMainTab] = useState<'inventory' | 'metrics'>('inventory');

  // Auto-sync states
  const [isAutoSyncEnabled, setIsAutoSyncEnabled] = useState(true);
  const [isAutoSyncing, setIsAutoSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  // Odoo Credentials
  const [credentials, setCredentials] = useState<OdooCredentials>(() => {
    try {
      const saved = localStorage.getItem('odoo_credentials');
      if (saved) return JSON.parse(saved);
    } catch {
      // Ignore
    }
    return {
      url: '',
      db: '',
      username: '',
      apiKey: '',
    };
  });

  // Connection status
  const [connectionStatus, setConnectionStatus] = useState<OdooConnectionStatus>({
    isConnected: false,
    isConnecting: false,
    isDemoMode: true,
  });

  // Locations list - strictly restricted to WH05/Stock and WH04/Stock
  const [locations, setLocations] = useState<WarehouseLocation[]>(MOCK_LOCATIONS);
  const [currentLocation, setCurrentLocation] = useState<WarehouseLocation | null>(MOCK_LOCATIONS[0]);

  // Stock items list
  const [stockItems, setStockItems] = useState<StockItem[]>(() => MOCK_STOCK_ITEMS[688] || []);
  const [isLoadingStock, setIsLoadingStock] = useState(false);

  // Filters & display state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [sortBy, setSortBy] = useState<string>('available_desc');

  // Selected product for detailed modal
  const [selectedProduct, setSelectedProduct] = useState<StockItem | null>(null);

  // Modal controls
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAuditPrintOpen, setIsAuditPrintOpen] = useState(false);

  // Sync RTL / LTR on body
  useEffect(() => {
    document.documentElement.dir = isArabic ? 'rtl' : 'ltr';
    document.documentElement.lang = isArabic ? 'ar' : 'en';
  }, [isArabic]);

  // Filter allowed locations strictly to WH05/Stock and WH04/Stock
  const filterAllowedLocations = (locs: WarehouseLocation[]): WarehouseLocation[] => {
    const allowed = locs.filter(
      (l) => l.complete_name === 'WH05/Stock' || l.complete_name === 'WH04/Stock' || l.id === 688 || l.id === 680
    );
    if (allowed.length > 0) {
      return allowed.sort((a) => (a.complete_name === 'WH05/Stock' || a.id === 688 ? -1 : 1));
    }
    return MOCK_LOCATIONS;
  };

  // Fetch stock items for a given location
  const fetchStockForLocation = useCallback(async (location: WarehouseLocation, isSilent = false) => {
    if (connectionStatus.isDemoMode || !connectionStatus.isConnected) {
      const items = MOCK_STOCK_ITEMS[location.id] || MOCK_STOCK_ITEMS[688] || [];
      setStockItems(items);
      setLastSyncTime(new Date());
      return;
    }

    if (isSilent) {
      setIsAutoSyncing(true);
    } else {
      setIsLoadingStock(true);
    }

    try {
      const response = await fetch('/api/odoo/stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...credentials,
          locationId: location.id,
          includeChildLocations: false,
        }),
      });

      const data = await response.json();
      if (data.success && Array.isArray(data.items)) {
        setStockItems(data.items);
        setLastSyncTime(new Date());
      }
    } catch (err) {
      console.error('Failed to fetch stock from Odoo:', err);
    } finally {
      if (isSilent) {
        setIsAutoSyncing(false);
      } else {
        setIsLoadingStock(false);
      }
    }
  }, [connectionStatus.isDemoMode, connectionStatus.isConnected, credentials]);

  // Check server configuration and auto-connect to real Odoo instance on startup
  useEffect(() => {
    let isMounted = true;

    async function initializeOdooConnection() {
      try {
        const configRes = await fetch('/api/odoo/config');
        const configData = await configRes.json();

        if (configData.configured) {
          const loadedCreds: OdooCredentials = {
            url: configData.url,
            db: configData.db,
            username: configData.username,
            apiKey: '••••••••••••••••••••••••',
          };

          if (isMounted) {
            setCredentials(loadedCreds);
            setConnectionStatus({
              isConnected: false,
              isConnecting: true,
              isDemoMode: false,
            });
          }

          // Authenticate with server credentials
          const authRes = await fetch('/api/odoo/authenticate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(loadedCreds),
          });

          const authData = await authRes.json();

          if (authData.success && isMounted) {
            setConnectionStatus({
              isConnected: true,
              isConnecting: false,
              isDemoMode: false,
              database: authData.db,
              userName: authData.username,
              serverVersion: authData.versionInfo?.server_version || '18.0+e',
              lastChecked: new Date().toLocaleTimeString(),
            });

            // Fetch live Odoo warehouse locations
            const locRes = await fetch('/api/odoo/locations', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(loadedCreds),
            });

            const locData = await locRes.json();
            if (locData.success && Array.isArray(locData.locations) && locData.locations.length > 0 && isMounted) {
              const allowed = filterAllowedLocations(locData.locations);
              setLocations(allowed);

              // Select WH05/Stock (ID 688) by default
              const primaryLoc = 
                allowed.find((l) => l.complete_name === 'WH05/Stock' || l.id === 688) ||
                allowed[0];

              setCurrentLocation(primaryLoc);

              // Fetch live stock items for WH05/Stock
              setIsLoadingStock(true);
              try {
                const stockRes = await fetch('/api/odoo/stock', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    ...loadedCreds,
                    locationId: primaryLoc.id,
                    includeChildLocations: false,
                  }),
                });

                const stockData = await stockRes.json();
                if (stockData.success && isMounted && Array.isArray(stockData.items)) {
                  setStockItems(stockData.items);
                  setLastSyncTime(new Date());
                }
              } catch (err) {
                console.error('Error fetching initial live stock:', err);
              } finally {
                if (isMounted) setIsLoadingStock(false);
              }
            }
          } else if (isMounted) {
            setConnectionStatus({
              isConnected: false,
              isConnecting: false,
              isDemoMode: true,
              errorMessage: authData.error || 'Auto-authentication failed',
            });
          }
        }
      } catch (err) {
        console.error('Failed to initialize live Odoo connection:', err);
      }
    }

    initializeOdooConnection();

    return () => {
      isMounted = false;
    };
  }, []);

  // Background Auto-Synchronization Polling (every 15 seconds)
  useEffect(() => {
    if (!isAutoSyncEnabled || !currentLocation || connectionStatus.isDemoMode || !connectionStatus.isConnected) {
      return;
    }

    const interval = setInterval(() => {
      fetchStockForLocation(currentLocation, true);
    }, 15000);

    return () => clearInterval(interval);
  }, [isAutoSyncEnabled, currentLocation, connectionStatus.isConnected, connectionStatus.isDemoMode, fetchStockForLocation]);

  // Window Focus Auto-Sync: Refreshes stock automatically when user switches back to tab
  useEffect(() => {
    const handleWindowFocus = () => {
      if (currentLocation && connectionStatus.isConnected && !connectionStatus.isDemoMode) {
        fetchStockForLocation(currentLocation, true);
      }
    };

    window.addEventListener('focus', handleWindowFocus);
    return () => window.removeEventListener('focus', handleWindowFocus);
  }, [currentLocation, connectionStatus.isConnected, connectionStatus.isDemoMode, fetchStockForLocation]);

  // Save credentials to localStorage
  const handleSaveCredentials = (creds: OdooCredentials) => {
    setCredentials(creds);
    try {
      localStorage.setItem('odoo_credentials', JSON.stringify(creds));
    } catch {
      // Ignore
    }
  };

  // Test live connection to Odoo
  const handleTestConnection = async (creds: OdooCredentials): Promise<boolean> => {
    setConnectionStatus((prev) => ({ ...prev, isConnecting: true, errorMessage: undefined }));
    try {
      const response = await fetch('/api/odoo/authenticate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(creds),
      });

      const data = await response.json();
      if (data.success) {
        setConnectionStatus({
          isConnected: true,
          isConnecting: false,
          isDemoMode: false,
          database: data.db,
          userName: data.username,
          serverVersion: data.versionInfo?.server_version || '18.0',
          lastChecked: new Date().toLocaleTimeString(),
        });
        fetchOdooLocations(creds);
        return true;
      } else {
        setConnectionStatus((prev) => ({
          ...prev,
          isConnected: false,
          isConnecting: false,
          errorMessage: data.error || 'Authentication failed',
        }));
        return false;
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network error';
      setConnectionStatus((prev) => ({
        ...prev,
        isConnected: false,
        isConnecting: false,
        errorMessage: msg,
      }));
      return false;
    }
  };

  // Fetch locations from Odoo
  const fetchOdooLocations = async (credsToUse = credentials) => {
    if (!credsToUse.url || !credsToUse.apiKey) return;
    try {
      const response = await fetch('/api/odoo/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credsToUse),
      });
      const data = await response.json();
      if (data.success && Array.isArray(data.locations) && data.locations.length > 0) {
        const allowed = filterAllowedLocations(data.locations);
        setLocations(allowed);
        if (!currentLocation || !allowed.some((l) => l.id === currentLocation.id)) {
          const defaultLoc = allowed.find((l) => l.complete_name === 'WH05/Stock') || allowed[0];
          setCurrentLocation(defaultLoc);
          fetchStockForLocation(defaultLoc);
        }
      }
    } catch (error) {
      console.error('Error fetching Odoo locations:', error);
    }
  };

  // Switch location handler
  const handleSelectLocation = (loc: WarehouseLocation) => {
    setCurrentLocation(loc);
    fetchStockForLocation(loc);
  };

  // Toggle demo mode
  const handleToggleDemoMode = () => {
    setConnectionStatus({
      isConnected: false,
      isConnecting: false,
      isDemoMode: true,
    });
    setLocations(MOCK_LOCATIONS);
    setCurrentLocation(MOCK_LOCATIONS[0]);
    setStockItems(MOCK_STOCK_ITEMS[688] || []);
  };

  // Refresh current stock
  const handleRefreshStock = () => {
    if (currentLocation) {
      fetchStockForLocation(currentLocation, false);
    }
  };

  // Trigger manual sync
  const triggerManualSync = () => {
    if (currentLocation) {
      fetchStockForLocation(currentLocation, true);
    }
  };

  // Export to CSV without financial prices / valuation
  const handleExportCsv = () => {
    if (stockItems.length === 0) return;

    const headers = [
      'Product ID',
      'Product Name',
      'SKU / Internal Reference',
      'Barcode',
      'Category',
      'Available Quantity',
      'On Hand Quantity',
      'Reserved Quantity',
      'Unit of Measure',
      'Location',
      'Lot Number',
    ];

    const rows = stockItems.map((item) => [
      item.product_id,
      `"${item.product_name.replace(/"/g, '""')}"`,
      item.default_code,
      item.barcode,
      `"${item.category}"`,
      item.available_quantity,
      item.quantity,
      item.reserved_quantity,
      item.uom,
      `"${item.location_name || currentLocation?.complete_name}"`,
      item.lot_number || '',
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Stock_${currentLocation?.name.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Compute distinct categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    stockItems.forEach((i) => {
      if (i.category) set.add(i.category);
    });
    return Array.from(set).sort();
  }, [stockItems]);

  // Filter and sort items
  const filteredAndSortedItems = useMemo(() => {
    return stockItems
      .filter((item) => {
        // Search filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchName = item.product_name.toLowerCase().includes(q);
          const matchSku = item.default_code.toLowerCase().includes(q);
          const matchBarcode = item.barcode.toLowerCase().includes(q);
          const matchLot = item.lot_number?.toLowerCase().includes(q) || false;
          if (!matchName && !matchSku && !matchBarcode && !matchLot) return false;
        }

        // Category filter
        if (selectedCategory !== 'all' && item.category !== selectedCategory) {
          return false;
        }

        // Status filter
        if (filterStatus === 'available') {
          return item.available_quantity > 0;
        } else if (filterStatus === 'low') {
          return item.status === 'low';
        } else if (filterStatus === 'out') {
          return item.available_quantity <= 0;
        } else if (filterStatus === 'reserved') {
          return item.reserved_quantity > 0;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'available_desc') {
          return b.available_quantity - a.available_quantity;
        }
        if (sortBy === 'available_asc') {
          return a.available_quantity - b.available_quantity;
        }
        if (sortBy === 'onhand_desc') {
          return b.quantity - a.quantity;
        }
        if (sortBy === 'name_asc') {
          return a.product_name.localeCompare(b.product_name);
        }
        if (sortBy === 'reserved_desc') {
          return b.reserved_quantity - a.reserved_quantity;
        }
        return 0;
      });
  }, [stockItems, searchQuery, selectedCategory, filterStatus, sortBy]);

  // Compute location summary stats (quantities only, no valuation)
  const summary: LocationSummary = useMemo(() => {
    let totalOnHand = 0;
    let totalAvailable = 0;
    let totalReserved = 0;
    let lowStockItems = 0;
    let outOfStockItems = 0;

    stockItems.forEach((item) => {
      totalOnHand += item.quantity;
      totalAvailable += item.available_quantity;
      totalReserved += item.reserved_quantity;
      if (item.available_quantity <= 0) {
        outOfStockItems++;
      } else if (item.status === 'low') {
        lowStockItems++;
      }
    });

    return {
      totalSkus: stockItems.length,
      totalOnHand,
      totalAvailable,
      totalReserved,
      totalValuation: 0,
      lowStockItems,
      outOfStockItems,
      currency: '',
    };
  }, [stockItems]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-purple-100 selection:text-purple-900">
      
      {/* Top Navbar */}
      <Navbar
        currentLocation={currentLocation}
        locations={locations}
        onSelectLocation={handleSelectLocation}
        connectionStatus={connectionStatus}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenAuditPrint={() => setIsAuditPrintOpen(true)}
        onExportCsv={handleExportCsv}
        onRefreshStock={handleRefreshStock}
        isRefreshing={isLoadingStock}
        language={language}
        onToggleLanguage={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
      />

      {/* Location Selector (WH05/Stock and WH04/Stock only) */}
      <LocationPicker
        locations={locations}
        currentLocation={currentLocation}
        onSelectLocation={handleSelectLocation}
        language={language}
      />

      {/* Main Navigation Tabs & Auto-Sync Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 py-2.5">
            
            {/* View Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
              <button
                onClick={() => setActiveMainTab('inventory')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeMainTab === 'inventory'
                    ? 'bg-white text-purple-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <TableProperties className="w-4 h-4 text-purple-600" />
                <span>{isArabic ? 'جدول ومستكشف المخزون' : 'Stock Table & Explorer'}</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
                  activeMainTab === 'inventory' ? 'bg-purple-100 text-purple-800 font-bold' : 'bg-slate-200 text-slate-700'
                }`}>
                  {stockItems.length}
                </span>
              </button>

              <button
                onClick={() => setActiveMainTab('metrics')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeMainTab === 'metrics'
                    ? 'bg-white text-purple-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <BarChart3 className="w-4 h-4 text-indigo-600" />
                <span>{isArabic ? 'إحصائيات وكميات المخزون' : 'Stock Totals & Metrics'}</span>
              </button>
            </div>

            {/* Auto-Sync Live Indicator & Controls */}
            <div className="flex items-center gap-2 justify-end text-xs">
              <div 
                onClick={() => setIsAutoSyncEnabled(!isAutoSyncEnabled)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border cursor-pointer select-none transition-all ${
                  isAutoSyncEnabled ? 'bg-slate-50 border-slate-200 hover:bg-slate-100' : 'bg-slate-100/70 border-slate-300 text-slate-400'
                }`}
                title={isArabic ? 'انقر لتفعيل أو إيقاف المزامنة التلقائية' : 'Click to toggle auto-sync'}
              >
                <span className="relative flex h-2 w-2">
                  {isAutoSyncEnabled && (
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isAutoSyncing ? 'bg-amber-400' : 'bg-emerald-400'}`}></span>
                  )}
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${
                    !isAutoSyncEnabled ? 'bg-slate-400' : isAutoSyncing ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}></span>
                </span>
                <span className="font-semibold text-slate-700">
                  {isAutoSyncing 
                    ? (isArabic ? 'جارِ المزامنة الحية...' : 'Syncing with Odoo...') 
                    : isAutoSyncEnabled 
                    ? (isArabic ? 'مزامنة حية نشطة' : 'Live Auto-Sync Active') 
                    : (isArabic ? 'المزامنة متوقفة' : 'Auto-Sync Paused')}
                </span>
                {lastSyncTime && (
                  <span className="text-[10px] text-slate-400 font-mono hidden md:inline">
                    ({lastSyncTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })})
                  </span>
                )}
              </div>

              {/* Quick Sync Button */}
              <button
                onClick={triggerManualSync}
                disabled={isLoadingStock || isAutoSyncing}
                className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 flex items-center gap-1.5 transition-all shadow-2xs disabled:opacity-50"
                title={isArabic ? 'تحديث ومزامنة فورية من أودو' : 'Sync now from Odoo'}
              >
                <RefreshCw className={`w-3.5 h-3.5 text-purple-600 ${(isLoadingStock || isAutoSyncing) ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">{isArabic ? 'تحديث فوري' : 'Sync Now'}</span>
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 pb-12">
        
        {/* TAB 1: Stock Explorer & Table (User requested direct focus here) */}
        {activeMainTab === 'inventory' && (
          <div className="space-y-3.5 pt-4">
            {/* Slim quick-metric strip right above filters */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-white border border-slate-200/90 rounded-2xl px-4 py-2.5 flex items-center justify-between gap-3 text-xs flex-wrap shadow-2xs">
                <div className="flex items-center gap-3 sm:gap-6 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400 font-medium">{isArabic ? 'الأصناف:' : 'SKUs:'}</span>
                    <span className="font-bold text-slate-900">{summary.totalSkus}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-emerald-700 font-semibold">{isArabic ? 'الكمية المتاحة (Available):' : 'Available:'}</span>
                    <span className="font-black text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 font-mono text-sm">
                      {summary.totalAvailable.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500 font-medium">{isArabic ? 'الرصيد الفعلي (On Hand):' : 'On Hand:'}</span>
                    <span className="font-bold text-slate-800 font-mono">{summary.totalOnHand.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-amber-700 font-medium">{isArabic ? 'المحجوز (Reserved):' : 'Reserved:'}</span>
                    <span className="font-bold text-amber-900 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 font-mono">
                      {summary.totalReserved.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-purple-600" />
                  <span className="font-mono font-bold text-slate-700">{currentLocation?.complete_name}</span>
                </div>
              </div>
            </div>

            {/* Filters, View Switcher & Search */}
            <StockFilters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              categories={categories}
              filterStatus={filterStatus}
              onFilterStatusChange={setFilterStatus}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              sortBy={sortBy}
              onSortByChange={setSortBy}
              totalFiltered={filteredAndSortedItems.length}
              totalAll={stockItems.length}
              language={language}
            />

            {/* Loading overlay when fetching from Odoo */}
            {isLoadingStock ? (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
                <Loader2 className="w-10 h-10 text-purple-600 animate-spin mx-auto mb-3" />
                <p className="font-bold text-slate-700">
                  {isArabic ? 'جارِ جلب وتحديث الأرصدة المتاحة من Odoo 18...' : 'Fetching available stock from Odoo 18...'}
                </p>
              </div>
            ) : (
              <>
                {/* View 1: Advanced Cards */}
                {viewMode === 'cards' && (
                  <StockCardGrid
                    items={filteredAndSortedItems}
                    onSelectProduct={setSelectedProduct}
                    language={language}
                  />
                )}

                {/* View 2: High-Density Table */}
                {viewMode === 'table' && (
                  <StockTable
                    items={filteredAndSortedItems}
                    onSelectProduct={setSelectedProduct}
                    language={language}
                  />
                )}

                {/* View 3: Visual Shelf Bins */}
                {viewMode === 'visual_bins' && (
                  <StockShelfVisualizer
                    items={filteredAndSortedItems}
                    location={currentLocation}
                    onSelectProduct={setSelectedProduct}
                    language={language}
                  />
                )}
              </>
            )}
          </div>
        )}

        {/* TAB 2: Stock Metrics & Quantities (Dedicated tab for summary cards) */}
        {activeMainTab === 'metrics' && (
          <div className="space-y-6 pt-4">
            {/* Key Metrics Banner (No valuation or prices) */}
            <LocationSummaryBanner
              summary={summary}
              activeFilter={filterStatus}
              onSelectFilter={(f) => {
                setFilterStatus(f);
                setActiveMainTab('inventory'); // jump to filtered table
              }}
              language={language}
            />

            {/* Additional warehouse distribution & health overview */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Stock distribution status */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3">
                  <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                    <PackageCheck className="w-4 h-4 text-purple-600" />
                    <span>{isArabic ? 'توزيع رصيد المخزون بالموقع' : 'Stock Availability Distribution'}</span>
                  </h3>
                  
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">{isArabic ? 'الرصيد المتاح للبيع / الصرف:' : 'Available for dispatch:'}</span>
                      <strong className="text-emerald-700 font-mono text-sm">{summary.totalAvailable.toLocaleString()}</strong>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden flex">
                      <div 
                        className="bg-emerald-500 h-full"
                        style={{ width: `${summary.totalOnHand > 0 ? (summary.totalAvailable / summary.totalOnHand) * 100 : 0}%` }}
                      ></div>
                      <div 
                        className="bg-amber-500 h-full"
                        style={{ width: `${summary.totalOnHand > 0 ? (summary.totalReserved / summary.totalOnHand) * 100 : 0}%` }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between text-slate-500 pt-1">
                      <span>{isArabic ? 'الرصيد المحجوز (Reserved):' : 'Reserved for orders:'} <strong className="text-amber-700">{summary.totalReserved.toLocaleString()}</strong></span>
                      <span>{isArabic ? 'الإجمالي الفعلي (On Hand):' : 'Total physical:'} <strong className="text-slate-800">{summary.totalOnHand.toLocaleString()}</strong></span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-slate-500 text-xs">
                      {isArabic ? 'مستودع Odoo المعتمد:' : 'Active Odoo Location:'}
                    </span>
                    <span className="font-bold text-slate-800 font-mono text-xs">
                      {currentLocation?.complete_name}
                    </span>
                  </div>
                </div>

                {/* Quick actions & jump to table */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 mb-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>{isArabic ? 'حالة المزامنة والربط المباشر' : 'Live Synchronization Status'}</span>
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {isArabic 
                        ? 'يتم تحديث الأرصدة تلقائياً من خادم Odoo 18 كل 15 ثانية وعند الرجوع للتطبيق لضمان دقة الرصيد المتاح والمحجوز لحظياً.' 
                        : 'Stock is automatically refreshed from Odoo 18 SaaS every 15s and on window focus to ensure real-time accuracy.'}
                    </p>
                  </div>

                  <button
                    onClick={() => setActiveMainTab('inventory')}
                    className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center justify-center gap-2"
                  >
                    <TableProperties className="w-4 h-4" />
                    <span>{isArabic ? 'الانتقال إلى جدول ومستكشف المخزون' : 'Go to Stock Table'}</span>
                  </button>
                </div>

              </div>
            </div>
          </div>
        )}

      </main>

      {/* Product Details Modal (Simplified, no valuation) */}
      <ProductDetailModal
        item={selectedProduct}
        location={currentLocation}
        onClose={() => setSelectedProduct(null)}
        odooUrl={credentials.url}
        language={language}
      />

      {/* Odoo 18 Connection & Requirements Settings Modal */}
      <OdooSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        credentials={credentials}
        onSaveCredentials={handleSaveCredentials}
        onTestConnection={handleTestConnection}
        onFetchOdooLocations={() => fetchOdooLocations()}
        connectionStatus={connectionStatus}
        onToggleDemoMode={handleToggleDemoMode}
        language={language}
      />

      {/* Printable Physical Audit Sheet */}
      <PrintAuditSheet
        isOpen={isAuditPrintOpen}
        onClose={() => setIsAuditPrintOpen(false)}
        location={currentLocation}
        items={filteredAndSortedItems}
        language={language}
      />

    </div>
  );
}
