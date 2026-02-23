import React, { useState, useEffect } from 'react';
import { Edit2, Trash2, Check, X, Plus, RefreshCw, AlertCircle, Wand2, ArrowRight, ArrowLeft } from 'lucide-react';
import { AnalysisData, VocabularyItem, ShapeSimilarItem, PolyphonicItem } from '../types';

interface Step2DeepProps {
  basicData: AnalysisData; // Context from Step 2 Basic
  deepAnalysisResult: string; // The raw JSON string from Step 2.5
  onConfirmDeepVocab: (refinedAnalysis: string) => void;
  isLoading: boolean;
  onGenerateMnemonic: (chars: ShapeSimilarItem[]) => Promise<string>;
  onGeneratePolyphonic: (char: string) => Promise<PolyphonicItem[]>;
  onGenerateShapeSimilar: (char: string) => Promise<ShapeSimilarItem[]>;
  onGenerateShapeSimilarDetails: (char: string) => Promise<ShapeSimilarItem | null>;
  onBack: () => void;
}

const Step2Deep: React.FC<Step2DeepProps> = ({ 
    basicData, 
    deepAnalysisResult, 
    onConfirmDeepVocab, 
    isLoading, 
    onGenerateMnemonic,
    onGeneratePolyphonic,
    onGenerateShapeSimilar,
    onGenerateShapeSimilarDetails,
    onBack
}) => {
  const [data, setData] = useState<AnalysisData | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  
  // Loading states
  const [isGeneratingMnemonic, setIsGeneratingMnemonic] = useState(false);
  const [isGeneratingPolyphonic, setIsGeneratingPolyphonic] = useState(false);
  const [isGeneratingShapeSimilar, setIsGeneratingShapeSimilar] = useState(false);
  const [isGeneratingShapeSimilarDetails, setIsGeneratingShapeSimilarDetails] = useState<number | null>(null);
  
  // Edit states
  const [editingIndex, setEditingIndex] = useState<number>(-1);
  const [tempEditValue, setTempEditValue] = useState<any>(null);

  useEffect(() => {
    try {
      let cleanJson = deepAnalysisResult;
      if (cleanJson.includes('```json')) {
        cleanJson = cleanJson.replace(/```json/g, '').replace(/```/g, '');
      } else if (cleanJson.includes('```')) {
        cleanJson = cleanJson.replace(/```/g, '');
      }
      
      const parsed = JSON.parse(cleanJson);
      
      // Merge Deep Data with Basic Data to form full AnalysisData
      // Note: At this stage (2.5), we only expect "vocabulary" to be populated by AI
      const mergedData: AnalysisData = {
          ...basicData, // Mode, BasicInfo, CoreVocab, Idioms
          vocabulary: parsed.vocabulary || [],
          segments: [], // Not yet generated
          strategies: [], // Not yet generated
      };

      setData(mergedData);
      setParseError(null);
    } catch (e) {
      console.error("JSON Parse Error", e);
      setParseError("無法解析語文輻射資料。");
    }
  }, [deepAnalysisResult, basicData]);

  const handleConfirm = () => {
    // Only pass the Vocabulary part as a JSON string to the next step's prompt context
    const refinedAnalysisString = JSON.stringify(data, null, 2);
    onConfirmDeepVocab(refinedAnalysisString);
  };
  
  const handleGenMnemonic = async () => {
      if (!onGenerateMnemonic || !tempEditValue.shapeSimilar || tempEditValue.shapeSimilar.length < 1) {
          alert("請至少輸入形近字資料（含部首與造詞）才能生成口訣。");
          return;
      }
      setIsGeneratingMnemonic(true);
      try {
          const mnemonic = await onGenerateMnemonic(tempEditValue.shapeSimilar);
          setTempEditValue({...tempEditValue, mnemonic });
      } catch (e) {
          alert("生成失敗，請稍後再試。");
      } finally {
          setIsGeneratingMnemonic(false);
      }
  };

  const handleGenPolyphonic = async () => {
      if (!onGeneratePolyphonic || !tempEditValue.word) {
          alert("請先輸入要查詢的國字。");
          return;
      }
      setIsGeneratingPolyphonic(true);
      try {
          // Extract just the character if user entered a word
          const char = tempEditValue.word.charAt(0);
          const result = await onGeneratePolyphonic(char);
          if (result && result.length > 0) {
              setTempEditValue({ ...tempEditValue, polyphonic: result });
          } else {
              alert("AI 未能找到此字的多音資料。");
          }
      } catch (e) {
          alert("自動生成失敗，請稍後再試。");
      } finally {
          setIsGeneratingPolyphonic(false);
      }
  };

  const handleGenShapeSimilar = async () => {
      if (!onGenerateShapeSimilar || !tempEditValue.word) {
          alert("請先輸入要查詢的國字。");
          return;
      }
      setIsGeneratingShapeSimilar(true);
      try {
          const char = tempEditValue.word.charAt(0);
          const result = await onGenerateShapeSimilar(char);
          if (result && result.length > 0) {
              // Append new results to existing ones or replace if empty
              const currentSimilar = tempEditValue.shapeSimilar || [];
              setTempEditValue({ ...tempEditValue, shapeSimilar: [...currentSimilar, ...result] });
          } else {
              alert("AI 未能找到此字的形近字資料。");
          }
      } catch (e) {
          alert("自動生成失敗，請稍後再試。");
      } finally {
          setIsGeneratingShapeSimilar(false);
      }
  };

  const handleGenShapeSimilarDetails = async (index: number, char: string) => {
    if (!char) {
        alert("請先輸入國字。");
        return;
    }
    setIsGeneratingShapeSimilarDetails(index);
    try {
        const result = await onGenerateShapeSimilarDetails(char);
        if (result) {
            const newArr = [...(tempEditValue.shapeSimilar || [])];
            newArr[index] = { ...newArr[index], ...result };
            setTempEditValue({ ...tempEditValue, shapeSimilar: newArr });
        } else {
            alert("AI 無法生成此字的詳細資料。");
        }
    } catch (e) {
        alert("生成失敗，請稍後再試。");
    } finally {
        setIsGeneratingShapeSimilarDetails(null);
    }
  };

  // --- CRUD Operations ---
  const deleteItem = (index: number) => {
    if (!data) return;
    const newData = { ...data };
    newData.vocabulary.splice(index, 1);
    setData(newData);
  };

  const startEdit = (index: number, item: any) => {
    setEditingIndex(index);
    const copy = JSON.parse(JSON.stringify(item));
    setTempEditValue(copy);
  };

  const addNewVocabItem = () => {
      if (!data) return;
      const newItem: VocabularyItem = { 
        word: '新字', type: '形近字', zhuyin: '',
        shapeSimilar: [{ char: '新', radical: '部首', words: '造詞', explanation: '解釋' }],
        mnemonic: '口訣'
      };
      const newData = { ...data };
      newData.vocabulary.push(newItem);
      setData(newData);
      startEdit(newData.vocabulary.length - 1, newItem);
  };

  const saveEdit = () => {
    if (!data) return;
    const newData = { ...data };
    newData.vocabulary[editingIndex] = tempEditValue;
    setData(newData);
    cancelEdit();
  };

  const cancelEdit = () => {
    setEditingIndex(-1);
    setTempEditValue(null);
  };

  // --- Editor Renderers ---
  const renderVocabEditor = () => {
      if (!tempEditValue) return null;
      return (
        <div className="space-y-3 bg-slate-900/50 p-2 rounded">
             <div className="flex gap-2">
                <input className="bg-slate-950 border border-slate-700 rounded p-1 text-white text-sm w-1/4" value={tempEditValue.word} onChange={(e) => setTempEditValue({...tempEditValue, word: e.target.value})} placeholder="字" />
                <input className="bg-slate-950 border border-slate-700 rounded p-1 text-white text-sm w-1/4" value={tempEditValue.zhuyin || ''} onChange={(e) => setTempEditValue({...tempEditValue, zhuyin: e.target.value})} placeholder="注音" />
                <select className="bg-slate-950 border border-slate-700 rounded p-1 text-white text-sm flex-1" value={tempEditValue.type} onChange={(e) => setTempEditValue({...tempEditValue, type: e.target.value})}>
                    <option value="形近字">形近字</option><option value="多音字">多音字</option><option value="成語">成語</option>
                </select>
            </div>
            {tempEditValue.type === '形近字' && (
                <div className="space-y-2">
                     <div className="flex justify-between items-center">
                         <label className="text-xs text-slate-500 uppercase">形近字辨析</label>
                         <button 
                             onClick={handleGenShapeSimilar} 
                             disabled={isGeneratingShapeSimilar || !tempEditValue.word} 
                             className={`text-[10px] flex items-center px-2 py-1 rounded border transition-colors ${
                                 isGeneratingShapeSimilar || !tempEditValue.word
                                 ? 'bg-slate-800 text-slate-600 border-slate-800 cursor-not-allowed'
                                 : 'bg-emerald-900/30 text-emerald-400 border-emerald-900 hover:bg-emerald-900/50'
                             }`}
                         >
                             {isGeneratingShapeSimilar ? <RefreshCw size={10} className="animate-spin mr-1"/> : <Wand2 size={10} className="mr-1"/>} 
                             AI 自動生成形近字
                         </button>
                     </div>
                    {(tempEditValue.shapeSimilar || []).map((item: any, i: number) => (
                        <div key={i} className="flex gap-1 items-center">
                            <div className="relative">
                                <input 
                                    className="w-12 bg-slate-950 border border-slate-700 rounded p-1 text-xs text-white pr-4" 
                                    value={item.char} 
                                    onChange={(e) => { const newArr = [...tempEditValue.shapeSimilar]; newArr[i].char = e.target.value; setTempEditValue({...tempEditValue, shapeSimilar: newArr}); }} 
                                    placeholder="字" 
                                />
                                <button 
                                    onClick={() => handleGenShapeSimilarDetails(i, item.char)}
                                    disabled={isGeneratingShapeSimilarDetails === i || !item.char}
                                    className="absolute -right-5 top-1.5 text-emerald-400 hover:text-emerald-300 disabled:opacity-30 transition-colors z-10"
                                    title="AI 自動生成部首與造詞"
                                >
                                    {isGeneratingShapeSimilarDetails === i ? <RefreshCw size={12} className="animate-spin" /> : <Wand2 size={12} />}
                                </button>
                            </div>
                             <input className="w-16 ml-6 bg-slate-950 border border-slate-700 rounded p-1 text-xs text-white" value={item.radical} onChange={(e) => { const newArr = [...tempEditValue.shapeSimilar]; newArr[i].radical = e.target.value; setTempEditValue({...tempEditValue, shapeSimilar: newArr}); }} placeholder="部首" />
                             <input className="flex-1 bg-slate-950 border border-slate-700 rounded p-1 text-xs text-white" value={item.words} onChange={(e) => { const newArr = [...tempEditValue.shapeSimilar]; newArr[i].words = e.target.value; setTempEditValue({...tempEditValue, shapeSimilar: newArr}); }} placeholder="造詞" />
                             <input className="flex-1 bg-slate-950 border border-slate-700 rounded p-1 text-xs text-slate-400" value={item.explanation} onChange={(e) => { const newArr = [...tempEditValue.shapeSimilar]; newArr[i].explanation = e.target.value; setTempEditValue({...tempEditValue, shapeSimilar: newArr}); }} placeholder="解釋部首差異" />
                             <button onClick={() => { const newArr = [...tempEditValue.shapeSimilar]; newArr.splice(i, 1); setTempEditValue({...tempEditValue, shapeSimilar: newArr}); }} className="text-slate-600 hover:text-red-400 p-1"><Trash2 size={12} /></button>
                        </div>
                    ))}
                    <button onClick={() => { const newArr = [...(tempEditValue.shapeSimilar || []), { char: '', radical: '', words: '', explanation: '' }]; setTempEditValue({...tempEditValue, shapeSimilar: newArr}); }} className="text-xs text-blue-400 flex items-center"><Plus size={10} className="mr-1"/>新增辨析</button>
                    <div className="flex items-center justify-between mt-2">
                        <label className="text-xs text-slate-500 uppercase">辨析筆記 (Mnemonic)</label>
                        <button onClick={handleGenMnemonic} disabled={isGeneratingMnemonic} className="text-[10px] flex items-center px-2 py-1 rounded border bg-emerald-900/30 text-emerald-400 border-emerald-900 hover:bg-emerald-900/50">
                            {isGeneratingMnemonic ? <RefreshCw size={10} className="animate-spin mr-1"/> : <Wand2 size={10} className="mr-1"/>} AI 生成
                        </button>
                    </div>
                    <textarea className="w-full bg-slate-950 border border-slate-700 rounded p-1 text-xs text-emerald-300 h-12" value={tempEditValue.mnemonic || ''} onChange={(e) => setTempEditValue({...tempEditValue, mnemonic: e.target.value})} placeholder="AI 生成口訣..." />
                </div>
            )}
             {tempEditValue.type === '多音字' && (
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <label className="text-xs text-slate-500 uppercase">讀音辨析</label>
                        <button 
                            onClick={handleGenPolyphonic} 
                            disabled={isGeneratingPolyphonic || !tempEditValue.word} 
                            className={`text-[10px] flex items-center px-2 py-1 rounded border transition-colors ${
                                isGeneratingPolyphonic || !tempEditValue.word
                                ? 'bg-slate-800 text-slate-600 border-slate-800 cursor-not-allowed'
                                : 'bg-indigo-900/30 text-indigo-400 border-indigo-900 hover:bg-indigo-900/50'
                            }`}
                        >
                            {isGeneratingPolyphonic ? <RefreshCw size={10} className="animate-spin mr-1"/> : <Wand2 size={10} className="mr-1"/>} 
                            AI 自動生成讀音
                        </button>
                    </div>
                    {(tempEditValue.polyphonic || []).map((item: any, i: number) => (
                         <div key={i} className="flex gap-1">
                            <input className="w-20 bg-slate-950 border border-slate-700 rounded p-1 text-xs text-white" value={item.zhuyin} onChange={(e) => { const newArr = [...tempEditValue.polyphonic]; newArr[i].zhuyin = e.target.value; setTempEditValue({...tempEditValue, polyphonic: newArr}); }} placeholder="注音" />
                             <input className="w-24 bg-slate-950 border border-slate-700 rounded p-1 text-xs text-white" value={item.words} onChange={(e) => { const newArr = [...tempEditValue.polyphonic]; newArr[i].words = e.target.value; setTempEditValue({...tempEditValue, polyphonic: newArr}); }} placeholder="詞語" />
                             <input className="flex-1 bg-slate-950 border border-slate-700 rounded p-1 text-xs text-slate-400" value={item.usage} onChange={(e) => { const newArr = [...tempEditValue.polyphonic]; newArr[i].usage = e.target.value; setTempEditValue({...tempEditValue, polyphonic: newArr}); }} placeholder="語境/用法" />
                        </div>
                    ))}
                    <button onClick={() => { const newArr = [...(tempEditValue.polyphonic || []), { zhuyin: '', words: '', usage: '' }]; setTempEditValue({...tempEditValue, polyphonic: newArr}); }} className="text-xs text-blue-400 flex items-center"><Plus size={10} className="mr-1"/>新增讀音</button>
                </div>
            )}
            {tempEditValue.type === '成語' && (
                 <div className="space-y-2">
                    <label className="text-xs text-slate-500 uppercase">成語詳解</label>
                    <div className="grid grid-cols-1 gap-2">
                        <input className="bg-slate-950 border border-slate-700 rounded p-1 text-xs text-white" value={tempEditValue.idiom?.definition || ''} onChange={(e) => setTempEditValue({...tempEditValue, idiom: {...tempEditValue.idiom, definition: e.target.value}})} placeholder="釋義" />
                         <input className="bg-slate-950 border border-slate-700 rounded p-1 text-xs text-white" value={tempEditValue.idiom?.relatives || ''} onChange={(e) => setTempEditValue({...tempEditValue, idiom: {...tempEditValue.idiom, relatives: e.target.value}})} placeholder="近反義" />
                        <textarea className="bg-slate-950 border border-slate-700 rounded p-1 text-xs text-white h-12" value={tempEditValue.idiom?.context || ''} onChange={(e) => setTempEditValue({...tempEditValue, idiom: {...tempEditValue.idiom, context: e.target.value}})} placeholder="生活應用情境 (必填)" />
                        <textarea className="bg-slate-950 border border-slate-700 rounded p-1 text-xs text-slate-300 h-12" value={tempEditValue.idiom?.example || ''} onChange={(e) => setTempEditValue({...tempEditValue, idiom: {...tempEditValue.idiom, example: e.target.value}})} placeholder="例句" />
                    </div>
                </div>
            )}
            <div className="flex justify-end gap-2 mt-2">
                <button onClick={cancelEdit} className="p-1 text-slate-400 hover:text-white"><X size={18} /></button>
                <button onClick={saveEdit} className="p-1 text-emerald-400 hover:text-emerald-300"><Check size={18} /></button>
            </div>
        </div>
      );
  }

  // --- Render Helpers ---
  if (parseError || !data) {
    return (
      <div className="flex flex-col h-full space-y-6">
        <div className="bg-red-900/20 border border-red-500/50 p-4 rounded-lg flex items-center text-red-200">
           <AlertCircle className="mr-2" size={20} />
           {parseError || "語文輻射資料載入中..."}
        </div>
        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 max-h-96 overflow-y-auto whitespace-pre-wrap font-mono text-sm">
           {deepAnalysisResult}
        </div>
      </div>
    );
  }

  const isEditingAny = editingIndex !== -1;

  return (
    <div className="flex flex-col h-full relative">
       <div className="flex-1 overflow-y-auto custom-scrollbar pb-32 px-1">
          <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
             {/* Header */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white flex items-center">
                        <span className="bg-emerald-600 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">2.5</span>
                        語文輻射 (Deep Vocabulary)
                    </h2>
                </div>
                <p className="text-slate-400 text-sm">
                    Step 2.5 階段確認：形近字辨析、多音字與成語詳解。確認無誤後，AI 將進行「深度架構 (Step 2.75)」。
                </p>
            </div>

            {/* 1. Vocabulary Section */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
                <div className="bg-slate-800/80 px-4 py-2 border-b border-slate-700 flex justify-between items-center">
                    <h3 className="font-bold text-slate-200 text-sm">語文輻射 (Detailed Vocab)</h3>
                    <span className="text-xs text-slate-500">{data.vocabulary.length} 項目</span>
                </div>
                <div className="divide-y divide-slate-800">
                    {data.vocabulary.map((item, idx) => (
                        <div key={idx} className="p-4 hover:bg-slate-800/30 transition-colors group">
                             {editingIndex === idx ? renderVocabEditor() : (
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                         <div className="flex items-center gap-2 mb-2">
                                            <span className="text-amber-400 font-bold text-lg">{item.word}</span>
                                            {item.zhuyin && <span className="text-sm text-slate-400 font-mono">({item.zhuyin})</span>}
                                            <span className={`text-xs px-1.5 py-0.5 rounded ${item.type === '成語' ? 'bg-purple-900/30 text-purple-300' : item.type === '多音字' ? 'bg-indigo-900/30 text-indigo-300' : 'bg-slate-800 text-slate-400'}`}>
                                                {item.type}
                                            </span>
                                        </div>
                                        {/* Display Logic */}
                                        {item.type === '形近字' && item.shapeSimilar && (
                                            <div className="text-sm text-slate-300 space-y-2 pl-2 border-l-2 border-slate-700">
                                                {item.shapeSimilar.map((sim, i) => (
                                                    <div key={i} className="grid grid-cols-[auto_1fr] gap-2">
                                                        <div className="font-bold text-slate-200">{sim.char} <span className="text-slate-500 font-normal text-xs">({sim.radical})</span></div>
                                                        <div><span className="text-emerald-300">{sim.words}</span>{sim.explanation && <span className="text-slate-500 text-xs ml-2">({sim.explanation})</span>}</div>
                                                    </div>
                                                ))}
                                                {item.mnemonic && <div className="mt-2 text-xs text-blue-300 bg-blue-900/10 p-1.5 rounded inline-block"><span className="font-bold mr-1">💡 辨析筆記:</span> {item.mnemonic}</div>}
                                            </div>
                                        )}
                                         {item.type === '多音字' && item.polyphonic && (
                                            <div className="text-sm text-slate-300 space-y-1 pl-2 border-l-2 border-indigo-900">
                                                {item.polyphonic.map((poly, i) => (
                                                    <div key={i} className="flex gap-2 items-center">
                                                        <span className="text-indigo-300 font-mono w-16">{poly.zhuyin}</span>
                                                        <span className="text-white font-bold">{poly.words}</span>
                                                        <span className="text-slate-500 text-xs italic">{poly.usage}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        {item.type === '成語' && item.idiom && (
                                            <div className="text-sm text-slate-300 space-y-1 pl-2 border-l-2 border-purple-900">
                                                <div><span className="text-purple-400 text-xs font-bold">釋義:</span> {item.idiom.definition}</div>
                                                {item.idiom.context && <div><span className="text-orange-400 text-xs font-bold">情境:</span> {item.idiom.context}</div>}
                                                <div><span className="text-slate-500 text-xs font-bold">近反:</span> {item.idiom.relatives}</div>
                                                <div><span className="text-emerald-400 text-xs font-bold">例句:</span> <span className="italic text-slate-400">"{item.idiom.example}"</span></div>
                                            </div>
                                        )}
                                    </div>
                                    <div className={`flex gap-2 transition-opacity ${isEditingAny ? 'opacity-0 pointer-events-none' : 'opacity-0 group-hover:opacity-100'}`}>
                                        <button onClick={() => startEdit(idx, item)} className="text-blue-400 hover:text-blue-300 p-1"><Edit2 size={14} /></button>
                                        <button onClick={() => deleteItem(idx)} className="text-red-400 hover:text-red-300 p-1"><Trash2 size={14} /></button>
                                    </div>
                                </div>
                             )}
                        </div>
                    ))}
                </div>
                <div className="p-2 bg-slate-900 border-t border-slate-800 flex justify-center">
                    <button onClick={addNewVocabItem} disabled={isEditingAny} className={`flex items-center gap-2 text-xs py-1 px-4 rounded transition-colors w-full justify-center ${isEditingAny ? 'text-slate-600 cursor-not-allowed' : 'text-slate-400 hover:text-emerald-400 hover:bg-slate-800'}`}>
                        <Plus size={14} /> 新增項目
                    </button>
                </div>
            </div>

          </div>
       </div>

        {/* Confirm Footer */}
       <div className="absolute bottom-0 left-0 right-0 p-4 bg-slate-950/90 backdrop-blur-md border-t border-slate-800 flex justify-center gap-4 z-10 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.5)]">
             <button
                onClick={onBack}
                disabled={isLoading}
                className="px-6 py-3 text-slate-300 font-bold rounded-xl border border-slate-700 hover:bg-slate-800 transition-all flex items-center justify-center disabled:opacity-50"
             >
                <ArrowLeft className="mr-2" size={20} />
                返回上一步
             </button>
             <button
                onClick={handleConfirm}
                disabled={isEditingAny || isLoading}
                className={`flex-1 max-w-xl py-3 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center ${
                    isEditingAny || isLoading
                    ? 'bg-slate-700 text-slate-400 cursor-not-allowed' 
                    : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/50'
                }`}
             >
                {isLoading ? (
                    "正在分析意義段與策略..."
                ) : (
                    <>
                        確認語文輻射，進入深度解構 (Step 2.75)
                        <ArrowRight className="ml-2" size={20} />
                    </>
                )}
             </button>
      </div>
    </div>
  );
};

export default Step2Deep;