import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json());

// Helper function for standard Odoo JSON-RPC calls
async function callOdooJsonRpc(url: string, service: string, method: string, args: unknown[]) {
  const cleanUrl = url.replace(/\/+$/, '');
  const endpoint = `${cleanUrl}/jsonrpc`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 seconds timeout

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'call',
        params: {
          service,
          method,
          args,
        },
        id: Math.floor(Math.random() * 1000000),
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    if (data.error) {
      const errorMsg = data.error.data?.message || data.error.message || 'Odoo RPC returned an error';
      throw new Error(errorMsg);
    }

    return data.result;
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    if (err instanceof Error) {
      throw err;
    }
    throw new Error(String(err));
  }
}

// Helper to resolve Odoo credentials from request body or process.env
function resolveCredentials(body: Record<string, any> = {}) {
  const url = (body.url || process.env.ODOO_URL || '').trim().replace(/\/+$/, '');
  const db = (body.db || process.env.ODOO_DB || '').trim();
  const username = (body.username || process.env.ODOO_USERNAME || '').trim();
  const apiKey = (body.apiKey || process.env.ODOO_API_KEY || '').trim();
  return { url, db, username, apiKey };
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Odoo Configuration Status endpoint
app.get('/api/odoo/config', (req, res) => {
  const hasEnv = Boolean(
    process.env.ODOO_URL &&
    process.env.ODOO_DB &&
    process.env.ODOO_USERNAME &&
    process.env.ODOO_API_KEY
  );

  res.json({
    configured: hasEnv,
    url: process.env.ODOO_URL || '',
    db: process.env.ODOO_DB || '',
    username: process.env.ODOO_USERNAME || '',
    hasApiKey: Boolean(process.env.ODOO_API_KEY),
  });
});

// Odoo Test & Authenticate endpoint
app.post('/api/odoo/authenticate', async (req, res) => {
  try {
    const { url, db, username, apiKey } = resolveCredentials(req.body);

    if (!url || !db || !username || !apiKey) {
      return res.status(400).json({
        success: false,
        error: 'Please provide all 4 parameters: url, db, username, apiKey',
      });
    }

    // Call Odoo common service authenticate
    const uid = await callOdooJsonRpc(url, 'common', 'authenticate', [
      db,
      username,
      apiKey,
      {},
    ]);

    if (!uid) {
      return res.status(401).json({
        success: false,
        error: 'Authentication failed. Please verify your Database name, Username/Email, and API Key.',
      });
    }

    // Optionally retrieve server version info
    let versionInfo = null;
    try {
      versionInfo = await callOdooJsonRpc(url, 'common', 'version', []);
    } catch {
      // Non-fatal
    }

    return res.json({
      success: true,
      uid,
      db,
      username,
      versionInfo,
      message: 'Successfully authenticated with Odoo 18!',
    });
  } catch (error: unknown) {
    console.error('Odoo authenticate error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to connect to Odoo server',
    });
  }
});

// Odoo Get Warehouse Locations endpoint
app.post('/api/odoo/locations', async (req, res) => {
  try {
    const { url, db, username, apiKey } = resolveCredentials(req.body);

    if (!url || !db || !username || !apiKey) {
      return res.status(400).json({ success: false, error: 'Missing credentials' });
    }

    const uid = await callOdooJsonRpc(url, 'common', 'authenticate', [
      db,
      username,
      apiKey,
      {},
    ]);

    if (!uid) {
      return res.status(401).json({ success: false, error: 'Invalid Odoo credentials' });
    }

    // Search internal & view locations
    const locations: any[] = await callOdooJsonRpc(url, 'object', 'execute_kw', [
      db,
      uid,
      apiKey,
      'stock.location',
      'search_read',
      [[['usage', 'in', ['internal', 'view', 'transit']]]],
      {
        fields: ['id', 'name', 'complete_name', 'barcode', 'usage', 'location_id', 'posx', 'posy', 'posz'],
        order: 'complete_name asc',
        limit: 150,
      },
    ]);

    const enrichedLocations = (locations || []).map((loc: any) => {
      const parts = (loc.complete_name || loc.name || '').split('/');
      let zone = 'Main Zone';
      let rack = 'Bay 1';
      if (parts.length > 2) {
        zone = parts[1] || 'Main Zone';
        rack = parts.slice(2).join(' / ');
      } else if (parts.length === 2) {
        zone = parts[0];
        rack = parts[1];
      }

      return {
        id: loc.id,
        name: loc.name,
        complete_name: loc.complete_name || loc.name,
        barcode: loc.barcode || undefined,
        usage: loc.usage,
        parent_id: loc.location_id,
        posx: loc.posx,
        posy: loc.posy,
        posz: loc.posz,
        zone,
        rack,
      };
    });

    // User constraint: ONLY WH05/Stock and WH04/Stock
    const allowedLocations = enrichedLocations
      .filter((l: any) => l.complete_name === 'WH05/Stock' || l.complete_name === 'WH04/Stock')
      .sort((a: any, b: any) => (a.complete_name === 'WH05/Stock' ? -1 : 1));

    return res.json({ 
      success: true, 
      locations: allowedLocations.length > 0 ? allowedLocations : enrichedLocations 
    });
  } catch (error: unknown) {
    console.error('Odoo locations error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Error fetching locations',
    });
  }
});

// Odoo Get Stock Quant for a specific Location
app.post('/api/odoo/stock', async (req, res) => {
  try {
    const { url, db, username, apiKey } = resolveCredentials(req.body);
    const locationId = req.body.locationId;
    const includeChildLocations = req.body.includeChildLocations;

    if (!url || !db || !username || !apiKey || !locationId) {
      return res.status(400).json({ success: false, error: 'Missing parameters or locationId' });
    }

    const uid = await callOdooJsonRpc(url, 'common', 'authenticate', [
      db,
      username,
      apiKey,
      {},
    ]);

    if (!uid) {
      return res.status(401).json({ success: false, error: 'Invalid Odoo credentials' });
    }

    // Search domain for stock.quant
    const operator = includeChildLocations ? 'child_of' : '=';
    const domain: unknown[] = [
      ['location_id', operator, Number(locationId)],
      ['quantity', '!=', 0],
    ];

    // Read stock quants (up to 500)
    const quants: any[] = await callOdooJsonRpc(url, 'object', 'execute_kw', [
      db,
      uid,
      apiKey,
      'stock.quant',
      'search_read',
      [domain],
      {
        fields: [
          'id',
          'product_id',
          'location_id',
          'quantity',
          'reserved_quantity',
          'lot_id',
          'package_id',
          'in_date',
        ],
        limit: 500,
      },
    ]);

    if (!quants || quants.length === 0) {
      return res.json({ success: true, items: [] });
    }

    // Extract product IDs
    const productIds = Array.from(new Set(quants.map(q => q.product_id[0])));

    // Fetch product details
    const products: any[] = await callOdooJsonRpc(url, 'object', 'execute_kw', [
      db,
      uid,
      apiKey,
      'product.product',
      'search_read',
      [[['id', 'in', productIds]]],
      {
        fields: [
          'id',
          'name',
          'default_code',
          'barcode',
          'categ_id',
          'uom_id',
          'standard_price',
          'lst_price',
        ],
        limit: 500,
      },
    ]);

    const productMap = new Map<number, any>();
    products.forEach(p => productMap.set(p.id, p));

    // Combine into formatted StockItem list
    const items = quants.map((q: any) => {
      const prod = productMap.get(q.product_id[0]) || {};
      const onHand = Number(q.quantity || 0);
      const reserved = Number(q.reserved_quantity || 0);
      const available = Math.max(0, onHand - reserved);
      const standardPrice = Number(prod.standard_price || 0);
      const minStock = 10;

      let status: 'optimal' | 'low' | 'out_of_stock' = 'optimal';
      if (available <= 0) {
        status = 'out_of_stock';
      } else if (available <= minStock) {
        status = 'low';
      }

      // Clean product name: if Odoo returns "[REF] Product Name (Variant, Attributes)", strip the leading [REF]
      // to keep exact product name + variants, matching user request:
      // "Fiber Laser (Open-N, 6020, No, 6 Kw, No, Raytools-MB06k, MAX, FSCUT 2000, Delta, S&A, 50 KVA, None, No, No)"
      let rawName = (Array.isArray(q.product_id) && q.product_id[1]) ? q.product_id[1] : (prod.name || prod.display_name || 'Unknown Product');
      // If rawName starts with [REFERENCE] Product..., strip off [REFERENCE] 
      const cleanedName = rawName.replace(/^\[.*?\]\s*/, '').trim();

      return {
        id: q.id,
        product_id: q.product_id[0],
        product_name: cleanedName || rawName,
        default_code: prod.default_code || '',
        barcode: prod.barcode || '',
        category: Array.isArray(prod.categ_id) ? prod.categ_id[1] : 'General',
        quantity: onHand,
        reserved_quantity: reserved,
        available_quantity: available,
        uom: Array.isArray(prod.uom_id) ? prod.uom_id[1] : 'Units',
        standard_price: standardPrice,
        lst_price: Number(prod.lst_price || 0),
        total_value: available * standardPrice,
        location_id: q.location_id[0],
        location_name: q.location_id[1] || '',
        lot_number: q.lot_id ? q.lot_id[1] : undefined,
        package_name: q.package_id ? q.package_id[1] : undefined,
        in_date: q.in_date || undefined,
        min_stock_limit: minStock,
        status,
      };
    });

    return res.json({ success: true, items });
  } catch (error: unknown) {
    console.error('Odoo stock error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Error fetching stock from Odoo',
    });
  }
});

async function startServer() {
  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
