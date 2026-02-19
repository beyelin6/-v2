import React, { useState } from 'react';
import { Key, ExternalLink, HelpCircle, X } from 'lucide-react';

interface ApiKeyModalProps {
  onConfirm: (key: string) => void;
  onClose?: () => void;
  hasExistingKey?: boolean;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ onConfirm, onClose, hasExistingKey }) => {
  const [inputKey, setInputKey] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputKey.trim()) {
      onConfirm(inputKey.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm animate-in fade-in zoom-in duration-300 relative">
        {hasExistingKey && onClose && (
            <button 
                onClick={onClose}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
            >
                <X size={20} />
            </button>
        )}

        <div className="flex items-center justify-between mb-2">
          <h3 className="text-slate-800 font-bold text-lg">
             Gemini API Key 設定
          </h3>
          <div className="flex gap-2 text-slate-400">
            {!onClose && <Key size={20} />}
            <HelpCircle size={20} className="cursor-help" title="請輸入 Google AI Studio 提供的 API Key" />
          </div>
        </div>
        
        <p className="text-slate-500 text-sm mb-4 leading-relaxed">
          若尚未擁有 API Key，請前往 <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-600 font-bold hover:underline inline-flex items-center">Google AI Studio <ExternalLink size={12} className="ml-0.5"/></a> 建立並複製。
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <div className="relative">
                <input
                  type="password"
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  placeholder="貼上您的 API Key..."
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block p-3 outline-none transition-all placeholder-slate-400"
                  autoFocus
                />
            </div>
            
            <div className="flex justify-end mt-1">
                 <a 
                  href="https://aistudio.google.com/app/apikey" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-blue-600 text-xs flex items-center transition-colors"
                >
                  <ExternalLink size={10} className="mr-1" />
                  快速前往取得 Key
                </a>
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button
              type="submit"
              disabled={!inputKey.trim()}
              className="text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-blue-200 w-full"
            >
              確認使用
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApiKeyModal;