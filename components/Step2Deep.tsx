import React, { useState, useEffect } from 'react';
import { Brain, Edit2, Trash2, Check, X, Plus, RefreshCw, Layers, ArrowRight, Sparkles, BookOpen, Quote, AlertCircle, Wand2, Zap, Copy } from 'lucide-react';
import { AnalysisData, VocabularyItem, SegmentItem, StrategyItem, ShapeSimilarItem } from '../types';

interface Step2DeepProps {
  basicData: AnalysisData; // Context from Step 2 Basic
  deepAnalysisResult: string; // The raw JSON string from Step 2.5
  onConfirmDeep: (refinedAnalysis: string) => void;
  isLoading: boolean;
  onRegenerateStrategies: (data: AnalysisData) => Promise<StrategyItem[]>;
  onGenerateSingleStrategy: (data: AnalysisData, existingStrategies: StrategyItem[], targetType?: string) => Promise<StrategyItem | null>;
  onGenerateMnemonic: (chars: ShapeSimilarItem[]) => Promise<string>;
}

const Step2Deep: React.FC<Step2DeepProps> = ({ 
    basicData, 
    deepAnalysisResult, 
    onConfirmDeep, 
    isLoading, 
    onRegenerateStrategies, 
    onGenerateSingleStrategy, 
    onGenerateMnemonic 
}) => {
  const [data, setData] = useState<AnalysisData | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  
  // Loading states
  const [isRegeneratingStrategies, setIsRegeneratingStrategies] = useState(false);
  const [isGeneratingMnemonic, setIsGeneratingMnemonic] = useState(false);
  
  // Track which specific button triggered the generation
  const [generatingType, setGeneratingType] = useState<string | null>(null);

  // Edit states
  const [editingSection, setEditingSection] = useState<'vocab' | 'segment' | 'strategy' | null>(null);
  const [editingIndex, setEditingIndex] = useState<number>(-1);
  const [tempEditValue, setTempEditValue] = useState<any>(null);

  // Helper for checking if any strategy generation is in progress
  const isGeneratingAnyStrategy = generatingType !== null || isRegeneratingStrategies;

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
      const mergedData: AnalysisData = {
          ...basicData, // Mode, BasicInfo, CoreVocab, Idioms
          vocabulary: parsed.vocabulary || [],
          segments: parsed.segments || [],
          strategies: parsed.strategies || [],
          // Keep Basic fields if Deep Analysis returned them empty, or overwrite if needed (usually Deep shouldn't return Basic info)
      };

      // Patch segments keywords/difficultWords if missing
      mergedData.segments.forEach((seg: any) => {
          if (!seg.keywords) seg.keywords = [];
          if (!seg.difficultWords) seg.difficultWords = [];
          if (!seg.rhetorics) seg.rhetorics = [];
          if (!seg.sentencePatterns) seg.sentencePatterns = [];
      });

      // Backward compatibility check for strategies
      if (mergedData.strategies.length > 0) {
        mergedData.strategies = mergedData.strategies.map((s: any) => {
            if (typeof s === 'string') {
                return {
                    type: 'General',
                    title: "舊版策略格式",
                    teachingPoint: s,
                    application: "請重新編輯",
                    method: ""
                };
            }
            return s;
        });
      }

      setData(mergedData);
      setParseError(null);
    } catch (e) {
      console.error("JSON Parse Error", e);
      setParseError("無法解析深度解構資料。");
    }
  }, [deepAnalysisResult, basicData]);

  const handleConfirm = () => {
    const refinedAnalysisString = JSON.stringify(data, null, 2);
    onConfirmDeep(refinedAnalysisString);
  };

  // --- Handlers (Same as Step2Strategy) ---
  const handleRegenerateStrategiesClick = async () => {
    if (!data) return;
    setIsRegeneratingStrategies(true);
    try {
        const newStrategies = await onRegenerateStrategies(data);
        if (newStrategies && newStrategies.length > 0) {
            setData(prev => prev ? ({ ...prev, strategies: newStrategies }) : null);
        }
    } catch (error) {
        console.error("Regeneration failed", error);
        alert("AI 重新發想失敗，請稍後再試。");
    } finally {
        setIsRegeneratingStrategies(false);
    }
  };

  const handleGenerateSingleStrategyClick = async (type: string) => {
    if (!data) return;
    setGeneratingType(type);
    try {
        const newStrategy = await onGenerateSingleStrategy(data, data.strategies, type);
        if (newStrategy) {
             setData(prev => prev ? ({ ...prev, strategies: [...prev.strategies, newStrategy] }) : null);
        }
    } catch (error) {
        alert(`AI 發想 ${type} 策略失敗。`);
    } finally {
        setGeneratingType(null);
    }
  };

  const handleRefreshSpecificStrategy = async (index: number) => {
      // NOTE: This feature (regenerating specific item) still uses the default logic (random/varied) 
      // or we could infer type from current item, but keeping it simple for now as per request.
      if (!data) return;
      
      const itemToRefresh = data.strategies[index];
      const targetType = itemToRefresh.type || 'Rhetoric'; 
      
      setGeneratingType(`refresh-${index}`); // Hacky ID

      try {
          const otherStrategies = data.strategies.filter((_, i) => i !== index);
          // Pass current type to preserve it
          const newStrategy = await onGenerateSingleStrategy(data, otherStrategies, targetType);
          if (newStrategy) {
              const newStrategies = [...data.strategies];
              newStrategies[index] = newStrategy;
              setData(prev => prev ? ({ ...prev, strategies: newStrategies }) : null);
          }
      } catch (error) {
           console.error("Specific Strategy Regeneration failed", error);
      } finally {
          setGeneratingType(null);
      }
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

  // --- CRUD Operations ---
  const deleteItem = (section: 'vocab' | 'segments' | 'strategies', index: number) => {
    if (!data) return;
    const newData = { ...data };
    if (section === 'vocab') newData.vocabulary.splice(index, 1);
    if (section === 'segments') newData.segments.splice(index, 1);
    if (section === 'strategies') newData.strategies.splice(index, 1);
    setData(newData);
  };

  const startEdit = (section: 'vocab' | 'segment' | 'strategy', index: number, item: any) => {
    setEditingSection(section);
    setEditingIndex(index);
    const copy = JSON.parse(JSON.stringify(item));
    if (section === 'segment') {
        copy._keywordsStr = copy.keywords ? copy.keywords.join(' ') : '';
        copy._diffWordsStr = copy.difficultWords ? copy.difficultWords.join(' ') : '';
    }
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
      startEdit('vocab', newData.vocabulary.length - 1, newItem);
  };

  const addNewSegmentItem = () => {
    if (!data) return;
    const newItem: SegmentItem = {
        title: "新段落", summary: "段落大意", keywords: [], difficultWords: [], rhetorics: [], sentencePatterns: [], deepDive: ""
    };
    const newData = { ...data };
    newData.segments.push(newItem);
    setData(newData);
    startEdit('segment', newData.segments.length - 1, newItem);
  };

  const saveEdit = () => {
    if (!data) return;
    const newData = { ...data };
    
    if (editingSection === 'vocab') {
      newData.vocabulary[editingIndex] = tempEditValue;
    } else if (editingSection === 'segment') {
       const keywordsArr = tempEditValue._keywordsStr 
            ? tempEditValue._keywordsStr.split(/[,，\s]+/).filter((w: string) => w.trim().length > 0)
            : [];
       const diffWordsArr = tempEditValue._diffWordsStr 
            ? tempEditValue._diffWordsStr.split(/[,，\s]+/).filter((w: string) => w.trim().length > 0)
            : [];
       const segmentToSave = { ...tempEditValue, keywords: keywordsArr, difficultWords: diffWordsArr };
       delete segmentToSave._keywordsStr; delete segmentToSave._diffWordsStr;
       newData.segments[editingIndex] = segmentToSave;
    } else if (editingSection === 'strategy') {
      newData.strategies[editingIndex] = tempEditValue;
    }
    setData(newData);
    cancelEdit();
  };

  const cancelEdit = () => {
    setEditingSection(null);
    setEditingIndex(-1);
    setTempEditValue(null);
  };

  const appendDifficultWord = (word: string) => {
      if (!tempEditValue || editingSection !== 'segment') return;
      const current = tempEditValue._diffWordsStr || "";
      // Check if word already exists
      if (current.includes(word)) return;
      
      const newVal = current ? `${current} ${word}` : word;
      setTempEditValue({...tempEditValue, _diffWordsStr: newVal});
  };

  // --- Editor Renderers (Reused from Step2Strategy) ---
  const renderVocabEditor = () => {
      if (!tempEditValue) return null;
      // ... (Same logic as before for editor UI)
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
                     <label className="text-xs text-slate-500 uppercase">形近字辨析</label>
                    {(tempEditValue.shapeSimilar || []).map((item: any, i: number) => (
                        <div key={i} className="flex gap-1">
                            <input className="w-12 bg-slate-950 border border-slate-700 rounded p-1 text-xs text-white" value={item.char} onChange={(e) => { const newArr = [...tempEditValue.shapeSimilar]; newArr[i].char = e.target.value; setTempEditValue({...tempEditValue, shapeSimilar: newArr}); }} placeholder="字" />
                             <input className="w-16 bg-slate-950 border border-slate-700 rounded p-1 text-xs text-white" value={item.radical} onChange={(e) => { const newArr = [...tempEditValue.shapeSimilar]; newArr[i].radical = e.target.value; setTempEditValue({...tempEditValue, shapeSimilar: newArr}); }} placeholder="部首" />
                             <input className="flex-1 bg-slate-950 border border-slate-700 rounded p-1 text-xs text-white" value={item.words} onChange={(e) => { const newArr = [...tempEditValue.shapeSimilar]; newArr[i].words = e.target.value; setTempEditValue({...tempEditValue, shapeSimilar: newArr}); }} placeholder="造詞" />
                             <input className="flex-1 bg-slate-950 border border-slate-700 rounded p-1 text-xs text-slate-400" value={item.explanation} onChange={(e) => { const newArr = [...tempEditValue.shapeSimilar]; newArr[i].explanation = e.target.value; setTempEditValue({...tempEditValue, shapeSimilar: newArr}); }} placeholder="解釋部首差異" />
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
                    <label className="text-xs text-slate-500 uppercase">讀音辨析</label>
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
           {parseError || "深度資料載入中..."}
        </div>
        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 max-h-96 overflow-y-auto whitespace-pre-wrap font-mono text-sm">
           {deepAnalysisResult}
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
                        <span className="bg-emerald-600 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">2.5</span>
                        深度解構 (Deep Analysis)
                    </h2>
                </div>
                <p className="text-slate-400 text-sm">
                    AI 已完成生字辨析、意義段劃分與策略發想。請檢視細節並進行微調。
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
                             {editingSection === 'vocab' && editingIndex === idx ? renderVocabEditor() : (
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
                                        <button onClick={() => startEdit('vocab', idx, item)} className="text-blue-400 hover:text-blue-300 p-1"><Edit2 size={14} /></button>
                                        <button onClick={() => deleteItem('vocab', idx)} className="text-red-400 hover:text-red-300 p-1"><Trash2 size={14} /></button>
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

            {/* 2. Segments Section */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
                <div className="bg-slate-800/80 px-4 py-2 border-b border-slate-700 flex justify-between items-center">
                    <h3 className="font-bold text-slate-200 text-sm">意義段分析 (Segments)</h3>
                    <span className="text-xs text-slate-500">{data.segments.length} 段落</span>
                </div>
                <div className="divide-y divide-slate-800">
                    {data.segments.map((item, idx) => (
                        <div key={idx} className="p-4 hover:bg-slate-800/30 transition-colors group">
                             {editingSection === 'segment' && editingIndex === idx ? (
                                <div className="space-y-3 bg-slate-800/20 p-3 rounded-lg border border-slate-700">
                                    <input className="bg-slate-950 border border-slate-700 rounded p-1 text-white text-sm w-full font-bold" value={tempEditValue.title} onChange={(e) => setTempEditValue({...tempEditValue, title: e.target.value})} placeholder="段落標題" />
                                    <textarea className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white text-xs h-24" value={tempEditValue.summary} onChange={(e) => setTempEditValue({...tempEditValue, summary: e.target.value})} placeholder="大意" />
                                    
                                     {/* Rhetoric Array Editor */}
                                        <div className="space-y-1">
                                            <label className="text-xs text-slate-500 uppercase">修辭技巧 (Rhetoric)</label>
                                            {(tempEditValue.rhetorics || []).map((r: any, i: number) => (
                                                <div key={i} className="flex gap-1 mb-1">
                                                    <input className="w-[45%] bg-slate-950 border border-slate-700 rounded p-1 text-white text-xs" value={r.name} onChange={(e) => {
                                                        const newArr = [...tempEditValue.rhetorics]; newArr[i].name = e.target.value; setTempEditValue({...tempEditValue, rhetorics: newArr});
                                                    }} placeholder="名稱 + 解析 (如: 譬喻 - 將月亮比喻為玉盤)" />
                                                    <input className="flex-1 bg-slate-950 border border-slate-700 rounded p-1 text-slate-300 text-xs" value={r.example} onChange={(e) => {
                                                        const newArr = [...tempEditValue.rhetorics]; newArr[i].example = e.target.value; setTempEditValue({...tempEditValue, rhetorics: newArr});
                                                    }} placeholder="原文例句" />
                                                    <button onClick={() => {
                                                        const newArr = [...tempEditValue.rhetorics]; newArr.splice(i, 1); setTempEditValue({...tempEditValue, rhetorics: newArr});
                                                    }} className="text-red-400 hover:text-red-300 p-1"><X size={12} /></button>
                                                </div>
                                            ))}
                                            <button onClick={() => {
                                                const newArr = [...(tempEditValue.rhetorics || []), { name: '', example: '' }];
                                                setTempEditValue({...tempEditValue, rhetorics: newArr});
                                            }} className="text-xs text-blue-400 flex items-center"><Plus size={10} className="mr-1"/>新增修辭</button>
                                        </div>

                                        {/* Sentence Pattern Array Editor */}
                                        <div className="space-y-1 mt-2">
                                            <label className="text-xs text-slate-500 uppercase">句型應用 (Sentence Patterns)</label>
                                            {(tempEditValue.sentencePatterns || []).map((p: any, i: number) => (
                                                <div key={i} className="flex gap-1 mb-1">
                                                    <input className="w-[45%] bg-slate-950 border border-slate-700 rounded p-1 text-white text-xs" value={p.name} onChange={(e) => {
                                                        const newArr = [...tempEditValue.sentencePatterns]; newArr[i].name = e.target.value; setTempEditValue({...tempEditValue, sentencePatterns: newArr});
                                                    }} placeholder="句型結構 (如: 不但...而且...)" />
                                                    <input className="flex-1 bg-slate-950 border border-slate-700 rounded p-1 text-slate-300 text-xs" value={p.example} onChange={(e) => {
                                                        const newArr = [...tempEditValue.sentencePatterns]; newArr[i].example = e.target.value; setTempEditValue({...tempEditValue, sentencePatterns: newArr});
                                                    }} placeholder="原文例句" />
                                                    <button onClick={() => {
                                                        const newArr = [...tempEditValue.sentencePatterns]; newArr.splice(i, 1); setTempEditValue({...tempEditValue, sentencePatterns: newArr});
                                                    }} className="text-red-400 hover:text-red-300 p-1"><X size={12} /></button>
                                                </div>
                                            ))}
                                            <button onClick={() => {
                                                const newArr = [...(tempEditValue.sentencePatterns || []), { name: '', example: '' }];
                                                setTempEditValue({...tempEditValue, sentencePatterns: newArr});
                                            }} className="text-xs text-blue-400 flex items-center"><Plus size={10} className="mr-1"/>新增句型</button>
                                        </div>

                                     {/* Difficult Words Editor with Helper */}
                                     <div className="space-y-1 mt-2">
                                        <label className="text-xs text-slate-500 uppercase flex items-center justify-between">
                                            <span className="flex items-center"><Sparkles size={10} className="mr-1" />段落難詞 (Difficult Words)</span>
                                        </label>
                                        <input className="bg-slate-950 border border-slate-700 rounded p-1 text-blue-300 text-sm w-full" value={tempEditValue._diffWordsStr} onChange={(e) => setTempEditValue({...tempEditValue, _diffWordsStr: e.target.value})} placeholder="請輸入難詞，以空格分隔" />
                                        
                                        {/* Helper Chips */}
                                        {basicData.textbookDifficultWords && basicData.textbookDifficultWords.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mt-1 bg-slate-900/50 p-2 rounded border border-slate-800">
                                                <span className="text-[10px] text-slate-500 w-full mb-1">點擊以加入課本難詞:</span>
                                                {basicData.textbookDifficultWords.map((word, wi) => (
                                                    <button 
                                                        key={wi} 
                                                        onClick={() => appendDifficultWord(word)}
                                                        className="text-[10px] bg-amber-900/20 text-amber-200 border border-amber-900/50 px-1.5 py-0.5 rounded hover:bg-amber-900/40 transition-colors flex items-center"
                                                    >
                                                        <Plus size={8} className="mr-1" />{word}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                     </div>

                                    <div className="flex justify-end gap-2 mt-2">
                                        <button onClick={cancelEdit} className="p-1 text-slate-400 hover:text-white"><X size={18} /></button>
                                        <button onClick={saveEdit} className="p-1 text-emerald-400 hover:text-emerald-300"><Check size={18} /></button>
                                    </div>
                                </div>
                             ) : (
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <h4 className="text-emerald-300 font-bold text-sm mb-1">{item.title}</h4>
                                        <p className="text-xs text-slate-400 mb-2">{item.summary}</p>
                                        
                                        <div className="flex flex-wrap gap-2 mb-2">
                                            {item.difficultWords && item.difficultWords.length > 0 && item.difficultWords.map((w, wi) => (
                                                <span key={wi} className="text-[10px] bg-blue-900/30 text-blue-300 border border-blue-900/50 px-1.5 py-0.5 rounded">{w}</span>
                                            ))}
                                        </div>

                                        {/* Display Rhetorics */}
                                        {item.rhetorics && item.rhetorics.length > 0 && (
                                            <div className="flex flex-col gap-1 mt-2">
                                                {item.rhetorics.map((r, i) => (
                                                    <div key={i} className="text-xs">
                                                        <span className="text-emerald-400 font-bold bg-emerald-950/50 px-1 rounded mr-2">修辭: {r.name}</span>
                                                        <span className="text-slate-400 italic">"{r.example}"</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        {/* Display Sentence Patterns */}
                                        {item.sentencePatterns && item.sentencePatterns.length > 0 && (
                                            <div className="flex flex-col gap-1 mt-2">
                                                {item.sentencePatterns.map((p, i) => (
                                                    <div key={i} className="text-xs">
                                                        <span className="text-amber-400 font-bold bg-amber-950/50 px-1 rounded mr-2">句型: {p.name}</span>
                                                        <span className="text-slate-400 italic">"{p.example}"</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <div className="mt-3 text-xs text-blue-300 bg-blue-900/20 p-2 rounded border border-blue-900/30"><span className="font-bold opacity-70">深究: </span>{item.deepDive}</div>
                                    </div>
                                    <div className={`flex gap-2 ml-4 transition-opacity ${isEditingAny ? 'opacity-0 pointer-events-none' : 'opacity-0 group-hover:opacity-100'}`}>
                                        <button onClick={() => startEdit('segment', idx, item)} className="text-blue-400 hover:text-blue-300 p-1"><Edit2 size={14} /></button>
                                        <button onClick={() => deleteItem('segments', idx)} className="text-red-400 hover:text-red-300 p-1"><Trash2 size={14} /></button>
                                    </div>
                                </div>
                             )}
                        </div>
                    ))}
                </div>
                 <div className="p-2 bg-slate-900 border-t border-slate-800 flex justify-center">
                    <button onClick={addNewSegmentItem} disabled={isEditingAny} className={`flex items-center gap-2 text-xs py-1 px-4 rounded transition-colors w-full justify-center ${isEditingAny ? 'text-slate-600 cursor-not-allowed' : 'text-slate-400 hover:text-emerald-400 hover:bg-slate-800'}`}>
                        <Plus size={14} /> 新增段落
                    </button>
                </div>
            </div>

            {/* 3. Strategies Section */}
             <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden relative">
                <div className="bg-slate-800/80 px-4 py-2 border-b border-slate-700 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-200 text-sm">語文百寶箱 (Strategies)</h3>
                        <span className="text-xs text-slate-500">{data.strategies.length} 策略</span>
                    </div>
                    <button onClick={handleRegenerateStrategiesClick} disabled={isGeneratingAnyStrategy || isEditingAny} className={`text-xs flex items-center gap-1 px-3 py-1.5 rounded-full transition-all border ${isRegeneratingStrategies ? 'bg-slate-800 text-slate-600' : 'bg-blue-900/20 text-blue-400 border-blue-900/50'}`}>
                        <RefreshCw size={12} className={isRegeneratingStrategies ? "animate-spin" : ""} /> 重新發想
                    </button>
                </div>
                <div className="divide-y divide-slate-800 grid grid-cols-1 md:grid-cols-2 gap-px bg-slate-800">
                    {data.strategies.map((item, idx) => {
                        const isRhetoric = item.type === 'Rhetoric';
                        const isThinking = item.type === 'Thinking';
                        const cardBg = isRhetoric ? 'bg-purple-50' : isThinking ? 'bg-sky-50' : 'bg-amber-50'; // Light bg logic for card style? No, keeping dark theme.
                        // Let's use dark theme compatible colors but distinct
                        const borderColor = isRhetoric ? 'border-purple-500/30' : isThinking ? 'border-sky-500/30' : 'border-amber-500/30';
                        const headerColor = isRhetoric ? 'text-purple-300' : isThinking ? 'text-sky-300' : 'text-amber-300';
                        const badgeColor = isRhetoric ? 'bg-purple-900/50 text-purple-200' : isThinking ? 'bg-sky-900/50 text-sky-200' : 'bg-amber-900/50 text-amber-200';

                        // Specific loading state for this card
                        const isRefreshingThis = generatingType === `refresh-${idx}`;

                        return (
                        <div key={idx} className={`p-4 bg-slate-950 hover:bg-slate-900/50 transition-colors group relative border ${borderColor} m-2 rounded-xl`}>
                             {/* Specific Item Loading Overlay */}
                             {isRefreshingThis && (
                                <div className="absolute inset-0 bg-slate-900/80 z-10 flex items-center justify-center rounded-xl">
                                    <RefreshCw className="text-emerald-400 animate-spin mr-2" size={16} />
                                    <span className="text-xs text-emerald-300">更新中...</span>
                                </div>
                             )}

                             {editingSection === 'strategy' && editingIndex === idx ? (
                                <div className="flex flex-col gap-3">
                                    <div className="flex gap-2">
                                        <select className="bg-slate-900 border border-slate-700 rounded p-1.5 text-white text-sm w-1/3" value={tempEditValue.type || 'Rhetoric'} onChange={(e) => setTempEditValue({...tempEditValue, type: e.target.value})}>
                                            <option value="Rhetoric">🔮 修辭</option><option value="Thinking">🧠 思考</option><option value="Task">⚡ 任務</option>
                                        </select>
                                        <input className="bg-slate-900 border border-slate-700 rounded p-1.5 text-white text-sm font-bold flex-1" value={tempEditValue.title} onChange={(e) => setTempEditValue({...tempEditValue, title: e.target.value})} />
                                    </div>
                                    <textarea className="bg-slate-900 border border-slate-700 rounded p-2 text-white text-xs w-full h-16" value={tempEditValue.method || ''} onChange={(e) => setTempEditValue({...tempEditValue, method: e.target.value})} placeholder="方法論 (Method)" />
                                    <textarea className="bg-slate-900 border border-slate-700 rounded p-2 text-white text-xs w-full h-16" value={tempEditValue.teachingPoint} onChange={(e) => setTempEditValue({...tempEditValue, teachingPoint: e.target.value})} placeholder="教學引導 (Insight)" />
                                    <textarea className="bg-slate-900 border border-slate-700 rounded p-2 text-white text-xs w-full h-16" value={tempEditValue.application} onChange={(e) => setTempEditValue({...tempEditValue, application: e.target.value})} placeholder="微任務 (Interaction)" />
                                    <div className="flex justify-end gap-2 mt-1">
                                        <button onClick={cancelEdit} className="p-1 text-slate-400 hover:text-white"><X size={18} /></button>
                                        <button onClick={saveEdit} className="p-1 text-emerald-400 hover:text-emerald-300"><Check size={18} /></button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col h-full">
                                    {/* Header */}
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${badgeColor}`}>
                                                {item.type}
                                            </span>
                                            <h4 className={`font-bold text-sm mt-2 ${headerColor}`}>{item.title}</h4>
                                        </div>
                                         <div className={`flex gap-1 transition-opacity ${isEditingAny ? 'opacity-0 pointer-events-none' : 'opacity-0 group-hover:opacity-100'}`}>
                                            <button 
                                                onClick={() => handleRefreshSpecificStrategy(idx)} 
                                                className="text-emerald-400 hover:text-emerald-300 p-1"
                                                disabled={isGeneratingAnyStrategy}
                                            >
                                                <RefreshCw size={14} className={isRefreshingThis ? "animate-spin" : ""} />
                                            </button>
                                            <button onClick={() => startEdit('strategy', idx, item)} className="text-blue-400 hover:text-blue-300 p-1"><Edit2 size={14} /></button>
                                            <button onClick={() => deleteItem('strategies', idx)} className="text-red-400 hover:text-red-300 p-1"><Trash2 size={14} /></button>
                                        </div>
                                    </div>

                                    {/* Content Blocks */}
                                    <div className="space-y-3 flex-1 text-xs">
                                        {item.method && (
                                            <div>
                                                <div className="text-[10px] text-slate-500 font-bold uppercase mb-0.5">方法論 (Method)</div>
                                                <div className="text-slate-300">{item.method}</div>
                                            </div>
                                        )}
                                        <div>
                                            <div className="text-[10px] text-slate-500 font-bold uppercase mb-0.5">教學引導 (Insight)</div>
                                            <div className="text-slate-300">{item.teachingPoint}</div>
                                        </div>
                                         <div className="bg-slate-900/50 p-2 rounded border border-slate-800">
                                            <div className="text-[10px] text-slate-500 font-bold uppercase mb-0.5">1分鐘微任務 (Interaction)</div>
                                            <div className="text-slate-300">{item.application}</div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );})}
                </div>
                 <div className="p-2 bg-slate-900 border-t border-slate-800 flex flex-col gap-2 justify-center items-center">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">✨ AI 新增策略 (請選擇類型)</span>
                    <div className="flex gap-2 w-full justify-center">
                        <button 
                            onClick={() => handleGenerateSingleStrategyClick('Rhetoric')} 
                            disabled={isGeneratingAnyStrategy || isEditingAny}
                            className={`flex-1 max-w-[120px] flex items-center justify-center gap-1 text-xs py-1.5 px-2 rounded border border-purple-900/50 bg-purple-900/10 text-purple-400 hover:bg-purple-900/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            {generatingType === 'Rhetoric' ? <RefreshCw size={12} className="animate-spin" /> : <Wand2 size={12} />}
                            修辭
                        </button>
                        <button 
                            onClick={() => handleGenerateSingleStrategyClick('Thinking')} 
                            disabled={isGeneratingAnyStrategy || isEditingAny}
                            className={`flex-1 max-w-[120px] flex items-center justify-center gap-1 text-xs py-1.5 px-2 rounded border border-blue-900/50 bg-blue-900/10 text-blue-400 hover:bg-blue-900/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            {generatingType === 'Thinking' ? <RefreshCw size={12} className="animate-spin" /> : <Brain size={12} />}
                            思考
                        </button>
                        <button 
                            onClick={() => handleGenerateSingleStrategyClick('Task')} 
                            disabled={isGeneratingAnyStrategy || isEditingAny}
                            className={`flex-1 max-w-[120px] flex items-center justify-center gap-1 text-xs py-1.5 px-2 rounded border border-amber-900/50 bg-amber-900/10 text-amber-400 hover:bg-amber-900/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            {generatingType === 'Task' ? <RefreshCw size={12} className="animate-spin" /> : <Zap size={12} />}
                            任務
                        </button>
                    </div>
                </div>
            </div>

          </div>
       </div>

        {/* Confirm Footer */}
       <div className="absolute bottom-0 left-0 right-0 p-4 bg-slate-950/90 backdrop-blur-md border-t border-slate-800 flex justify-center z-10 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.5)]">
             <button
                onClick={handleConfirm}
                disabled={isEditingAny || isLoading}
                className={`w-full max-w-2xl py-3 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center ${
                    isEditingAny || isLoading
                    ? 'bg-slate-700 text-slate-400 cursor-not-allowed' 
                    : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/50'
                }`}
             >
                {isLoading ? (
                    "正在分析形式與風格..."
                ) : (
                    <>
                        深度解構完成，前往形式風格
                        <ArrowRight className="ml-2" size={20} />
                    </>
                )}
             </button>
      </div>
    </div>
  );
};

export default Step2Deep;