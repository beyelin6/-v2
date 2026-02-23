import React, { useState, useRef } from 'react';
import { Upload, ChevronRight, Image as ImageIcon, FileType, X, Terminal, FileText } from 'lucide-react';
import { MediaData } from '../types';

interface Step1InputProps {
  onAnalyze: (text: string, media: MediaData[]) => void;
  isLoading: boolean;
}

const Step1Input: React.FC<Step1InputProps> = ({ onAnalyze, isLoading }) => {
  const [text, setText] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<MediaData[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
        const fileType = file.type;
        // Accept Images, PDF, Text, Markdown
        if (fileType.startsWith('image/') || fileType === 'application/pdf' || fileType === 'text/plain' || fileType === 'text/markdown' || file.name.endsWith('.md') || file.name.endsWith('.txt')) {
          
          // If it's a text file, read as text to fill the textarea (Legacy behavior preserved but modified to append)
          if (fileType === 'text/plain' || fileType === 'text/markdown' || file.name.endsWith('.md') || file.name.endsWith('.txt')) {
             const reader = new FileReader();
             reader.onload = (event) => {
               const content = event.target?.result as string;
               // Append text content with a separator if text already exists
               setText(prev => prev ? `${prev}\n\n--- [${file.name}] ---\n\n${content}` : content);
             };
             reader.readAsText(file);
          } else {
            // Handle Binary Files (PDF/Images)
            const reader = new FileReader();
            reader.onload = (event) => {
              const base64String = event.target?.result as string;
              const base64Data = base64String.split(',')[1];
              
              setSelectedFiles(prev => [...prev, {
                mimeType: file.type,
                data: base64Data,
                name: file.name
              }]);
            };
            reader.readAsDataURL(file);
          }
        } else {
          alert(`檔案 ${file.name} 格式不支援。請上傳 PDF, 圖片, TXT 或 MD 檔。`);
        }
    });

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const isReady = (text.trim().length > 0 || selectedFiles.length > 0) && !isLoading;

  return (
    <div className="flex flex-col h-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Title Section */}
      <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2 flex items-center">
              <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm shadow-md shadow-blue-200">1</span>
              內容定錨 (Ingredients)
            </h2>
            <p className="text-slate-500 text-sm ml-11 max-w-2xl">
              請輸入教學文本。Omni-Architect 將執行「多模態認知解構」，自動識別文體、提取核心生字，並轉化為視覺隱喻結構。
            </p>
          </div>
      </div>
      
      {/* Main Input Area */}
      <div className="flex-1 flex flex-col relative group">
          <div className="absolute inset-0 bg-blue-500/5 rounded-xl blur-xl group-hover:bg-blue-500/10 transition-all duration-700"></div>
          
          <div className="relative flex-1 flex flex-col bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm transition-colors hover:border-blue-300 hover:shadow-md">
            {/* Toolbar */}
            <div className="bg-slate-50 border-b border-slate-200 p-2 flex items-center gap-2">
                <div className="flex gap-1.5 ml-2 mr-4">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
                </div>
                <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1 bg-slate-200/50 px-2 py-0.5 rounded">
                    <Terminal size={10} /> source_text.md
                </span>
            </div>

            <textarea
                className="w-full flex-1 bg-transparent p-6 text-slate-700 focus:outline-none focus:bg-slate-50 transition-all resize-none font-mono text-sm leading-relaxed custom-scrollbar placeholder-slate-400"
                placeholder="在此貼上課文內容，或點擊下方按鈕上傳 (支援多檔案)..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                disabled={isLoading}
                spellCheck={false}
            />
            
            {/* File Preview Chip List */}
            {selectedFiles.length > 0 && (
                <div className="absolute bottom-4 left-4 right-4 z-10 animate-in fade-in slide-in-from-bottom-2 flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                    {selectedFiles.map((file, index) => (
                        <div key={index} className="flex items-center bg-white border border-slate-200 rounded-lg p-2 shadow-md min-w-[200px] max-w-[250px]">
                            <div className="bg-blue-50 p-2 rounded-md mr-3 border border-blue-100">
                                {file.mimeType === 'application/pdf' ? (
                                <FileType className="text-red-500" size={16} />
                                ) : (
                                <ImageIcon className="text-emerald-500" size={16} />
                                )}
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <p className="text-xs text-slate-700 font-bold truncate" title={file.name}>{file.name}</p>
                                <p className="text-[9px] text-slate-400 font-mono uppercase tracking-wider">{file.mimeType.split('/')[1] || 'FILE'}</p>
                            </div>
                            <button 
                                onClick={() => removeFile(index)}
                                className="p-1 hover:bg-red-50 rounded-md text-slate-400 hover:text-red-500 transition-colors ml-1"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
          </div>
      </div>

      <div className="flex justify-between items-center pt-2">
            <button 
                onClick={triggerFileUpload}
                disabled={isLoading}
                className="flex items-center px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 rounded-xl text-sm font-medium transition-all border border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md"
            >
                <Upload size={16} className="mr-2" />
                上傳檔案 (PDF/IMG/TXT)
            </button>

            <button
                onClick={() => onAnalyze(text, selectedFiles)}
                disabled={!isReady}
                className={`flex items-center px-8 py-3 rounded-xl font-bold transition-all transform tracking-wide ${
                !isReady
                    ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-500 text-white hover:scale-105 shadow-lg shadow-blue-200 border border-blue-500'
                }`}
            >
                {isLoading ? (
                <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    神經網路運算中...
                </span>
                ) : (
                <>
                    開始解構
                    <ChevronRight className="ml-2" size={18} />
                </>
                )}
            </button>
      </div>
      
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        multiple
        accept=".txt,.md,.pdf,image/png,image/jpeg,image/webp,image/heic" 
      />
    </div>
  );
};

export default Step1Input;