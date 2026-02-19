import React, { useState, useRef } from 'react';
import { Upload, FileText, ChevronRight, Image as ImageIcon, FileType, X } from 'lucide-react';
import { MediaData } from '../types';

interface Step1InputProps {
  onAnalyze: (text: string, media: MediaData | null) => void;
  isLoading: boolean;
}

const Step1Input: React.FC<Step1InputProps> = ({ onAnalyze, isLoading }) => {
  const [text, setText] = useState("");
  const [selectedFile, setSelectedFile] = useState<MediaData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileType = file.type;
    // Accept Images and PDF
    if (fileType.startsWith('image/') || fileType === 'application/pdf' || fileType === 'text/plain' || fileType === 'text/markdown') {
      
      // If it's a text file, read as text to fill the textarea (Legacy behavior)
      if (fileType === 'text/plain' || fileType === 'text/markdown' || file.name.endsWith('.md') || file.name.endsWith('.txt')) {
         const reader = new FileReader();
         reader.onload = (event) => {
           const content = event.target?.result as string;
           setText(content);
           // Clear file selection for text files as we just dumped content into textarea
           setSelectedFile(null); 
         };
         reader.readAsText(file);
      } else {
        // Handle Binary Files (PDF/Images)
        const reader = new FileReader();
        reader.onload = (event) => {
          const base64String = event.target?.result as string;
          // Remove the data URL prefix (e.g., "data:image/png;base64,")
          const base64Data = base64String.split(',')[1];
          
          setSelectedFile({
            mimeType: file.type,
            data: base64Data,
            name: file.name
          });
        };
        reader.readAsDataURL(file);
      }
    } else {
      alert("不支援的檔案格式。請上傳 PDF, 圖片, TXT 或 MD 檔。");
    }
    
    // Reset input so the same file can be selected again if needed
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const clearFile = () => {
    setSelectedFile(null);
  };

  const isReady = (text.trim().length > 0 || selectedFile !== null) && !isLoading;

  return (
    <div className="flex flex-col h-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 flex flex-col flex-1">
        <h2 className="text-xl font-bold text-white mb-2 flex items-center">
          <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">1</span>
          內容定錨 (Ingredients)
        </h2>
        <p className="text-slate-400 text-sm mb-4">
          上傳課文（支援 PDF/圖片/文字檔）或直接貼上內容，系統將進行「認知解構」。
        </p>
        
        <div className="relative flex-1 flex flex-col space-y-3">
          {/* Text Area */}
          <textarea
            className="w-full flex-1 bg-slate-900 border border-slate-700 rounded-lg p-4 text-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none font-mono text-sm leading-relaxed"
            placeholder="在此貼上課文內容..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={isLoading}
          />
          
          {/* File Preview Chip */}
          {selectedFile && (
            <div className="flex items-center bg-slate-700/50 border border-slate-600 rounded-lg p-3 animate-in fade-in slide-in-from-bottom-2">
              <div className="bg-blue-900/50 p-2 rounded mr-3">
                {selectedFile.mimeType === 'application/pdf' ? (
                  <FileType className="text-red-400" size={20} />
                ) : (
                  <ImageIcon className="text-emerald-400" size={20} />
                )}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm text-slate-200 font-medium truncate">{selectedFile.name}</p>
                <p className="text-xs text-slate-400 font-mono uppercase">{selectedFile.mimeType.split('/')[1]}</p>
              </div>
              <button 
                onClick={clearFile}
                className="p-1 hover:bg-slate-600 rounded-full text-slate-400 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          )}

          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept=".txt,.md,.pdf,image/png,image/jpeg,image/webp,image/heic" 
          />
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-slate-700/50 mt-auto">
            <button 
                onClick={triggerFileUpload}
                disabled={isLoading}
                className="flex items-center px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-sm font-medium transition-colors border border-slate-600"
            >
                <Upload size={16} className="mr-2" />
                上傳 (PDF/圖/文)
            </button>

            <button
                onClick={() => onAnalyze(text, selectedFile)}
                disabled={!isReady}
                className={`flex items-center px-6 py-3 rounded-lg font-bold transition-all transform ${
                !isReady
                    ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-500 text-white hover:scale-105 shadow-lg shadow-blue-900/50'
                }`}
            >
                {isLoading ? (
                <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    分析中...
                </span>
                ) : (
                <>
                    開始解構
                    <ChevronRight className="ml-2" size={20} />
                </>
                )}
            </button>
        </div>
      </div>
    </div>
  );
};

export default Step1Input;