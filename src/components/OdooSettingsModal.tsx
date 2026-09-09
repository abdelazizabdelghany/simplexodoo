import React, { useState } from 'react';
import { 
  X, 
  Database, 
  Key, 
  Globe, 
  User, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  HelpCircle, 
  RefreshCw, 
  ExternalLink,
  ShieldAlert,
  Server
} from 'lucide-react';
import { OdooCredentials, OdooConnectionStatus } from '../types';

interface OdooSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  credentials: OdooCredentials;
  onSaveCredentials: (creds: OdooCredentials) => void;
  onTestConnection: (creds: OdooCredentials) => Promise<boolean>;
  onFetchOdooLocations: () => Promise<void>;
  connectionStatus: OdooConnectionStatus;
  onToggleDemoMode: () => void;
  language: 'ar' | 'en';
}

export const OdooSettingsModal: React.FC<OdooSettingsModalProps> = ({
  isOpen,
  onClose,
  credentials,
  onSaveCredentials,
  onTestConnection,
  onFetchOdooLocations,
  connectionStatus,
  onToggleDemoMode,
  language,
}) => {
  const isArabic = language === 'ar';

  const [form, setForm] = useState<OdooCredentials>({
    url: credentials.url || '',
    db: credentials.db || '',
    username: credentials.username || '',
    apiKey: credentials.apiKey || '',
  });

  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setForm({
        url: credentials.url || '',
        db: credentials.db || '',
        username: credentials.username || '',
        apiKey: credentials.apiKey || '',
      });
      setTestResult(null);
    }
  }, [isOpen, credentials.url, credentials.db, credentials.username, credentials.apiKey]);

  if (!isOpen) return null;

  const handleTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.url || !form.db || !form.username || !form.apiKey) {
      setTestResult({
        success: false,
        message: isArabic ? 'برجاء تعبئة جميع الحقول الأربعة المطلوبة.' : 'Please fill in all 4 required fields.',
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const ok = await onTestConnection(form);
      if (ok) {
        setTestResult({
          success: true,
          message: isArabic 
            ? 'تم الاتصال بنجاح مع Odoo 18 SaaS! تم التحقق من المستخدم وقاعدة البيانات.'
            : 'Successfully connected to Odoo 18 SaaS! User & database verified.',
        });
        onSaveCredentials(form);
      } else {
        setTestResult({
          success: false,
          message: connectionStatus.errorMessage || (isArabic ? 'فشل الاتصال، يرجى مراجعة البيانات.' : 'Connection failed. Check details.'),
        });
      }
    } catch (err: unknown) {
      setTestResult({
        success: false,
        message: err instanceof Error ? err.message : 'Error connecting to Odoo',
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-xl w-full p-6 sm:p-8 max-h-[92vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-purple-600/20">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-slate-900">
                  {isArabic ? 'إعدادات الاتصال بـ Odoo 18 SaaS' : 'Odoo 18 SaaS API Connection'}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                  JSON-RPC / REST
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {isArabic ? 'المتطلبات الأربعة الأساسية لربط المخزون وحساب الكميات المتاحة' : 'The 4 requirements to connect your live warehouse inventory'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Requirements Explainer Banner */}
        <div className="my-4 p-4 rounded-2xl bg-purple-50/70 border border-purple-200/80 text-xs space-y-2">
          <div className="font-bold text-purple-900 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Key className="w-4 h-4 text-purple-600" />
              {isArabic ? 'المتطلبات اللازمة من نظام Odoo 18 لديك:' : 'Required credentials from your Odoo 18 instance:'}
            </span>
            <button
              type="button"
              onClick={() => setShowHelp(!showHelp)}
              className="text-purple-700 underline font-semibold flex items-center gap-1 hover:text-purple-900"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              {showHelp ? (isArabic ? 'إخفاء الدليل' : 'Hide guide') : (isArabic ? 'كيف أستخرجها؟' : 'How to get them?')}
            </button>
          </div>

          <p className="text-purple-800 leading-relaxed">
            {isArabic
              ? 'للربط مع Odoo 18 SaaS الرسمي، نحتاج 4 معلومات أساسية فقط. يتم الاتصال عبر بروتوكول JSON-RPC الآمن بدون تخزين بياناتك الحساسة في السيرفر.'
              : 'To connect to your official Odoo 18 SaaS, we only need 4 parameters. Connected securely via JSON-RPC.'}
          </p>

          {showHelp && (
            <div className="pt-2 border-t border-purple-200 mt-2 space-y-1.5 text-slate-700">
              <div className="font-semibold text-purple-950">
                {isArabic ? 'خطوات توليد مفتاح الـ API في Odoo 18:' : 'Steps to generate API key in Odoo 18:'}
              </div>
              <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-600 ps-1">
                <li>{isArabic ? 'سجل دخول إلى Odoo 18 واضغط على اسمك/صورتك بالأعلى جهة اليمين.' : 'Login to Odoo and click on your profile avatar in the top right.'}</li>
                <li>{isArabic ? 'اختر "Preferences" (التفضيلات) أو "My Profile".' : 'Select "Preferences" or "My Profile".'}</li>
                <li>{isArabic ? 'انتقل إلى تبويب "Account Security" (أمان الحساب).' : 'Go to "Account Security" tab.'}</li>
                <li>{isArabic ? 'اضغط على "Developer API Keys" ثم "New API Key".' : 'Click "Developer API Keys" then "New API Key".'}</li>
                <li>{isArabic ? 'انسخ المفتاح الطويل وضعه في خانة API Key هنا بالأسفل.' : 'Copy the generated key and paste it in the API Key field below.'}</li>
              </ol>
            </div>
          )}
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleTest} className="space-y-3.5 text-xs">
          
          {/* 1. Odoo Server URL */}
          <div>
            <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              <span>{isArabic ? '1. رابط نظام أودو (Odoo URL)' : '1. Odoo Server URL'}</span>
              <span className="text-rose-500">*</span>
            </label>
            <input
              type="url"
              placeholder="https://your-company.odoo.com"
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
              className="w-full text-xs font-mono bg-slate-50 border border-slate-300 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl py-2.5 px-3"
              required
            />
            <span className="text-[10px] text-slate-400 mt-0.5 block">
              {isArabic ? 'مثال: https://mycompany.odoo.com' : 'e.g. https://mycompany.odoo.com'}
            </span>
          </div>

          {/* 2. Database Name */}
          <div>
            <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-slate-400" />
              <span>{isArabic ? '2. اسم قاعدة البيانات (Database Name)' : '2. Database Name'}</span>
              <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="mycompany-db"
              value={form.db}
              onChange={(e) => setForm({ ...form, db: e.target.value })}
              className="w-full text-xs font-mono bg-slate-50 border border-slate-300 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl py-2.5 px-3"
              required
            />
            <span className="text-[10px] text-slate-400 mt-0.5 block">
              {isArabic ? 'في أودو ساس غالباً يكون نفس الجزء الأول من الرابط (subdomain)' : 'In Odoo SaaS, it is usually your subdomain name'}
            </span>
          </div>

          {/* 3. User Login / Email */}
          <div>
            <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>{isArabic ? '3. البريد الإلكتروني للمستخدم (User Email / Login)' : '3. User Email / Login'}</span>
              <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              placeholder="admin@your-company.com"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              className="w-full text-xs font-mono bg-slate-50 border border-slate-300 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl py-2.5 px-3"
              required
            />
          </div>

          {/* 4. API Key */}
          <div>
            <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-slate-400" />
              <span>{isArabic ? '4. مفتاح الـ API (Developer API Key)' : '4. Developer API Key'}</span>
              <span className="text-rose-500">*</span>
            </label>
            <input
              type="password"
              placeholder="••••••••••••••••••••••••"
              value={form.apiKey}
              onChange={(e) => setForm({ ...form, apiKey: e.target.value })}
              className="w-full text-xs font-mono bg-slate-50 border border-slate-300 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl py-2.5 px-3"
              required
            />
            <span className="text-[10px] text-slate-400 mt-0.5 block">
              {isArabic ? 'المفتاح المولد من Account Security في حسابك' : 'Generated key from Account Security in Odoo'}
            </span>
          </div>

          {/* Test Status Banner */}
          {testResult && (
            <div className={`p-3.5 rounded-xl border text-xs flex items-start gap-2 ${
              testResult.success 
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800' 
                : 'bg-rose-50 border-rose-300 text-rose-800'
            }`}>
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div>{testResult.message}</div>
            </div>
          )}

          {/* Buttons */}
          <div className="pt-3 flex items-center justify-between gap-3 flex-wrap">
            <button
              type="button"
              onClick={() => {
                onToggleDemoMode();
                onClose();
              }}
              className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              {isArabic ? 'استخدام وضع المعاينة (Demo Mode)' : 'Use Demo Mode'}
            </button>

            <div className="flex items-center gap-2 ms-auto">
              <button
                type="submit"
                disabled={isTesting}
                className="px-4 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-xl transition-all shadow-md shadow-purple-600/20 flex items-center gap-1.5"
              >
                {isTesting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>{isArabic ? 'جارِ التحقق...' : 'Connecting...'}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isArabic ? 'اختبار وحفظ الاتصال' : 'Test & Save Connection'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
};
