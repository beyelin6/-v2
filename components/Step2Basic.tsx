import React, { useState, useEffect } from 'react';
import { BookOpen, Edit2, Check, X, VenetianMask, Mic, FileType, GraduationCap, PenTool, Lightbulb, Box, ArrowRight, Quote, AlertCircle, Sparkles } from 'lucide-react';
import { AnalysisData } from '../types';

interface Step2BasicProps {
  analysis: string; // Basic JSON string
  onConfirmBasic: (confirmedData: AnalysisData) => void;
  isLoading: boolean;
}

const Step2Basic: React.FC<Step2BasicProps> = ({ analysis, onConfirmBasic, isLoading }) => {
  const [data, setData] = useState<AnalysisData | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [editingSection, setEditingSection] = useState<'basicInfo' | 'coreVocab' | 'textbookDifficultWords' | 'idioms' | null>(null);
  const [tempEditValue, setTempEditValue] = useState<any>(null);

  useEffect(() => {
    try {
      let cleanJson = analysis;
      if (cleanJson.includes('```json')) {
        cleanJson = cleanJson.replace(/```json/g, '').replace(/```/g, '');
      } else if (cleanJson.includes('```')) {
        cleanJson = cleanJson.replace(/```/g, '');
      }
      
      const parsed = JSON.parse(cleanJson);
      // Ensure structure matches AnalysisData (even if Deep fields are empty)
      if (!parsed.basicInfo) parsed.basicInfo = { genre: "未分類", grade: "未知", theme: "無", writingTechnique: "無" };
      if (!parsed.coreVocabulary) parsed.coreVocabulary = [];
      if (!parsed.textbookDifficultWords) parsed.textbookDifficultWords = [];
      if (!parsed.idioms) parsed.idioms = [];
      // Initialize empty deep fields to pass type check
      if (!parsed.vocabulary) parsed.vocabulary = [];
      if (!parsed.segments) parsed.segments = [];
      if (!parsed.strategies) parsed.strategies = [];

      setData(parsed);
      setParseError(null);
    } catch (e) {
      console.error("JSON Parse Error", e);
      setParseError("無法解析 AI 回傳的基礎資料結構。");
    }
  }, [analysis]);

  const startEdit = (section: 'basicInfo' | 'coreVocab' | 'textbookDifficultWords' | 'idioms', item: any) => {
    setEditingSection(section);
    // Deep copy
    setTempEditValue(JSON.parse(JSON.stringify(item)));
  };

  const saveEdit = () => {
    if (!data) return;
    const newData = { ...data };
    
    if (editingSection === 'basicInfo') {
        newData.basicInfo = tempEditValue;
    } else if (editingSection === 'coreVocab') {
        const words = tempEditValue.split(/[,，\s]+/).filter((w: string) => w.trim().length > 0);
        newData.coreVocabulary = words;
    } else if (editingSection === 'textbookDifficultWords') {
        const words = tempEditValue.split(/[,，\s]+/).filter((w: string) => w.trim().length > 0);
        newData.textbookDifficultWords = words;
    } else if (editingSection === 'idioms') {
        const words = tempEditValue.split(/[,，\s]+/).filter((w: string) => w.trim().length > 0);
        newData.idioms = words;
    }
    
    setData(newData);
    cancelEdit();
  };

  const cancelEdit = () => {
    setEditingSection(null);
    setTempEditValue(null);
  };

  const renderModeBadge = () => {
      if (!data) return null;
      const isDrama = data.mode?.includes('Drama') || data.mode?.includes('Mode A') || data.mode?.includes('戲劇');
      
      return (
          <div className="space-y-4 mb-6">
              {/* Mode Card */}
              <div className={`rounded-xl p-4 border ${isDrama ? 'bg-pink-900/20 border-pink-500/30' : 'bg-cyan-900/20 border-cyan-500/30'} flex items-start gap-4 shadow-lg`}>
                  <div className={`p-3 rounded-full flex-shrink-0 ${isDrama ? 'bg-pink-600 text-white shadow-pink-500/50' : 'bg-cyan-600 text-white shadow-cyan-500/50'} shadow-md`}>
                      {isDrama ? <VenetianMask size={24} /> : <Mic size={24} />}
                  </div>
                  <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h3 className={`text-lg font-bold ${isDrama ? 'text-pink-300' : 'text-cyan-300'}`}>
                            {isDrama ? 'Mode A: 戲劇模式 (Drama Mode)' : 'Mode B: 導覽模式 (Guide Mode)'}
                        </h3>
                      </div>
                      <p className="text-sm text-slate-300 mt-1 font-bold">
                        {isDrama ? '「我們陪主角走一趟旅程。」' : '「我們拆解這座知識博物館。」'}
                      </p>
                      <div className="mt-3 flex gap-3 text-xs">
                           <div className={`px-2 py-1 rounded border ${isDrama ? 'bg-pink-950 border-pink-800 text-pink-400' : 'bg-cyan-950 border-cyan-800 text-cyan-400'}`}>
                              核心概念：{isDrama ? '沈浸體驗 (Immersion)' : '知識解構 (Deconstruction)'}
                           </div>
                      </div>
                  </div>
              </div>
          </div>
      );
  };

  if (parseError || !data) {
     return (
      <div className="flex flex-col h-full space-y-6">
        <div className="bg-red-900/20 border border-red-500/50 p-4 rounded-lg flex items-center text-red-200">
           <AlertCircle className="mr-2" size={20} />
           {parseError || "資料載入中..."}
        </div>
        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 max-h-96 overflow-y-auto whitespace-pre-wrap font-mono text-sm">
           {analysis}
        </div>
      </div>
    );
  }

  const isEditingAny = editingSection !== null;

  return (
    <div className="flex flex-col h-full relative">
       <div className="flex-1 overflow-y-auto custom-scrollbar pb-32 px-1">
          <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
             {/* Header */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white flex items-center">
                        <span className="bg-emerald-600 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">2</span>
                        基礎定錨 (Basic Analysis)
                    </h2>
                </div>
                <p className="text-slate-400 text-sm">
                    Step 2 階段確認：教學模式、基本資訊與生字庫。確認無誤後，AI 將進行深度解構 (Deep Analysis)。
                </p>
            </div>

            {renderModeBadge()}

            {/* Basic Info & Visual Recommendation */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Basic Info */}
                  <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                     <div className="flex justify-between items-start mb-2">
                        <h4 className="text-sm font-bold text-slate-300 flex items-center">
                            <BookOpen size={14} className="mr-2 text-blue-400"/> 基本資訊
                        </h4>
                        {editingSection !== 'basicInfo' && (
                            <button onClick={() => startEdit('basicInfo', data.basicInfo)} disabled={isEditingAny} className="text-xs text-slate-500 hover:text-blue-400"><Edit2 size={12}/></button>
                        )}
                     </div>
                     
                     {editingSection === 'basicInfo' ? (
                        <div className="space-y-2">
                            <input className="w-full bg-slate-950 border border-slate-700 rounded p-1 text-xs text-white" value={tempEditValue.genre} onChange={(e) => setTempEditValue({...tempEditValue, genre: e.target.value})} placeholder="文體" />
                            <input className="w-full bg-slate-950 border border-slate-700 rounded p-1 text-xs text-white" value={tempEditValue.grade} onChange={(e) => setTempEditValue({...tempEditValue, grade: e.target.value})} placeholder="年級" />
                            <input className="w-full bg-slate-950 border border-slate-700 rounded p-1 text-xs text-white" value={tempEditValue.writingTechnique || ''} onChange={(e) => setTempEditValue({...tempEditValue, writingTechnique: e.target.value})} placeholder="寫作手法 (例如: 順敘法)" />
                            <textarea className="w-full bg-slate-950 border border-slate-700 rounded p-1 text-xs text-white h-16" value={tempEditValue.theme} onChange={(e) => setTempEditValue({...tempEditValue, theme: e.target.value})} placeholder="核心主題" />
                            <div className="flex justify-end gap-2">
                                <button onClick={cancelEdit} className="p-1 text-slate-400"><X size={14}/></button>
                                <button onClick={saveEdit} className="p-1 text-emerald-400"><Check size={14}/></button>
                            </div>
                        </div>
                     ) : (
                         <div className="space-y-2">
                            <div className="flex items-center gap-2 text-xs">
                                <span className="text-slate-500 bg-slate-950 px-1.5 rounded">文體</span>
                                <span className="text-white font-mono"><FileType size={12} className="inline mr-1"/>{data.basicInfo?.genre || "未分類"}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                                <span className="text-slate-500 bg-slate-950 px-1.5 rounded">年級</span>
                                <span className="text-white font-mono"><GraduationCap size={12} className="inline mr-1"/>{data.basicInfo?.grade || "未知"}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                                <span className="text-slate-500 bg-slate-950 px-1.5 rounded">寫法</span>
                                <span className="text-white font-mono"><PenTool size={12} className="inline mr-1"/>{data.basicInfo?.writingTechnique || "未知"}</span>
                            </div>
                            <div className="text-xs mt-2 border-t border-slate-800 pt-2">
                                <span className="text-slate-500 block mb-1">核心主題:</span>
                                <span className="text-emerald-300 font-bold"><Lightbulb size={12} className="inline mr-1"/>{data.basicInfo?.theme || "無"}</span>
                            </div>
                         </div>
                     )}
                  </div>

                  {/* Visual Recommendation */}
                  <div className="bg-purple-900/10 border border-purple-500/20 rounded-xl p-4 flex flex-col">
                      <h4 className="text-sm font-bold text-purple-300 flex items-center mb-2">
                            <Box size={14} className="mr-2"/> AI 視覺隱喻提案
                      </h4>
                      <div className="flex-1 flex items-center justify-center text-center p-2">
                          <p className="text-white font-bold text-lg drop-shadow-md">
                              {data.visualStructureRecommendation || "分析中..."}
                          </p>
                      </div>
                      <p className="text-[10px] text-purple-400 text-center mt-2 opacity-70">
                          (將於 Step 4 提供具體選項)
                      </p>
                  </div>
              </div>

              {/* VOCABULARY SECTION */}
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden p-4 space-y-4">
                    {/* Core Vocabulary (Characters) */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-blue-400 flex items-center">
                                <BookOpen size={12} className="mr-1"/> 核心生字 (包含認讀字，全部列出)
                            </span>
                            {editingSection !== 'coreVocab' && (
                                <button 
                                    onClick={() => startEdit('coreVocab', data.coreVocabulary.join(' '))} 
                                    disabled={isEditingAny}
                                    className="text-xs text-slate-500 hover:text-blue-400 flex items-center"
                                >
                                    <Edit2 size={10} className="mr-1"/> 編輯
                                </button>
                            )}
                        </div>
                        {editingSection === 'coreVocab' ? (
                            <div className="flex gap-2 items-start">
                                <textarea className="bg-slate-950 border border-slate-700 rounded p-2 text-slate-300 text-sm w-full h-24 font-mono" value={tempEditValue} onChange={(e) => setTempEditValue(e.target.value)} />
                                <div className="flex flex-col gap-2">
                                    <button onClick={saveEdit} className="p-1.5 bg-emerald-600 text-white rounded"><Check size={14} /></button>
                                    <button onClick={cancelEdit} className="p-1.5 bg-slate-700 text-slate-300 rounded"><X size={14} /></button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {data.coreVocabulary.length > 0 ? data.coreVocabulary.map((w, i) => <span key={i} className="px-2 py-1 bg-slate-800 rounded text-sm text-slate-300 font-mono">{w}</span>) : <span className="text-slate-600 text-xs italic">無</span>}
                            </div>
                        )}
                        <p className="text-[10px] text-slate-500 mt-2">
                           * AI 將針對這些字生成形近字與多音字辨析。
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-800 pt-4">
                        {/* Textbook Difficult Words (Terms) */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold text-amber-400 flex items-center">
                                    <Sparkles size={12} className="mr-1"/> 課本難詞 (教師講解用)
                                </span>
                                {editingSection !== 'textbookDifficultWords' && (
                                    <button 
                                        onClick={() => startEdit('textbookDifficultWords', (data.textbookDifficultWords || []).join(' '))} 
                                        disabled={isEditingAny}
                                        className="text-xs text-slate-500 hover:text-blue-400 flex items-center"
                                    >
                                        <Edit2 size={10} className="mr-1"/> 編輯
                                    </button>
                                )}
                            </div>
                            {editingSection === 'textbookDifficultWords' ? (
                                <div className="flex gap-2 items-start">
                                    <textarea className="bg-slate-950 border border-slate-700 rounded p-2 text-slate-300 text-sm w-full h-24 font-mono" value={tempEditValue} onChange={(e) => setTempEditValue(e.target.value)} />
                                    <div className="flex flex-col gap-2">
                                        <button onClick={saveEdit} className="p-1.5 bg-emerald-600 text-white rounded"><Check size={14} /></button>
                                        <button onClick={cancelEdit} className="p-1.5 bg-slate-700 text-slate-300 rounded"><X size={14} /></button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    {(data.textbookDifficultWords && data.textbookDifficultWords.length > 0) ? data.textbookDifficultWords.map((w, i) => <span key={i} className="px-2 py-1 bg-amber-900/20 text-amber-200 rounded text-sm font-mono">{w}</span>) : <span className="text-slate-600 text-xs italic">無</span>}
                                </div>
                            )}
                             <p className="text-[10px] text-slate-500 mt-2">
                               * 這些難詞將被 AI 安排進意義段落中進行解釋。
                            </p>
                        </div>

                        {/* Idioms */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold text-purple-400 flex items-center">
                                    <Quote size={12} className="mr-1"/> 延伸成語
                                </span>
                                {editingSection !== 'idioms' && (
                                    <button 
                                        onClick={() => startEdit('idioms', data.idioms.join(' '))} 
                                        disabled={isEditingAny}
                                        className="text-xs text-slate-500 hover:text-blue-400 flex items-center"
                                    >
                                        <Edit2 size={10} className="mr-1"/> 編輯
                                    </button>
                                )}
                            </div>
                            {editingSection === 'idioms' ? (
                                <div className="flex gap-2 items-start">
                                    <textarea className="bg-slate-950 border border-slate-700 rounded p-2 text-slate-300 text-sm w-full h-24 font-mono" value={tempEditValue} onChange={(e) => setTempEditValue(e.target.value)} />
                                    <div className="flex flex-col gap-2">
                                        <button onClick={saveEdit} className="p-1.5 bg-emerald-600 text-white rounded"><Check size={14} /></button>
                                        <button onClick={cancelEdit} className="p-1.5 bg-slate-700 text-slate-300 rounded"><X size={14} /></button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    {data.idioms.length > 0 ? data.idioms.map((w, i) => <span key={i} className="px-2 py-1 bg-purple-900/20 text-purple-200 rounded text-sm font-mono">{w}</span>) : <span className="text-slate-600 text-xs italic">無</span>}
                                </div>
                            )}
                             <p className="text-[10px] text-slate-500 mt-2">
                               * AI 將解釋這些成語的用法。
                            </p>
                        </div>
                    </div>
              </div>
          </div>
       </div>

       {/* Confirm Footer */}
       <div className="absolute bottom-0 left-0 right-0 p-4 bg-slate-950/90 backdrop-blur-md border-t border-slate-800 flex justify-center z-10 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.5)]">
             <button
                onClick={() => data && onConfirmBasic(data)}
                disabled={isEditingAny || isLoading}
                className={`w-full max-w-2xl py-3 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center ${
                    isEditingAny || isLoading
                    ? 'bg-slate-700 text-slate-400 cursor-not-allowed' 
                    : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/50'
                }`}
             >
                {isLoading ? (
                    "正在進行深度解構 (Deep Analysis)..."
                ) : (
                    <>
                        確認並開始深度解構
                        <ArrowRight className="ml-2" size={20} />
                    </>
                )}
             </button>
      </div>
    </div>
  );
};

export default Step2Basic;