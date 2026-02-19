import React, { useState, useEffect } from 'react';
import { Palette, Box, Check, AlertCircle, ArrowRight, Info } from 'lucide-react';
import { VisualData, RecStyleItem, RecMetaphorItem } from '../types';

interface Step3VisualsProps {
  visualResult: string;
  onConfirmVisuals: (style: RecStyleItem, metaphor: RecMetaphorItem) => void;
  isLoading: boolean;
}

const Step3Visuals: React.FC<Step3VisualsProps> = ({ visualResult, onConfirmVisuals, isLoading }) => {
  const [data, setData] = useState<VisualData | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<RecStyleItem | null>(null);
  const [selectedMetaphor, setSelectedMetaphor] = useState<RecMetaphorItem | null>(null);

  useEffect(() => {
    try {
      let cleanJson = visualResult;
      if (cleanJson.includes('```json')) {
        cleanJson = cleanJson.replace(/```json/g, '').replace(/```/g, '');
      } else if (cleanJson.includes('```')) {
        cleanJson = cleanJson.replace(/```/g, '');
      }
      const parsed = JSON.parse(cleanJson);
      setData(parsed);
    } catch (e) {
      console.error("JSON Parse Error", e);
      setParseError("無法解析 AI 回傳的視覺建議。");
    }
  }, [visualResult]);

  if (parseError || !data) {
     return (
      <div className="flex flex-col h-full space-y-6">
        <div className="bg-red-900/20 border border-red-500/50 p-4 rounded-lg flex items-center text-red-200">
           <AlertCircle className="mr-2" size={20} />
           {parseError || "資料載入中..."}
        </div>
        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 max-h-96 overflow-y-auto whitespace-pre-wrap font-mono text-sm">
           {visualResult}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full relative">
      <div className="flex-1 overflow-y-auto custom-scrollbar pb-32 px-1">
         <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
            
            {/* Header */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white flex items-center">
                        <span className="bg-emerald-600 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">3</span>
                        形式與風格 (Flexible Skin)
                    </h2>
                </div>
                <p className="text-slate-400 text-sm">
                    決定投影片的「物理屬性」。請選擇一款視覺風格與一個結構隱喻。
                </p>
            </div>

            {/* Styles Grid */}
            <div className="space-y-4">
                <h3 className="text-lg font-bold text-blue-400 flex items-center">
                    <Palette className="mr-2" size={20}/> 推薦視覺風格 (請選 1 款)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {data.styles.map((style, idx) => (
                        <button
                            key={idx}
                            onClick={() => setSelectedStyle(style)}
                            className={`p-4 rounded-xl text-left transition-all border relative overflow-hidden group ${
                                selectedStyle?.code === style.code 
                                ? 'bg-blue-600/20 border-blue-500 shadow-lg shadow-blue-900/30' 
                                : 'bg-slate-900/50 border-slate-800 hover:bg-slate-800 hover:border-slate-600'
                            }`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className="font-bold text-white text-lg">{style.name}</span>
                                <span className="text-xs font-mono bg-slate-950 px-2 py-1 rounded text-slate-500">{style.code}</span>
                            </div>
                            <p className="text-sm text-slate-400">{style.reason}</p>
                            {selectedStyle?.code === style.code && (
                                <div className="absolute top-2 right-2 bg-blue-500 rounded-full p-1">
                                    <Check size={12} className="text-white" />
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Metaphors Grid */}
            <div className="space-y-4">
                <h3 className="text-lg font-bold text-purple-400 flex items-center">
                    <Box className="mr-2" size={20}/> 推薦結構隱喻 (請選 1 款)
                </h3>
                
                {/* Explanatory Block */}
                <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4 flex items-start text-sm text-purple-200">
                    <Info className="flex-shrink-0 mr-3 mt-0.5 text-purple-400" size={18} />
                    <div>
                        <span className="font-bold block mb-1 text-purple-300">這是用在哪裡？</span>
                        <p className="opacity-90 leading-relaxed">
                            此選項決定 <strong>P3 全課架構圖 (The Fusion Map)</strong> 的視覺呈現邏輯。
                            系統會將課文的「意義段 (骨架)」轉化為您選擇的「視覺隱喻 (皮肉)」。
                        </p>
                        <p className="text-xs opacity-60 mt-2">
                            (例如：選擇「冒險地圖」，課文的段落將變成地圖上的站點；選擇「漢堡圖」，段落將變成層層堆疊的食材。)
                        </p>
                    </div>
                </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {data.metaphors.map((meta, idx) => (
                        <button
                            key={idx}
                            onClick={() => setSelectedMetaphor(meta)}
                            className={`p-4 rounded-xl text-left transition-all border relative overflow-hidden group ${
                                selectedMetaphor?.code === meta.code 
                                ? 'bg-purple-600/20 border-purple-500 shadow-lg shadow-purple-900/30' 
                                : 'bg-slate-900/50 border-slate-800 hover:bg-slate-800 hover:border-slate-600'
                            }`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className="font-bold text-white text-lg">{meta.name}</span>
                                <span className="text-xs font-mono bg-slate-950 px-2 py-1 rounded text-slate-500">{meta.code}</span>
                            </div>
                            <div className="text-xs text-purple-300 mb-2 font-mono bg-purple-900/20 p-1.5 rounded inline-block">
                                {meta.visual}
                            </div>
                            <p className="text-sm text-slate-400">{meta.reason}</p>
                            {selectedMetaphor?.code === meta.code && (
                                <div className="absolute top-2 right-2 bg-purple-500 rounded-full p-1">
                                    <Check size={12} className="text-white" />
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            </div>
         </div>
      </div>

       {/* --- CONFIRM BUTTON (STICKY FOOTER) --- */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-slate-950/90 backdrop-blur-md border-t border-slate-800 flex justify-center z-10 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.5)]">
             <button
                onClick={() => selectedStyle && selectedMetaphor && onConfirmVisuals(selectedStyle, selectedMetaphor)}
                disabled={!selectedStyle || !selectedMetaphor || isLoading}
                className={`w-full max-w-2xl py-3 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center ${
                    !selectedStyle || !selectedMetaphor || isLoading
                    ? 'bg-slate-700 text-slate-400 cursor-not-allowed' 
                    : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-900/50'
                }`}
             >
                 {isLoading ? (
                    "正在召喚靈魂與選角..."
                 ) : (
                    <>
                        確認選擇，進入選角
                        <ArrowRight className="ml-2" size={20} />
                    </>
                 )}
             </button>
      </div>
    </div>
  );
};

export default Step3Visuals;