import React, { useState, useEffect } from 'react';
import { Key, Eye, EyeOff, ExternalLink, AlertCircle, Check } from 'lucide-react';

interface ApiKeyModalProps {
  onConfirm: (key: string) => void;
  onClose?: () => void;
  hasExistingKey?: boolean;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ onConfirm, onClose, hasExistingKey }) => {
  const [keyInput, setKeyInput] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);

  // 進入此畫面時自動聚焦 (如果原本沒有 Key)
  useEffect(() => {
    if (!hasExistingKey) {
      const inputEl = document.getElementById('api-key-input');
      if (inputEl) inputEl.focus();
    }
  }, [hasExistingKey]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedKey = keyInput.trim();
    
    // 防呆驗證 1：空白檢查
    if (!trimmedKey) {
      setError('請輸入 API Key');
      return;
    }
    
    // 防呆驗證 2：Gemini 金鑰格式檢查 (通常以 AIza 開頭)
    if (!trimmedKey.startsWith('AIza') || trimmedKey.length < 30) {
      setError('這看起來不像有效的 Gemini API Key (應以 AIza 開頭)');
      return;
    }

    setError(null);
    onConfirm(trimmedKey);
  };

  return (
    // [重構] 乾淨的深灰色遮罩，不使用毛玻璃，凸顯中央純白卡片
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-800/40 p-4 animate-in fade-in duration-200">
      
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header 區塊 */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
          <div className="p-2 bg-teal-50 text-teal-600 rounded-lg">
            <Key size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">設定系統引擎 (API Key)</h2>
            <p className="text-xs text-slate-500 mt-0.5">V-MAX 架構需要 Gemini 權限來執行分析</p>
          </div>
        </div>

        {/* 內容表單區塊 */}
        <form onSubmit={handleSubmit} className="p-6">
          
          <div className="mb-4">
            <label htmlFor="api-key-input" className="block text-sm font-medium text-slate-700 mb-1.5">
              Google Gemini API Key
            </label>
            
            {/* 輸入框群組 */}
            <div className={`relative flex items-center border rounded-xl transition-all duration-200 bg-slate-50 ${
              error ? 'border-red-300 ring-4 ring-red-50' : 
              isFocused ? 'border-teal-400 ring-4 ring-teal-50 bg-white' : 'border-slate-200 hover:border-slate-300'
            }`}>
              
              <input
                id="api-key-input"
                type={showKey ? 'text' : 'password'}
                value={keyInput}
                onChange={(e) => {
                  setKeyInput(e.target.value);
                  if (error) setError(null); // 輸入時自動清除錯誤
                }}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className="w-full py-2.5 pl-4 pr-12 bg-transparent text-slate-800 focus:outline-none font-mono text-sm placeholder:text-slate-400 placeholder:font-sans"
                placeholder={hasExistingKey ? "•••••••••••••••••••••••• (已設定)" : "輸入 AIza 開頭的金鑰..."}
                autoComplete="off"
              />
              
              {/* 顯示/隱藏密碼按鈕 */}
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
                tabIndex={-1}
              >
                {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* 錯誤訊息提示 */}
            {error && (
              <div className="flex items-center gap-1.5 mt-2 text-red-600 text-xs font-medium animate-in slide-in-from-top-1">
                <AlertCircle size={14} />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* 取得金鑰的教學指引 */}
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 mb-6 flex items-start gap-2.5">
            <div className="mt-0.5 text-slate-400">
              <ExternalLink size={14} />
            </div>
            <div className="text-xs text-slate-600 leading-relaxed">
              還沒有金鑰嗎？請前往{' '}
              <a 
                href="https://aistudio.google.com/app/apikey" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-teal-600 font-medium hover:text-teal-700 underline underline-offset-2"
              >
                Google AI Studio
              </a>
              {' '}免費建立一組。您的金鑰僅會儲存在本地瀏覽器，不會回傳至任何第三方伺服器。
            </div>
          </div>

          {/* 底部按鈕區 */}
          <div className="flex justify-end gap-3 pt-2">
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              >
                取消
              </button>
            )}
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-sm font-medium rounded-lg transition-colors shadow-sm focus:ring-4 focus:ring-slate-200"
            >
              <Check size={16} />
              <span>儲存並啟動系統</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default ApiKeyModal;
