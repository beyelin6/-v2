import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Layers, FileText, CheckSquare, Database, Download, RefreshCw, Sparkles } from 'lucide-react';

interface Step5OutputProps {
  outputScript: string;
  outputWorksheet: string;
  outputAssessment: string;
  outputKb: string;
  onGenerateModule: (type: 'worksheet' | 'assessment' | 'kb') => void;
  isLoading: boolean;
}

const Step5Output: React.FC<Step5OutputProps> = ({ 
    outputScript, 
    outputWorksheet, 
    outputAssessment, 
    outputKb, 
    onGenerateModule,
    isLoading
}) => {
  const [activeTab, setActiveTab] = useState<'script' | 'worksheet' | 'assessment' | 'kb'>('script');

  const renderContent = () => {
      let content = "";
      let isEmpty = false;
      let generateType: 'worksheet' | 'assessment' | 'kb' | null = null;
      let emptyMessage = "";

      switch (activeTab) {
          case 'script':
              content = outputScript;
              break;
          case 'worksheet':
              content = outputWorksheet;
              isEmpty = !content;
              generateType = 'worksheet';
              emptyMessage = "尚未生成素養學習單 (Instruction 3)";
              break;
          case 'assessment':
              content = outputAssessment;
              isEmpty = !content;
              generateType = 'assessment';
              emptyMessage = "尚未生成學生複習講義 (Instruction 4)";
              break;
          case 'kb':
              content = outputKb;
              isEmpty = !content;
              generateType = 'kb';
              emptyMessage = "尚未生成 NotebookLM 知識庫 (Instruction 5)";
              break;
      }

      if (isEmpty && generateType) {
          return (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center animate-in fade-in">
                  <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 mb-6 max-w-md">
                      <Sparkles className="mx-auto text-emerald-400 mb-4" size={32} />
                      <h3 className="text-lg font-bold text-white mb-2">{emptyMessage}</h3>
                      <p className="text-slate-400 text-sm">
                          點擊下方按鈕，AI 將根據核心腳本延伸生成此模組。
                      </p>
                  </div>
                  <button
                      onClick={() => generateType && onGenerateModule(generateType)}
                      disabled={isLoading}
                      className={`flex items-center px-6 py-3 rounded-xl font-bold transition-all transform ${
                          isLoading
                          ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-500 text-white hover:scale-105 shadow-lg shadow-blue-900/50'
                      }`}
                  >
                      {isLoading ? (
                          <>
                              <RefreshCw size={18} className="animate-spin mr-2" />
                              正在生成模組...
                          </>
                      ) : (
                          <>
                              <Sparkles size={18} className="mr-2" />
                              立即生成
                          </>
                      )}
                  </button>
              </div>
          );
      }

      return (
           <div className="prose prose-invert prose-emerald max-w-none">
             <div className="p-4 bg-slate-900 rounded border border-slate-800 mb-4 text-xs font-mono text-slate-500 flex justify-between items-center">
                <span>[系統訊息]: 以下為 {activeTab} 完整產出內容。</span>
                <span className="text-[10px] bg-slate-800 px-2 py-1 rounded">Markdown Mode</span>
             </div>
             <ReactMarkdown 
              components={{
                code(props) {
                  const {children, className, node, ...rest} = props
                  return (
                    <code className="bg-slate-800 text-orange-300 px-1 py-0.5 rounded text-sm font-mono border border-slate-700" {...rest}>
                      {children}
                    </code>
                  )
                },
                pre(props) {
                   return <pre className="bg-slate-900 p-4 rounded-lg overflow-x-auto border border-slate-800 my-4" {...props} />
                }
              }}
             >
              {content}
             </ReactMarkdown>
           </div>
      );
  };

  return (
    <div className="flex flex-col h-full space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white flex items-center">
          <span className="bg-emerald-600 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">5</span>
          六大模組產出 (Big 6 Production)
        </h2>
        <button className="flex items-center text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded transition-colors border border-slate-700">
          <Download size={14} className="mr-2" />
          匯出全部
        </button>
      </div>

      <div className="bg-slate-800/50 rounded-xl border border-slate-700 flex-1 flex flex-col overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-slate-700 bg-slate-900/50 overflow-x-auto">
          <button
            onClick={() => setActiveTab('script')}
            className={`flex items-center px-4 md:px-6 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === 'script' ? 'text-emerald-400 border-b-2 border-emerald-400 bg-emerald-900/10' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Layers size={16} className="mr-2" />
            原子腳本 (Core)
          </button>
          <button
             onClick={() => setActiveTab('worksheet')}
             className={`flex items-center px-4 md:px-6 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === 'worksheet' ? 'text-emerald-400 border-b-2 border-emerald-400 bg-emerald-900/10' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <FileText size={16} className="mr-2" />
            素養學習單
          </button>
           <button
             onClick={() => setActiveTab('assessment')}
             className={`flex items-center px-4 md:px-6 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === 'assessment' ? 'text-emerald-400 border-b-2 border-emerald-400 bg-emerald-900/10' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <CheckSquare size={16} className="mr-2" />
            複習講義
          </button>
           <button
             onClick={() => setActiveTab('kb')}
             className={`flex items-center px-4 md:px-6 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === 'kb' ? 'text-emerald-400 border-b-2 border-emerald-400 bg-emerald-900/10' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Database size={16} className="mr-2" />
            知識庫
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-slate-950">
           {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Step5Output;