import React, { useState, useEffect } from 'react';
import { Layout, Brain, Palette, Edit2, Trash2, Check, X, Plus, ChevronDown, ChevronUp, Save, AlertCircle, BookOpen, Quote, Sparkles, RefreshCw, Layers, Type, ArrowRight, Mic, VenetianMask, FileType, GraduationCap, Lightbulb, Box, PenTool, Zap, Wand2 } from 'lucide-react';
import { AnalysisData, VocabularyItem, SegmentItem, StrategyItem, ShapeSimilarItem } from '../types';

interface Step2StrategyProps {
  analysis: string; // The raw JSON string from Step 1
  onConfirmAnalysis: (refinedAnalysis: string) => void;
  isLoading: boolean;
  onRegenerateStrategies: (data: AnalysisData) => Promise<StrategyItem[]>;
  onGenerateSingleStrategy: (data: AnalysisData, existingStrategies: StrategyItem[]) => Promise<StrategyItem | null>;
  onGenerateMnemonic: (chars: ShapeSimilarItem[]) => Promise<string>;
}

const Step2Strategy: React.FC<Step2StrategyProps> = ({ analysis, onConfirmAnalysis, isLoading, onRegenerateStrategies, onGenerateSingleStrategy, onGenerateMnemonic }) => {
  const [data, setData] = useState<AnalysisData | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [isRegeneratingStrategies, setIsRegeneratingStrategies] = useState(false);
  const [isGeneratingSingleStrategy, setIsGeneratingSingleStrategy] = useState(false);
  const [regeneratingStrategyIndex, setRegeneratingStrategyIndex] = useState<number | null>(null);
  const [isGeneratingMnemonic, setIsGeneratingMnemonic] = useState(false);


  // Edit states for current editing item
  const [editingSection, setEditingSection] = useState<'basicInfo' | 'coreVocab' | 'idioms' | 'vocab' | 'segment' | 'strategy' | null>(null);
  const [editingIndex, setEditingIndex] = useState<number>(-1);
  const [tempEditValue, setTempEditValue] = useState<any>(null);

  useEffect(() => {
    try {
      // Attempt to clean markdown code blocks if present
      let cleanJson = analysis;
      if (cleanJson.includes('```json')) {
        cleanJson = cleanJson.replace(/```json/g, '').replace(/```/g, '');
      } else if (cleanJson.includes('```')) {
        cleanJson = cleanJson.replace(/```/g, '');
      }
      
      const parsed = JSON.parse(cleanJson);
      // Ensure arrays exist (backward compatibility)
      if (!parsed.coreVocabulary) parsed.coreVocabulary = [];
      if (!parsed.idioms) parsed.idioms = [];
      if (!parsed.vocabulary) parsed.vocabulary = [];
      if (!parsed.segments) parsed.segments = [];
      if (!parsed.strategies) parsed.strategies = [];
      if (!parsed.basicInfo) parsed.basicInfo = { genre: "未分類", grade: "未知", theme: "無", writingTechnique: "無" };
      else if (!parsed.basicInfo.writingTechnique) parsed.basicInfo.writingTechnique = "未知";
      
      // Patch segments to include keywords/difficultWords if missing
      // Also patch migration from single rhetoric/pattern to arrays
      parsed.segments.forEach((seg: any) => {
          if (!seg.keywords) seg.keywords = [];
          if (!seg.difficultWords) seg.difficultWords = [];
          
          // Migration logic: convert legacy single fields to array if array is missing
          if (!seg.rhetorics) {
              seg.rhetorics = [];
              if (seg.rhetoric && seg.rhetoricExample) {
                  seg.rhetorics.push({ name: seg.rhetoric, example: seg.rhetoricExample });
              }
          }
          if (!seg.sentencePatterns) {
              seg.sentencePatterns = [];
              if (seg.sentencePattern && seg.sentenceExample) {
                  seg.sentencePatterns.push({ name: seg.sentencePattern, example: seg.sentenceExample });
              }
          }
      });

      // Backward compatibility check for strategies: if string[], convert to StrategyItem[]
      if (parsed.strategies.length > 0 && typeof parsed.strategies[0] === 'string') {
        parsed.strategies = parsed.strategies.map((s: string) => ({
            type: 'General',
            title: "舊版策略格式",
            teachingPoint: s,
            application: "請重新編輯"
        }));
      }

      setData(parsed);
      setParseError(null);
    } catch (e) {
      console.error("JSON Parse Error", e);
      setParseError("無法解析 AI 回傳的資料結構。顯示原始文字模式。");
    }
  }, [analysis]);

  const handleConfirm = () => {
    // Send the (potentially modified) data back as a string to serve as context for the next step
    const refinedAnalysisString = JSON.stringify(data, null, 2);
    onConfirmAnalysis(refinedAnalysisString);
  };

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

  const handleGenerateSingleStrategyClick = async () => {
    if (!data) return;
    setIsGeneratingSingleStrategy(true);
    try {
        const newStrategy = await onGenerateSingleStrategy(data, data.strategies);
        if (newStrategy) {
             setData(prev => prev ? ({ ...prev, strategies: [...prev.strategies, newStrategy] }) : null);
        }
    } catch (error) {
        console.error("Single Strategy Generation failed", error);
        alert("AI 發想單點策略失敗，請稍後再試。");
    } finally {
        setIsGeneratingSingleStrategy(false);
    }
  };

  const handleRefreshSpecificStrategy = async (index: number) => {
      if (!data) return;
      setRegeneratingStrategyIndex(index);
      try {
          // We filter out the *current* one from the context list so the AI knows to replace it with something different
          const otherStrategies = data.strategies.filter((_, i) => i !== index);
          const newStrategy = await onGenerateSingleStrategy(data, otherStrategies);
          if (newStrategy) {
              const newStrategies = [...data.strategies];
              newStrategies[index] = newStrategy;
              setData(prev => prev ? ({ ...prev, strategies: newStrategies }) : null);
          }
      } catch (error) {
           console.error("Specific Strategy Regeneration failed", error);
      } finally {
          setRegeneratingStrategyIndex(null);
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

  const startEdit = (section: 'basicInfo' | 'coreVocab' | 'idioms' | 'vocab' | 'segment' | 'strategy', index: number, item: any) => {
    setEditingSection(section);
    setEditingIndex(index);
    // Deep copy the item
    const copy = JSON.parse(JSON.stringify(item));
    
    // Prepare editing state for fields that need special handling (e.g. arrays to string)
    if (section === 'segment') {
        copy._keywordsStr = copy.keywords ? copy.keywords.join(' ') : '';
        copy._diffWordsStr = copy.difficultWords ? copy.difficultWords.join(' ') : '';
    }
    
    setTempEditValue(copy);
  };

  const addNewVocabItem = () => {
      if (!data) return;
      // Default structure for new item
      const newItem: VocabularyItem = { 
        word: '新字', 
        type: '形近字',
        zhuyin: '',
        shapeSimilar: [{ char: '新', radical: '部首', words: '造詞', explanation: '解釋' }],
        mnemonic: '口訣'
      };
      const newData = { ...data };
      newData.vocabulary.push(newItem);
      setData(newData);
      // Automatically start editing the new item
      startEdit('vocab', newData.vocabulary.length - 1, newItem);
  };

  const addNewSegmentItem = () => {
    if (!data) return;
    const newItem: SegmentItem = {
        title: "新段落",
        summary: "段落大意",
        keywords: [],
        difficultWords: [],
        rhetorics: [],
        sentencePatterns: [],
        deepDive: ""
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
       // Convert strings back to array
       const keywordsArr = tempEditValue._keywordsStr 
            ? tempEditValue._keywordsStr.split(/[,，\s]+/).filter((w: string) => w.trim().length > 0)
            : [];
       const diffWordsArr = tempEditValue._diffWordsStr 
            ? tempEditValue._diffWordsStr.split(/[,，\s]+/).filter((w: string) => w.trim().length > 0)
            : [];
       
       const segmentToSave = { ...tempEditValue, keywords: keywordsArr, difficultWords: diffWordsArr };
       delete segmentToSave._keywordsStr; 
       delete segmentToSave._diffWordsStr;
       
       newData.segments[editingIndex] = segmentToSave;

    } else if (editingSection === 'strategy') {
      newData.strategies[editingIndex] = tempEditValue;
    } else if (editingSection === 'coreVocab') {
      const words = tempEditValue.split(/[,，\s]+/).filter((w: string) => w.trim().length > 0);
      newData.coreVocabulary = words;
    } else if (editingSection === 'idioms') {
      const words = tempEditValue.split(/[,，\s]+/).filter((w: string) => w.trim().length > 0);
      newData.idioms = words;
    } else if (editingSection === 'basicInfo') {
        newData.basicInfo = tempEditValue;
    }
    
    setData(newData);
    cancelEdit();
  };

  const cancelEdit = () => {
    setEditingSection(null);
    setEditingIndex(-1);
    setTempEditValue(null);
  };

  // --- Vocabulary Editor Renderer ---
  const renderVocabEditor = () => {
    if (!tempEditValue) return null;
    const type = tempEditValue.type;

    return (
        <div className="space-y-3 bg-slate-900/50 p-2 rounded">
             {/* Common Header */}
             <div className="flex gap-2">
                <input 
                    className="bg-slate-950 border border-slate-700 rounded p-1 text-white text-sm w-1/4"
                    value={tempEditValue.word}
                    onChange={(e) => setTempEditValue({...tempEditValue, word: e.target.value})}
                    placeholder="字"
                />
                <input 
                    className="bg-slate-950 border border-slate-700 rounded p-1 text-white text-sm w-1/4"
                    value={tempEditValue.zhuyin || ''}
                    onChange={(e) => setTempEditValue({...tempEditValue, zhuyin: e.target.value})}
                    placeholder="注音"
                />
                <select 
                    className="bg-slate-950 border border-slate-700 rounded p-1 text-white text-sm flex-1"
                    value={tempEditValue.type}
                    onChange={(e) => setTempEditValue({...tempEditValue, type: e.target.value})}
                >
                    <option value="形近字">形近字</option>
                    <option value="多音字">多音字</option>
                    <option value="成語">成語</option>
                </select>
            </div>

            {/* Structured Fields based on Type */}
            {type === '形近字' && (
                <div className="space-y-2">
                    <label className="text-xs text-slate-500 uppercase">形近字辨析 (新增辨析項目以啟用 AI 生成)</label>
                    {(tempEditValue.shapeSimilar || []).map((item: any, i: number) => (
                        <div key={i} className="flex gap-1">
                            <input className="w-12 bg-slate-950 border border-slate-700 rounded p-1 text-xs text-white" value={item.char} onChange={(e) => {
                                const newArr = [...tempEditValue.shapeSimilar]; newArr[i].char = e.target.value; setTempEditValue({...tempEditValue, shapeSimilar: newArr});
                            }} placeholder="字" />
                             <input className="w-16 bg-slate-950 border border-slate-700 rounded p-1 text-xs text-white" value={item.radical} onChange={(e) => {
                                const newArr = [...tempEditValue.shapeSimilar]; newArr[i].radical = e.target.value; setTempEditValue({...tempEditValue, shapeSimilar: newArr});
                            }} placeholder="部首" />
                             <input className="flex-1 bg-slate-950 border border-slate-700 rounded p-1 text-xs text-white" value={item.words} onChange={(e) => {
                                const newArr = [...tempEditValue.shapeSimilar]; newArr[i].words = e.target.value; setTempEditValue({...tempEditValue, shapeSimilar: newArr});
                            }} placeholder="造詞" />
                             <input className="flex-1 bg-slate-950 border border-slate-700 rounded p-1 text-xs text-slate-400" value={item.explanation} onChange={(e) => {
                                const newArr = [...tempEditValue.shapeSimilar]; newArr[i].explanation = e.target.value; setTempEditValue({...tempEditValue, shapeSimilar: newArr});
                            }} placeholder="解釋部首差異" />
                        </div>
                    ))}
                    <button onClick={() => {
                         const newArr = [...(tempEditValue.shapeSimilar || []), { char: '', radical: '', words: '', explanation: '' }];
                         setTempEditValue({...tempEditValue, shapeSimilar: newArr});
                    }} className="text-xs text-blue-400 flex items-center"><Plus size={10} className="mr-1"/>新增辨析</button>

                    <div className="flex items-center justify-between mt-2">
                        <label className="text-xs text-slate-500 uppercase">辨析筆記 (Mnemonic)</label>
                        <button 
                            onClick={handleGenMnemonic} 
                            disabled={isGeneratingMnemonic || !tempEditValue.shapeSimilar || tempEditValue.shapeSimilar.length < 1}
                            className={`text-[10px] flex items-center px-2 py-1 rounded border transition-colors ${
                                isGeneratingMnemonic || !tempEditValue.shapeSimilar || tempEditValue.shapeSimilar.length < 1
                                ? 'bg-slate-800 text-slate-600 border-slate-800 cursor-not-allowed'
                                : 'bg-emerald-900/30 text-emerald-400 border-emerald-900 hover:bg-emerald-900/50'
                            }`}
                        >
                            {isGeneratingMnemonic ? <RefreshCw size={10} className="animate-spin mr-1"/> : <Wand2 size={10} className="mr-1"/>}
                            AI 生成口訣
                        </button>
                    </div>
                    <textarea 
                        className="w-full bg-slate-950 border border-slate-700 rounded p-1 text-xs text-emerald-300 h-12"
                        value={tempEditValue.mnemonic || ''}
                        onChange={(e) => setTempEditValue({...tempEditValue, mnemonic: e.target.value})}
                        placeholder="請輸入或點擊上方 AI 生成按鈕..."
                    />
                </div>
            )}

            {type === '多音字' && (
                <div className="space-y-2">
                    <label className="text-xs text-slate-500 uppercase">讀音辨析</label>
                    {(tempEditValue.polyphonic || []).map((item: any, i: number) => (
                         <div key={i} className="flex gap-1">
                            <input className="w-20 bg-slate-950 border border-slate-700 rounded p-1 text-xs text-white" value={item.zhuyin} onChange={(e) => {
                                const newArr = [...tempEditValue.polyphonic]; newArr[i].zhuyin = e.target.value; setTempEditValue({...tempEditValue, polyphonic: newArr});
                            }} placeholder="注音" />
                             <input className="w-24 bg-slate-950 border border-slate-700 rounded p-1 text-xs text-white" value={item.words} onChange={(e) => {
                                const newArr = [...tempEditValue.polyphonic]; newArr[i].words = e.target.value; setTempEditValue({...tempEditValue, polyphonic: newArr});
                            }} placeholder="詞語" />
                             <input className="flex-1 bg-slate-950 border border-slate-700 rounded p-1 text-xs text-slate-400" value={item.usage} onChange={(e) => {
                                const newArr = [...tempEditValue.polyphonic]; newArr[i].usage = e.target.value; setTempEditValue({...tempEditValue, polyphonic: newArr});
                            }} placeholder="語境/用法" />
                        </div>
                    ))}
                    <button onClick={() => {
                         const newArr = [...(tempEditValue.polyphonic || []), { zhuyin: '', words: '', usage: '' }];
                         setTempEditValue({...tempEditValue, polyphonic: newArr});
                    }} className="text-xs text-blue-400 flex items-center"><Plus size={10} className="mr-1"/>新增讀音</button>
                </div>
            )}

            {type === '成語' && (
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

            {/* Fallback for generic text details */}
            {!['形近字', '多音字', '成語'].includes(type) && (
                 <textarea 
                    className="bg-slate-950 border border-slate-700 rounded p-1 text-white text-sm w-full h-24"
                    value={tempEditValue.details || ''}
                    onChange={(e) => setTempEditValue({...tempEditValue, details: e.target.value})}
                    placeholder="請輸入詳細內容..."
                />
            )}

            <div className="flex justify-end gap-2 mt-2">
                <button onClick={cancelEdit} className="p-1 text-slate-400 hover:text-white"><X size={18} /></button>
                <button onClick={saveEdit} className="p-1 text-emerald-400 hover:text-emerald-300"><Check size={18} /></button>
            </div>
        </div>
    );
  };

  // --- Vocabulary Item Renderer ---
  const renderVocabItem = (item: VocabularyItem, idx: number) => {
    return (
        <div key={idx} className="p-4 hover:bg-slate-800/30 transition-colors group">
            {editingSection === 'vocab' && editingIndex === idx ? (
                renderVocabEditor()
            ) : (
                <div className="flex justify-between items-start">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-amber-400 font-bold text-lg">{item.word}</span>
                            {item.zhuyin && <span className="text-sm text-slate-400 font-mono">({item.zhuyin})</span>}
                            <span className={`text-xs px-1.5 py-0.5 rounded ${
                                item.type === '成語' ? 'bg-purple-900/30 text-purple-300' : 
                                item.type === '多音字' ? 'bg-indigo-900/30 text-indigo-300' :
                                'bg-slate-800 text-slate-400'
                            }`}>
                                {item.type}
                            </span>
                        </div>

                        {/* Structured Data Display */}
                        {item.type === '形近字' && item.shapeSimilar && (
                            <div className="text-sm text-slate-300 space-y-2 pl-2 border-l-2 border-slate-700">
                                {item.shapeSimilar.map((sim, i) => (
                                    <div key={i} className="grid grid-cols-[auto_1fr] gap-2">
                                        <div className="font-bold text-slate-200">
                                            {sim.char} <span className="text-slate-500 font-normal text-xs">({sim.radical})</span>
                                        </div>
                                        <div>
                                            <span className="text-emerald-300">{sim.words}</span>
                                            {sim.explanation && <span className="text-slate-500 text-xs ml-2">({sim.explanation})</span>}
                                        </div>
                                    </div>
                                ))}
                                {item.mnemonic && (
                                    <div className="mt-2 text-xs text-blue-300 bg-blue-900/10 p-1.5 rounded inline-block">
                                        <span className="font-bold mr-1">💡 辨析筆記:</span> {item.mnemonic}
                                    </div>
                                )}
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
                        
                        {/* Fallback Display */}
                        {!['形近字', '多音字', '成語'].includes(item.type) && item.details && (
                             <div className="text-sm text-slate-300 whitespace-pre-wrap pl-2 border-l-2 border-slate-800">{item.details}</div>
                        )}
                         {/* Fallback for backward compatibility */}
                        {['形近字', '多音字', '成語'].includes(item.type) && !item.shapeSimilar && !item.polyphonic && !item.idiom && item.details && (
                             <div className="text-sm text-slate-300 whitespace-pre-wrap pl-2 border-l-2 border-slate-800">{item.details}</div>
                        )}

                    </div>
                    <div className={`flex gap-2 transition-opacity ${isEditingAny ? 'opacity-0 pointer-events-none' : 'opacity-0 group-hover:opacity-100'}`}>
                        <button onClick={() => startEdit('vocab', idx, item)} className="text-blue-400 hover:text-blue-300 p-1"><Edit2 size={14} /></button>
                        <button onClick={() => deleteItem('vocab', idx)} className="text-red-400 hover:text-red-300 p-1"><Trash2 size={14} /></button>
                    </div>
                </div>
            )}
        </div>
    );
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
                           <div className={`px-2 py-1 rounded border ${isDrama ? 'bg-pink-950 border-pink-800 text-pink-400' : 'bg-cyan-950 border-cyan-800 text-cyan-400'}`}>
                              角色配置：{isDrama ? '雙人舞 (主角 + 引導者)' : '獨角戲 (僅引導者)'}
                           </div>
                      </div>
                  </div>
              </div>
              
              {/* Basic Info & Visual Recommendation Card */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Basic Info */}
                  <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                     <div className="flex justify-between items-start mb-2">
                        <h4 className="text-sm font-bold text-slate-300 flex items-center">
                            <BookOpen size={14} className="mr-2 text-blue-400"/> 基本資訊
                        </h4>
                        {editingSection !== 'basicInfo' && (
                            <button onClick={() => startEdit('basicInfo', 0, data.basicInfo)} disabled={isEditingAny} className="text-xs text-slate-500 hover:text-blue-400"><Edit2 size={12}/></button>
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
                          (將於 Step 3 提供具體選項)
                      </p>
                  </div>
              </div>
          </div>
      );
  };

  // --- Render Helpers ---

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
        <button
             onClick={() => handleConfirm()} // Fallback
             className="bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
             忽略錯誤並繼續
        </button>
      </div>
    );
  }

  const isEditingAny = editingSection !== null;

  return (
    <div className="flex flex-col h-full relative">
      
      {/* --- SCROLLABLE CONTENT AREA --- */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pb-32 px-1">
        <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
            
            {/* Header */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white flex items-center">
                        <span className="bg-emerald-600 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">2</span>
                        內容定錨：審核與修訂 (Review)
                    </h2>
                </div>
                
                <p className="text-slate-400 text-sm">
                    AI 已完成「V-MAX 7點分析法」。請檢視教學模式、基本資訊與語文素材。
                </p>
            </div>

            {/* Mode & Basic Info Cards */}
            {renderModeBadge()}

            {/* 1. Vocabulary Section */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
                {/* Header */}
                <div className="bg-slate-800/80 px-4 py-2 border-b border-slate-700 flex justify-between items-center">
                    <h3 className="font-bold text-slate-200 text-sm">語文輻射 (生字/成語/形近辨析)</h3>
                    <span className="text-xs text-slate-500">{data.vocabulary.length} 項目</span>
                </div>
                {/* Core & Idioms */}
                <div className="bg-slate-900/80 p-4 border-b border-slate-800/50 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Core Vocab */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-blue-400 flex items-center">
                                <BookOpen size={12} className="mr-1"/> 核心生字鎖定 (10-20個)
                            </span>
                            {editingSection !== 'coreVocab' && (
                                <button 
                                    onClick={() => startEdit('coreVocab', 0, data.coreVocabulary.join(' '))} 
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
                    </div>
                    {/* Idioms */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-purple-400 flex items-center">
                                <Quote size={12} className="mr-1"/> 延伸成語
                            </span>
                            {editingSection !== 'idioms' && (
                                <button 
                                    onClick={() => startEdit('idioms', 0, data.idioms.join(' '))} 
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
                    </div>
                </div>
                {/* List */}
                <div className="divide-y divide-slate-800">
                    {data.vocabulary.map((item, idx) => renderVocabItem(item, idx))}
                </div>
                <div className="p-2 bg-slate-900 border-t border-slate-800 flex justify-center">
                    <button onClick={addNewVocabItem} disabled={isEditingAny} className={`flex items-center gap-2 text-xs py-1 px-4 rounded transition-colors w-full justify-center ${isEditingAny ? 'text-slate-600 cursor-not-allowed' : 'text-slate-400 hover:text-emerald-400 hover:bg-slate-800'}`}>
                        <Plus size={14} /> 新增詳細項目
                    </button>
                </div>
            </div>

            {/* 2. Segments Section */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
                <div className="bg-slate-800/80 px-4 py-2 border-b border-slate-700 flex justify-between items-center">
                    <h3 className="font-bold text-slate-200 text-sm">意義段分析 (Logical Segments)</h3>
                    <span className="text-xs text-slate-500">{data.segments.length} 段落</span>
                </div>
                <div className="divide-y divide-slate-800">
                    {data.segments.map((item, idx) => (
                        <div key={idx} className="p-4 hover:bg-slate-800/30 transition-colors group">
                             {/* ... (Keep existing segment editing logic) ... */}
                             {editingSection === 'segment' && editingIndex === idx ? (
                                <div className="space-y-3 bg-slate-800/20 p-3 rounded-lg border border-slate-700">
                                    <input className="bg-slate-950 border border-slate-700 rounded p-1 text-white text-sm w-full font-bold" value={tempEditValue.title} onChange={(e) => setTempEditValue({...tempEditValue, title: e.target.value})} placeholder="段落標題" />
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <label className="text-xs text-slate-500 uppercase flex items-center"><Brain size={10} className="mr-1" />心智圖關鍵字 (Keywords)</label>
                                            <input className="bg-slate-950 border border-slate-700 rounded p-1 text-emerald-300 text-sm w-full" value={tempEditValue._keywordsStr} onChange={(e) => setTempEditValue({...tempEditValue, _keywordsStr: e.target.value})} />
                                        </div>
                                         <div className="space-y-1">
                                            <label className="text-xs text-slate-500 uppercase flex items-center"><Sparkles size={10} className="mr-1" />段落難詞 (Difficult Words)</label>
                                            <input className="bg-slate-950 border border-slate-700 rounded p-1 text-blue-300 text-sm w-full" value={tempEditValue._diffWordsStr} onChange={(e) => setTempEditValue({...tempEditValue, _diffWordsStr: e.target.value})} />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <textarea className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white text-xs h-24" value={tempEditValue.summary} onChange={(e) => setTempEditValue({...tempEditValue, summary: e.target.value})} placeholder="大意" />
                                        <textarea className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white text-xs h-24" value={tempEditValue.deepDive} onChange={(e) => setTempEditValue({...tempEditValue, deepDive: e.target.value})} placeholder="深究提問" />
                                    </div>
                                    
                                    {/* Rhetoric & Sentence Pattern Editor */}
                                    <div className="space-y-2 pt-2 border-t border-slate-700/50">
                                        {/* Rhetoric Array Editor */}
                                        <div className="space-y-1">
                                            <label className="text-xs text-slate-500 uppercase">修辭技巧 (Rhetoric)</label>
                                            {(tempEditValue.rhetorics || []).map((r: any, i: number) => (
                                                <div key={i} className="flex gap-1 mb-1">
                                                    <input className="w-1/3 bg-slate-950 border border-slate-700 rounded p-1 text-white text-xs" value={r.name} onChange={(e) => {
                                                        const newArr = [...tempEditValue.rhetorics]; newArr[i].name = e.target.value; setTempEditValue({...tempEditValue, rhetorics: newArr});
                                                    }} placeholder="名稱 (譬喻)" />
                                                    <input className="flex-1 bg-slate-950 border border-slate-700 rounded p-1 text-slate-300 text-xs" value={r.example} onChange={(e) => {
                                                        const newArr = [...tempEditValue.rhetorics]; newArr[i].example = e.target.value; setTempEditValue({...tempEditValue, rhetorics: newArr});
                                                    }} placeholder="例句" />
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
                                                    <input className="w-1/3 bg-slate-950 border border-slate-700 rounded p-1 text-white text-xs" value={p.name} onChange={(e) => {
                                                        const newArr = [...tempEditValue.sentencePatterns]; newArr[i].name = e.target.value; setTempEditValue({...tempEditValue, sentencePatterns: newArr});
                                                    }} placeholder="名稱 (不但...而且)" />
                                                    <input className="flex-1 bg-slate-950 border border-slate-700 rounded p-1 text-slate-300 text-xs" value={p.example} onChange={(e) => {
                                                        const newArr = [...tempEditValue.sentencePatterns]; newArr[i].example = e.target.value; setTempEditValue({...tempEditValue, sentencePatterns: newArr});
                                                    }} placeholder="例句" />
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
                                        <div className="flex flex-wrap gap-4 mb-2">
                                            {item.keywords && item.keywords.length > 0 && (
                                                <div className="flex flex-wrap gap-1 items-center">
                                                    <Brain size={10} className="text-emerald-500"/>
                                                    {item.keywords.map((kw, kwi) => <span key={kwi} className="text-[10px] bg-emerald-900/30 text-emerald-400 border border-emerald-900/50 px-1.5 py-0.5 rounded">{kw}</span>)}
                                                </div>
                                            )}
                                             {item.difficultWords && item.difficultWords.length > 0 && (
                                                <div className="flex flex-wrap gap-1 items-center">
                                                    <Sparkles size={10} className="text-blue-500"/>
                                                    {item.difficultWords.map((kw, kwi) => <span key={kwi} className="text-[10px] bg-blue-900/30 text-blue-400 border border-blue-900/50 px-1.5 py-0.5 rounded">{kw}</span>)}
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-400 mb-2">{item.summary}</p>
                                        
                                        {/* New Rhetoric/Pattern Display */}
                                        <div className="mt-2 space-y-2">
                                            {item.rhetorics && item.rhetorics.length > 0 && (
                                                <div className="flex flex-col gap-1">
                                                    {item.rhetorics.map((r, i) => (
                                                        <div key={i} className="text-xs">
                                                            <span className="text-emerald-400 font-bold bg-emerald-950/50 px-1 rounded mr-2">修辭: {r.name}</span>
                                                            <span className="text-slate-400 italic">"{r.example}"</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            {item.sentencePatterns && item.sentencePatterns.length > 0 && (
                                                <div className="flex flex-col gap-1">
                                                    {item.sentencePatterns.map((p, i) => (
                                                        <div key={i} className="text-xs">
                                                            <span className="text-amber-400 font-bold bg-amber-950/50 px-1 rounded mr-2">句型: {p.name}</span>
                                                            <span className="text-slate-400 italic">"{p.example}"</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            
                                            {/* Legacy fallback display if arrays are empty but legacy fields exist */}
                                            {(!item.rhetorics?.length && (item as any).rhetoric) && (
                                                 <div className="text-xs"><span className="text-emerald-400 font-bold bg-emerald-950/50 px-1 rounded mr-2">修辭: {(item as any).rhetoric}</span><span className="text-slate-400 italic">"{(item as any).rhetoricExample}"</span></div>
                                            )}
                                            {(!item.sentencePatterns?.length && (item as any).sentencePattern) && (
                                                 <div className="text-xs"><span className="text-amber-400 font-bold bg-amber-950/50 px-1 rounded mr-2">句型: {(item as any).sentencePattern}</span><span className="text-slate-400 italic">"{(item as any).sentenceExample}"</span></div>
                                            )}
                                        </div>
                                        
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
                {/* Add Segment Button */}
                <div className="p-2 bg-slate-900 border-t border-slate-800 flex justify-center">
                    <button onClick={addNewSegmentItem} disabled={isEditingAny} className={`flex items-center gap-2 text-xs py-1 px-4 rounded transition-colors w-full justify-center ${isEditingAny ? 'text-slate-600 cursor-not-allowed' : 'text-slate-400 hover:text-emerald-400 hover:bg-slate-800'}`}>
                        <Plus size={14} /> 新增段落 (殘補)
                    </button>
                </div>
            </div>

            {/* 3. Strategies Section */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden relative">
                {isRegeneratingStrategies && (
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center animate-in fade-in duration-200">
                        <RefreshCw className="text-blue-400 animate-spin mb-3" size={24} />
                        <p className="text-blue-200 text-sm font-bold tracking-widest animate-pulse">AI 正在激盪新策略...</p>
                    </div>
                )}
                <div className="bg-slate-800/80 px-4 py-2 border-b border-slate-700 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-200 text-sm">語文百寶箱 (Treasure Chest)</h3>
                        <span className="text-xs text-slate-500">{data.strategies.length} 策略</span>
                    </div>
                    <button onClick={handleRegenerateStrategiesClick} disabled={isRegeneratingStrategies || isEditingAny || isGeneratingSingleStrategy} className={`text-xs flex items-center gap-1 px-3 py-1.5 rounded-full transition-all border ${isRegeneratingStrategies || isEditingAny || isGeneratingSingleStrategy ? 'bg-slate-800 text-slate-600 cursor-not-allowed' : 'bg-blue-900/20 text-blue-400 border-blue-900/50 hover:bg-blue-900/40'}`}>
                        <RefreshCw size={12} className={isRegeneratingStrategies ? "animate-spin" : ""} /> 全部重新發想
                    </button>
                </div>
                <div className="divide-y divide-slate-800 min-h-[120px]">
                    {data.strategies.length === 0 && !isRegeneratingStrategies && <div className="p-8 text-center text-slate-500 text-sm italic">尚無策略，請點擊重新發想</div>}
                    {data.strategies.map((item, idx) => (
                        <div key={idx} className="p-4 hover:bg-slate-800/30 transition-colors group relative">
                             {/* Specific Item Loading Overlay */}
                             {regeneratingStrategyIndex === idx && (
                                <div className="absolute inset-0 bg-slate-900/80 z-10 flex items-center justify-center">
                                    <RefreshCw className="text-emerald-400 animate-spin mr-2" size={16} />
                                    <span className="text-xs text-emerald-300">更新中...</span>
                                </div>
                             )}

                             {editingSection === 'strategy' && editingIndex === idx ? (
                                <div className="flex flex-col gap-3">
                                    <div className="flex gap-2">
                                        <select 
                                            className="bg-slate-950 border border-slate-700 rounded p-1.5 text-white text-sm w-1/3"
                                            value={tempEditValue.type || 'Rhetoric'}
                                            onChange={(e) => setTempEditValue({...tempEditValue, type: e.target.value})}
                                        >
                                            <option value="Rhetoric">🔮 Rhetoric (修辭)</option>
                                            <option value="Thinking">🧠 Thinking (思考)</option>
                                            <option value="Task">⚡ Task (任務)</option>
                                        </select>
                                        <input className="bg-slate-950 border border-slate-700 rounded p-1.5 text-white text-sm font-bold flex-1" value={tempEditValue.title} onChange={(e) => setTempEditValue({...tempEditValue, title: e.target.value})} placeholder="工具命名 (Label)" />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <textarea className="bg-slate-950 border border-slate-700 rounded p-2 text-white text-xs w-full h-20" value={tempEditValue.teachingPoint} onChange={(e) => setTempEditValue({...tempEditValue, teachingPoint: e.target.value})} placeholder="邏輯解析 (Insight)" />
                                        <textarea className="bg-slate-950 border border-slate-700 rounded p-2 text-white text-xs w-full h-20" value={tempEditValue.application} onChange={(e) => setTempEditValue({...tempEditValue, application: e.target.value})} placeholder="互動任務 (Interaction)" />
                                    </div>
                                    <div className="flex justify-end gap-2 mt-1">
                                        <button onClick={cancelEdit} className="p-1 text-slate-400 hover:text-white"><X size={18} /></button>
                                        <button onClick={saveEdit} className="p-1 text-emerald-400 hover:text-emerald-300"><Check size={18} /></button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            {/* Icon Logic based on Type */}
                                            {item.type === 'Rhetoric' ? (
                                                 <div className="bg-purple-900/30 p-1.5 rounded-lg text-purple-400"><Wand2 size={16} /></div>
                                            ) : item.type === 'Thinking' ? (
                                                 <div className="bg-blue-900/30 p-1.5 rounded-lg text-blue-400"><Brain size={16} /></div>
                                            ) : item.type === 'Task' ? (
                                                 <div className="bg-amber-900/30 p-1.5 rounded-lg text-amber-400"><Zap size={16} /></div>
                                            ) : (
                                                 <div className="bg-slate-800 p-1.5 rounded-lg text-slate-400"><Layers size={16} /></div>
                                            )}
                                            
                                            <h4 className="text-white font-bold text-sm">{item.title}</h4>
                                            
                                            {/* Type Badge */}
                                            {item.type && (
                                                <span className={`text-[10px] px-1.5 py-0.5 rounded border ${
                                                    item.type === 'Rhetoric' ? 'border-purple-900 text-purple-400 bg-purple-900/10' :
                                                    item.type === 'Thinking' ? 'border-blue-900 text-blue-400 bg-blue-900/10' :
                                                    item.type === 'Task' ? 'border-amber-900 text-amber-400 bg-amber-900/10' :
                                                    'border-slate-800 text-slate-500'
                                                }`}>
                                                    {item.type}
                                                </span>
                                            )}
                                        </div>
                                        <div className="pl-9 space-y-2">
                                            <div className="text-xs"><span className="text-blue-400 font-bold mr-1">[邏輯]:</span><span className="text-slate-300">{item.teachingPoint}</span></div>
                                            <div className="text-xs"><span className="text-emerald-400 font-bold mr-1">[任務]:</span><span className="text-slate-300">{item.application}</span></div>
                                        </div>
                                    </div>
                                    <div className={`flex gap-1 transition-opacity ${isEditingAny ? 'opacity-0 pointer-events-none' : 'opacity-0 group-hover:opacity-100'}`}>
                                        <button 
                                            onClick={() => handleRefreshSpecificStrategy(idx)} 
                                            className="text-emerald-400 hover:text-emerald-300 p-1"
                                            title="AI 重新生成此策略"
                                            disabled={isGeneratingSingleStrategy}
                                        >
                                            <RefreshCw size={14} />
                                        </button>
                                        <button onClick={() => startEdit('strategy', idx, item)} className="text-blue-400 hover:text-blue-300 p-1"><Edit2 size={14} /></button>
                                        <button onClick={() => deleteItem('strategies', idx)} className="text-red-400 hover:text-red-300 p-1"><Trash2 size={14} /></button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                 {/* Add Strategy Button */}
                <div className="p-2 bg-slate-900 border-t border-slate-800 flex justify-center">
                    <button 
                        onClick={handleGenerateSingleStrategyClick} 
                        disabled={isEditingAny || isRegeneratingStrategies || isGeneratingSingleStrategy} 
                        className={`flex items-center gap-2 text-xs py-1 px-4 rounded transition-colors w-full justify-center ${
                            isEditingAny || isRegeneratingStrategies || isGeneratingSingleStrategy 
                            ? 'text-slate-600 cursor-not-allowed' 
                            : 'text-slate-400 hover:text-emerald-400 hover:bg-slate-800'
                        }`}
                    >
                        {isGeneratingSingleStrategy ? (
                            <RefreshCw size={14} className="animate-spin" />
                        ) : (
                            <Plus size={14} />
                        )}
                        {isGeneratingSingleStrategy ? "AI 發想中..." : "✨ AI 靈感 (+1) (新增策略)"}
                    </button>
                </div>
            </div>
        </div>
      </div>

      {/* --- CONFIRM BUTTON (STICKY FOOTER) --- */}
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
                    <>
                        <RefreshCw className="mr-2 animate-spin" size={20} />
                        正在生成形式與風格建議...
                    </>
                ) : isEditingAny ? (
                    <>
                        <AlertCircle className="mr-2" size={18} />
                        請先儲存正在編輯的項目
                    </>
                ) : (
                    <>
                        <Check className="mr-2" size={20} />
                        確認無誤，前往形式與風格
                        <ArrowRight className="ml-2" size={20} />
                    </>
                )}
             </button>
      </div>
    </div>
  );
};

export default Step2Strategy;