import React, { useState, useEffect } from 'react';
import { Brain, Edit2, Trash2, Check, X, Plus, RefreshCw, Layers, ArrowRight, Sparkles, AlertCircle, Wand2, Zap, ArrowLeft, Tag } from 'lucide-react';
import { AnalysisData, SegmentItem, StrategyItem } from '../types';

interface Step2DeepSegmentsProps {
  currentData: AnalysisData; // Context (Basic + Vocab)
  deepSegmentsResult: string; // The raw JSON string from Step 2.75
  onConfirmSegments: (refinedAnalysis: string) => void;
  isLoading: boolean;
  onRegenerateStrategies: (data: AnalysisData) => Promise<StrategyItem[]>;
  onGenerateSingleStrategy: (data: AnalysisData, existingStrategies: StrategyItem[], targetType?: string) => Promise<StrategyItem | null>;
  onGenerateRhetoricGuidance: (segmentTitle: string, rhetoricName: string, rhetoricExample: string) => Promise<{teachingPoint: string, application: string} | null>;
  onBack: () => void;
}

const Step2DeepSegments: React.FC<Step2DeepSegmentsProps> = ({ 
    currentData, 
    deepSegmentsResult, 
    onConfirmSegments, 
    isLoading, 
    onRegenerateStrategies, 
    onGenerateSingleStrategy,
    onGenerateRhetoricGuidance,
    onBack
}) => {
  const [data, setData] = useState<AnalysisData | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  
  // Loading states
  const [isRegeneratingStrategies, setIsRegeneratingStrategies] = useState(false);
  const [generatingType, setGeneratingType] = useState<string | null>(null);
  const [generatingRhetoricGuidance, setGeneratingRhetoricGuidance] = useState<string | null>(null); // format: "segmentIdx-rhetoricIdx"

  // Edit states
  const [editingSection, setEditingSection] = useState<'segment' | 'strategy' | null>(null);
  const [editingIndex, setEditingIndex] = useState<number>(-1);
  const [tempEditValue, setTempEditValue] = useState<any>(null);

  // Input states for Array additions
  const [keywordInput, setKeywordInput] = useState("");
  const [diffWordInput, setDiffWordInput] = useState("");

  // Helper for checking if any strategy generation is in progress
  const isGeneratingAnyStrategy = generatingType !== null || isRegeneratingStrategies;

  useEffect(() => {
    try {
      let cleanJson = deepSegmentsResult;
      if (cleanJson.includes('```json')) {
        cleanJson = cleanJson.replace(/```json/g, '').replace(/```/g, '');
      } else if (cleanJson.includes('```')) {
        cleanJson = cleanJson.replace(/```/g, '');
      }
      
      const parsed = JSON.parse(cleanJson);
      
      // Merge Segments Data with Previous Data
      const mergedData: AnalysisData = {
          ...currentData, 
          segments: parsed.segments || [],
          strategies: parsed.strategies || [],
      };

      // Patch segments keywords/difficultWords if missing
      mergedData.segments.forEach((seg: any) => {
          if (!seg.keywords) seg.keywords = [];
          if (!seg.difficultWords) seg.difficultWords = [];
          if (!seg.rhetorics) seg.rhetorics = [];
          if (!seg.sentencePatterns) seg.sentencePatterns = [];
      });

      setData(mergedData);
      setParseError(null);
    } catch (e) {
      console.error("JSON Parse Error", e);
      setParseError("無法解析深度解構資料。");
    }
  }, [deepSegmentsResult, currentData]);

  const handleConfirm = () => {
    const refinedAnalysisString = JSON.stringify(data, null, 2);
    onConfirmSegments(refinedAnalysisString);
  };

  // --- Handlers ---
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
      if (!data) return;
      const itemToRefresh = data.strategies[index];
      const targetType = itemToRefresh.type || 'Rhetoric'; 
      setGeneratingType(`refresh-${index}`); 

      try {
          const otherStrategies = data.strategies.filter((_, i) => i !== index);
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
  
  const handleGenerateRhetoricGuidanceClick = async (segmentIdx: number, rhetoricIdx: number) => {
      if (!data) return;
      const segment = data.segments[segmentIdx];
      const rhetoric = segment.rhetorics[rhetoricIdx];
      const key = `${segmentIdx}-${rhetoricIdx}`;
      
      setGeneratingRhetoricGuidance(key);
      try {
          const result = await onGenerateRhetoricGuidance(segment.title, rhetoric.name, rhetoric.example);
          if (result) {
              const newData = { ...data };
              const currentExample = newData.segments[segmentIdx].rhetorics[rhetoricIdx].example;
              // Append the guidance to the example field
              newData.segments[segmentIdx].rhetorics[rhetoricIdx].example = `${currentExample}\n\n[AI教學引導]: ${result.teachingPoint}\n[互動微任務]: ${result.application}`;
              setData(newData);
          }
      } catch (error) {
          console.error("Failed to generate rhetoric guidance", error);
          alert("AI 生成教學引導失敗，請稍後再試。");
      } finally {
          setGeneratingRhetoricGuidance(null);
      }
  };

  // --- CRUD Operations ---
  const deleteItem = (section: 'segments' | 'strategies', index: number) => {
    if (!data) return;
    const newData = { ...data };
    if (section === 'segments') newData.segments.splice(index, 1);
    if (section === 'strategies') newData.strategies.splice(index, 1);
    setData(newData);
  };

  const startEdit = (section: 'segment' | 'strategy', index: number, item: any) => {
    setEditingSection(section);
    setEditingIndex(index);
    const copy = JSON.parse(JSON.stringify(item));
    
    // Reset local inputs
    setKeywordInput("");
    setDiffWordInput("");

    setTempEditValue(copy);
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
    
    if (editingSection === 'segment') {
       // tempEditValue already contains array updates for keywords/difficultWords
       newData.segments[editingIndex] = tempEditValue;
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
    setKeywordInput("");
    setDiffWordInput("");
  };

  // --- Array Manipulation Helpers for Editing ---
  const removeKeyword = (idx: number) => {
      const newKeywords = [...(tempEditValue.keywords || [])];
      newKeywords.splice(idx, 1);
      setTempEditValue({ ...tempEditValue, keywords: newKeywords });
  };

  const addKeyword = () => {
      if (!keywordInput.trim()) return;
      const newKeywords = [...(tempEditValue.keywords || []), keywordInput.trim()];
      setTempEditValue({ ...tempEditValue, keywords: newKeywords });
      setKeywordInput("");
  };

  const removeDiffWord = (idx: number) => {
      const newWords = [...(tempEditValue.difficultWords || [])];
      newWords.splice(idx, 1);
      setTempEditValue({ ...tempEditValue, difficultWords: newWords });
  };

  const addDiffWord = () => {
      if (!diffWordInput.trim()) return;
      const newWords = [...(tempEditValue.difficultWords || []), diffWordInput.trim()];
      setTempEditValue({ ...tempEditValue, difficultWords: newWords });
      setDiffWordInput("");
  };

  const appendDifficultWordFromList = (word: string) => {
      if (!tempEditValue || editingSection !== 'segment') return;
      const current = tempEditValue.difficultWords || [];
      if (current.includes(word)) return;
      setTempEditValue({...tempEditValue, difficultWords: [...current, word]});
  };

  // --- Render Helpers ---
  if (parseError || !data) {
    return (
      <div className="flex flex-col h-full space-y-6">
        <div className="bg-red-900/20 border border-red-500/50 p-4 rounded-lg flex items-center text-red-200">
           <AlertCircle className="mr-2" size={20} />
           {parseError || "深度資料載入中..."}
        </div>
        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 max-h-96 overflow-y-auto whitespace-pre-wrap font-mono text-sm">
           {deepSegmentsResult}
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
                        <span className="bg-emerald-600 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">2.75</span>
                        深度解構 (Deep Segments)
                    </h2>
                </div>
                <p className="text-slate-400 text-sm">
                    Step 2.75 階段確認：意義段劃分與教學策略發想。確認無誤後，AI 將進行「形式與風格 (Step 3)」。
                </p>
            </div>

            {/* 1. Segments Section */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
                <div className="bg-slate-800/80 px-4 py-2 border-b border-slate-700 flex justify-between items-center">
                    <h3 className="font-bold text-slate-200 text-sm">意義段分析 (Segments)</h3>
                    <span className="text-xs text-slate-500">{data.segments.length} 段落</span>
                </div>
                <div className="divide-y divide-slate-800">
                    {data.segments.map((item, idx) => (
                        <div key={idx} className="p-4 hover:bg-slate-800/30 transition-colors group">
                             {editingSection === 'segment' && editingIndex === idx ? (
                                <div className="space-y-4 bg-slate-800/40 p-3 rounded-lg border border-slate-600 shadow-inner">
                                    <div className="flex justify-between items-center">
                                        <h4 className="text-white text-xs font-bold uppercase tracking-wider">編輯段落 {idx + 1}</h4>
                                        <button onClick={cancelEdit} className="text-slate-500 hover:text-white"><X size={16}/></button>
                                    </div>
                                    
                                    <input className="bg-slate-950 border border-slate-700 rounded p-2 text-white text-sm w-full font-bold focus:border-blue-500 outline-none" value={tempEditValue.title} onChange={(e) => setTempEditValue({...tempEditValue, title: e.target.value})} placeholder="段落標題" />
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Keywords Chip Editor */}
                                        <div className="space-y-2">
                                            <label className="text-xs text-emerald-400 font-bold uppercase flex items-center">
                                                <Brain size={12} className="mr-1" />
                                                心智圖細節 (Keywords)
                                            </label>
                                            <div className="bg-slate-950 border border-slate-700 rounded p-2 min-h-[60px] flex flex-wrap gap-2">
                                                {(tempEditValue.keywords || []).map((kw: string, i: number) => (
                                                    <div key={i} className="bg-emerald-900/30 border border-emerald-500/30 text-emerald-300 text-xs px-2 py-1 rounded-full flex items-center">
                                                        {kw}
                                                        <button onClick={() => removeKeyword(i)} className="ml-1 hover:text-white text-emerald-500/70"><X size={12}/></button>
                                                    </div>
                                                ))}
                                                <div className="flex items-center gap-1 flex-1 min-w-[100px]">
                                                    <input 
                                                        className="bg-transparent text-white text-xs outline-none w-full placeholder-slate-600" 
                                                        value={keywordInput}
                                                        onChange={(e) => setKeywordInput(e.target.value)}
                                                        onKeyDown={(e) => e.key === 'Enter' && addKeyword()}
                                                        placeholder="+ 新增關鍵詞 (Enter)"
                                                    />
                                                    <button onClick={addKeyword} disabled={!keywordInput.trim()} className="text-slate-500 hover:text-emerald-400"><Plus size={14}/></button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Difficult Words Chip Editor */}
                                        <div className="space-y-2">
                                            <label className="text-xs text-blue-400 font-bold uppercase flex items-center justify-between">
                                                <span className="flex items-center"><Sparkles size={12} className="mr-1" />段落難詞 (Difficult Words)</span>
                                            </label>
                                            <div className="bg-slate-950 border border-slate-700 rounded p-2 min-h-[60px] flex flex-wrap gap-2">
                                                {(tempEditValue.difficultWords || []).map((dw: string, i: number) => (
                                                    <div key={i} className="bg-blue-900/30 border border-blue-500/30 text-blue-300 text-xs px-2 py-1 rounded-full flex items-center">
                                                        {dw}
                                                        <button onClick={() => removeDiffWord(i)} className="ml-1 hover:text-white text-blue-500/70"><X size={12}/></button>
                                                    </div>
                                                ))}
                                                <div className="flex items-center gap-1 flex-1 min-w-[100px]">
                                                    <input 
                                                        className="bg-transparent text-white text-xs outline-none w-full placeholder-slate-600" 
                                                        value={diffWordInput}
                                                        onChange={(e) => setDiffWordInput(e.target.value)}
                                                        onKeyDown={(e) => e.key === 'Enter' && addDiffWord()}
                                                        placeholder="+ 新增難詞 (Enter)"
                                                    />
                                                     <button onClick={addDiffWord} disabled={!diffWordInput.trim()} className="text-slate-500 hover:text-blue-400"><Plus size={14}/></button>
                                                </div>
                                            </div>
                                            
                                            {/* Helper Chips */}
                                            {currentData.textbookDifficultWords && currentData.textbookDifficultWords.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {currentData.textbookDifficultWords.map((word, wi) => (
                                                        <button 
                                                            key={wi} 
                                                            onClick={() => appendDifficultWordFromList(word)}
                                                            className="text-[10px] bg-slate-800 text-slate-400 border border-slate-700 px-1.5 py-0.5 rounded hover:bg-slate-700 hover:text-white transition-colors flex items-center"
                                                        >
                                                            <Plus size={8} className="mr-1" />{word}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <textarea className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-white text-xs h-20 focus:border-blue-500 outline-none" value={tempEditValue.summary} onChange={(e) => setTempEditValue({...tempEditValue, summary: e.target.value})} placeholder="段落大意" />
                                    
                                     {/* Rhetoric Array Editor */}
                                        <div className="space-y-2 border-t border-slate-700/50 pt-3">
                                            <label className="text-xs text-purple-400 font-bold uppercase flex items-center"><Wand2 size={12} className="mr-1"/> 修辭技巧 (Rhetoric)</label>
                                            {(tempEditValue.rhetorics || []).map((r: any, i: number) => (
                                                <div key={i} className="flex gap-2 mb-1 items-center bg-slate-900/30 p-1 rounded">
                                                    <input className="w-[30%] bg-slate-950 border border-slate-700 rounded p-1.5 text-white text-xs focus:border-purple-500 outline-none" value={r.name} onChange={(e) => {
                                                        const newArr = [...tempEditValue.rhetorics]; newArr[i].name = e.target.value; setTempEditValue({...tempEditValue, rhetorics: newArr});
                                                    }} placeholder="名稱 (例: 譬喻)" />
                                                    <input className="flex-1 bg-slate-950 border border-slate-700 rounded p-1.5 text-slate-300 text-xs focus:border-purple-500 outline-none" value={r.example} onChange={(e) => {
                                                        const newArr = [...tempEditValue.rhetorics]; newArr[i].example = e.target.value; setTempEditValue({...tempEditValue, rhetorics: newArr});
                                                    }} placeholder="原文例句" />
                                                    <button onClick={() => {
                                                        const newArr = [...tempEditValue.rhetorics]; newArr.splice(i, 1); setTempEditValue({...tempEditValue, rhetorics: newArr});
                                                    }} className="text-red-400 hover:text-red-300 p-1.5 hover:bg-red-900/20 rounded"><Trash2 size={14} /></button>
                                                </div>
                                            ))}
                                            <button onClick={() => {
                                                const newArr = [...(tempEditValue.rhetorics || []), { name: '', example: '' }];
                                                setTempEditValue({...tempEditValue, rhetorics: newArr});
                                            }} className="text-xs text-blue-400 flex items-center hover:text-white px-2 py-1 rounded hover:bg-slate-800 transition-colors w-fit"><Plus size={12} className="mr-1"/>新增修辭</button>
                                        </div>

                                        {/* Sentence Pattern Array Editor */}
                                        <div className="space-y-2 border-t border-slate-700/50 pt-3">
                                            <label className="text-xs text-amber-400 font-bold uppercase flex items-center"><Layers size={12} className="mr-1"/> 句型應用 (Sentence Patterns)</label>
                                            {(tempEditValue.sentencePatterns || []).map((p: any, i: number) => (
                                                <div key={i} className="flex gap-2 mb-1 items-center bg-slate-900/30 p-1 rounded">
                                                    <input className="w-[30%] bg-slate-950 border border-slate-700 rounded p-1.5 text-white text-xs focus:border-amber-500 outline-none" value={p.name} onChange={(e) => {
                                                        const newArr = [...tempEditValue.sentencePatterns]; newArr[i].name = e.target.value; setTempEditValue({...tempEditValue, sentencePatterns: newArr});
                                                    }} placeholder="句型 (例: 不但...而且)" />
                                                    <input className="flex-1 bg-slate-950 border border-slate-700 rounded p-1.5 text-slate-300 text-xs focus:border-amber-500 outline-none" value={p.example} onChange={(e) => {
                                                        const newArr = [...tempEditValue.sentencePatterns]; newArr[i].example = e.target.value; setTempEditValue({...tempEditValue, sentencePatterns: newArr});
                                                    }} placeholder="原文例句" />
                                                    <button onClick={() => {
                                                        const newArr = [...tempEditValue.sentencePatterns]; newArr.splice(i, 1); setTempEditValue({...tempEditValue, sentencePatterns: newArr});
                                                    }} className="text-red-400 hover:text-red-300 p-1.5 hover:bg-red-900/20 rounded"><Trash2 size={14} /></button>
                                                </div>
                                            ))}
                                            <button onClick={() => {
                                                const newArr = [...(tempEditValue.sentencePatterns || []), { name: '', example: '' }];
                                                setTempEditValue({...tempEditValue, sentencePatterns: newArr});
                                            }} className="text-xs text-blue-400 flex items-center hover:text-white px-2 py-1 rounded hover:bg-slate-800 transition-colors w-fit"><Plus size={12} className="mr-1"/>新增句型</button>
                                        </div>

                                    <textarea className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-white text-xs h-16 focus:border-blue-500 outline-none" value={tempEditValue.deepDive} onChange={(e) => setTempEditValue({...tempEditValue, deepDive: e.target.value})} placeholder="深究提問" />

                                    <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-slate-700">
                                        <button onClick={cancelEdit} className="px-4 py-2 text-slate-400 hover:text-white bg-slate-800 rounded-lg text-sm">取消</button>
                                        <button onClick={saveEdit} className="px-4 py-2 text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg text-sm flex items-center shadow-lg"><Check size={16} className="mr-1"/> 儲存修改</button>
                                    </div>
                                </div>
                             ) : (
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <h4 className="text-emerald-300 font-bold text-sm mb-1">{item.title}</h4>
                                        
                                        {item.keywords && item.keywords.length > 0 && (
                                            <div className="flex flex-wrap gap-1 items-center mb-2">
                                                <Brain size={10} className="text-emerald-500"/>
                                                {item.keywords.map((kw, kwi) => <span key={kwi} className="text-[10px] bg-emerald-900/30 text-emerald-400 border border-emerald-900/50 px-2 py-0.5 rounded-full">{kw}</span>)}
                                            </div>
                                        )}

                                        <p className="text-xs text-slate-400 mb-2">{item.summary}</p>
                                        
                                        <div className="flex flex-wrap gap-2 mb-2">
                                            {item.difficultWords && item.difficultWords.length > 0 && item.difficultWords.map((w, wi) => (
                                                <span key={wi} className="text-[10px] bg-blue-900/30 text-blue-300 border border-blue-900/50 px-2 py-0.5 rounded-full flex items-center"><Sparkles size={8} className="mr-1 opacity-50"/>{w}</span>
                                            ))}
                                        </div>

                                        {/* Display Rhetorics */}
                                        {item.rhetorics && item.rhetorics.length > 0 && (
                                            <div className="flex flex-col gap-1 mt-2">
                                                {item.rhetorics.map((r, i) => {
                                                    const isGeneratingThis = generatingRhetoricGuidance === `${idx}-${i}`;
                                                    return (
                                                    <div key={i} className="text-xs group/rhetoric relative">
                                                        <div className="flex items-start justify-between">
                                                            <div>
                                                                <span className="text-emerald-400 font-bold bg-emerald-950/50 px-1 rounded mr-2">修辭: {r.name}</span>
                                                                <span className="text-slate-400 italic whitespace-pre-wrap">"{r.example}"</span>
                                                            </div>
                                                            <button 
                                                                onClick={() => handleGenerateRhetoricGuidanceClick(idx, i)}
                                                                disabled={isGeneratingThis || isEditingAny}
                                                                className={`ml-2 p-1 rounded hover:bg-slate-800 transition-colors ${isGeneratingThis ? 'text-emerald-400' : 'text-slate-600 hover:text-emerald-400 opacity-0 group-hover/rhetoric:opacity-100'}`}
                                                                title="AI 生成教學引導與微任務"
                                                            >
                                                                {isGeneratingThis ? <RefreshCw size={12} className="animate-spin" /> : <Sparkles size={12} />}
                                                            </button>
                                                        </div>
                                                    </div>
                                                )})}
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
                                        <button onClick={() => startEdit('segment', idx, item)} className="text-blue-400 hover:text-blue-300 p-1.5 hover:bg-slate-800 rounded"><Edit2 size={16} /></button>
                                        <button onClick={() => deleteItem('segments', idx)} className="text-red-400 hover:text-red-300 p-1.5 hover:bg-slate-800 rounded"><Trash2 size={16} /></button>
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

            {/* 2. Strategies Section */}
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

export default Step2DeepSegments;