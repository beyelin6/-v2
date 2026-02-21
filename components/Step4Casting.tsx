import React, { useState, useEffect } from 'react';
import { User, Users, Table, Check, AlertCircle, Play, Info, Edit2, X, Save, Plus, ArrowLeft } from 'lucide-react';
import { CastingData, GuideCandidate } from '../types';
import ReactMarkdown from 'react-markdown';

interface Step4CastingProps {
  castingResult: string;
  onConfirmCasting: (protagonistTraits: string, guide: GuideCandidate) => void;
  isLoading: boolean;
  onBack: () => void;
}

const TONE_OPTIONS = [
  { code: 'G1', label: '溫暖', desc: '關懷/陪伴', color: 'border-pink-500/50 text-pink-300 bg-pink-500/10 hover:bg-pink-500/20' },
  { code: 'G2', label: '邏輯', desc: '推理/分析', color: 'border-blue-500/50 text-blue-300 bg-blue-500/10 hover:bg-blue-500/20' },
  { code: 'G3', label: '知識', desc: '百科/權威', color: 'border-emerald-500/50 text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20' },
  { code: 'G4', label: '魔法', desc: '想像/奇幻', color: 'border-purple-500/50 text-purple-300 bg-purple-500/10 hover:bg-purple-500/20' },
  { code: 'G5', label: '任務', desc: '指令/目標', color: 'border-amber-500/50 text-amber-300 bg-amber-500/10 hover:bg-amber-500/20' },
  { code: 'G6', label: '熱血', desc: '激勵/挑戰', color: 'border-red-500/50 text-red-300 bg-red-500/10 hover:bg-red-500/20' },
];

const Step4Casting: React.FC<Step4CastingProps> = ({ castingResult, onConfirmCasting, isLoading, onBack }) => {
  const [data, setData] = useState<CastingData | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [protagonistTraits, setProtagonistTraits] = useState("");
  const [protagonistGender, setProtagonistGender] = useState("");
  const [protagonistAge, setProtagonistAge] = useState("");
  const [protagonistName, setProtagonistName] = useState("");
  const [selectedGuide, setSelectedGuide] = useState<GuideCandidate | null>(null);

  // Guide Editing State
  const [editingGuideIndex, setEditingGuideIndex] = useState<number | null>(null);
  const [tempGuide, setTempGuide] = useState<GuideCandidate | null>(null);

  useEffect(() => {
    try {
      let cleanJson = castingResult;
      if (cleanJson.includes('```json')) {
        cleanJson = cleanJson.replace(/```json/g, '').replace(/```/g, '');
      } else if (cleanJson.includes('```')) {
        cleanJson = cleanJson.replace(/```/g, '');
      }
      const parsed = JSON.parse(cleanJson);
      setData(parsed);
      setProtagonistTraits(parsed.protagonist.traits);
      setProtagonistGender(parsed.protagonist.gender || "");
      setProtagonistAge(parsed.protagonist.age || "");
      setProtagonistName(parsed.protagonist.name || "");
    } catch (e) {
      console.error("JSON Parse Error", e);
      setParseError("無法解析 AI 回傳的選角資料。");
    }
  }, [castingResult]);

  const handleConfirm = () => {
    if (selectedGuide) {
        // Combine traits into a single string for the prompt generator
        const combinedTraits = `[角色: ${protagonistName}] [性別: ${protagonistGender}] [年齡: ${protagonistAge}] ${protagonistTraits}`;
        onConfirmCasting(combinedTraits, selectedGuide);
    }
  };

  const startEditGuide = (index: number, guide: GuideCandidate) => {
    setEditingGuideIndex(index);
    setTempGuide({...guide});
  };

  const cancelEditGuide = () => {
    setEditingGuideIndex(null);
    setTempGuide(null);
  };

  const saveGuide = () => {
    if (!data || !tempGuide || editingGuideIndex === null) return;
    const newGuides = [...data.guides];
    newGuides[editingGuideIndex] = tempGuide;
    setData({...data, guides: newGuides});
    
    // If the edited guide was selected, update selection to match the new version
    if (selectedGuide && selectedGuide.id === tempGuide.id) {
        setSelectedGuide(tempGuide);
    }
    
    cancelEditGuide();
  };

  const toggleTone = (code: string) => {
      if (!tempGuide) return;
      // Extract existing codes
      const currentString = tempGuide.tone || "";
      let activeCodes = TONE_OPTIONS.filter(opt => currentString.includes(opt.code)).map(opt => opt.code);
      
      // If none found via simple include, maybe it's raw text, let's treat it as empty or custom
      // But for UI logic, we rely on codes.

      if (activeCodes.includes(code)) {
          activeCodes = activeCodes.filter(c => c !== code);
      } else {
          activeCodes.push(code);
      }
      
      // Sort for consistency
      activeCodes.sort();
      
      // Reconstruct string
      const newToneString = activeCodes.join(" + ");
      setTempGuide({ ...tempGuide, tone: newToneString });
  };


  if (parseError || !data) {
     return (
      <div className="flex flex-col h-full space-y-6">
        <div className="bg-red-900/20 border border-red-500/50 p-4 rounded-lg flex items-center text-red-200">
           <AlertCircle className="mr-2" size={20} />
           {parseError || "資料載入中..."}
        </div>
        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 max-h-96 overflow-y-auto whitespace-pre-wrap font-mono text-sm">
           {castingResult}
        </div>
      </div>
    );
  }

  const isEditingAny = editingGuideIndex !== null;

  return (
    <div className="flex flex-col h-full relative">
      <div className="flex-1 overflow-y-auto custom-scrollbar pb-32 px-1">
         <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
            
            {/* Header */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white flex items-center">
                        <span className="bg-emerald-600 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">4</span>
                        靈魂與策略 (Casting & Mapping)
                    </h2>
                </div>
                <p className="text-slate-400 text-sm">
                    決定投影片的「演員」與「詳細藍圖」。設定將同步寫入 NotebookLM 驅動指令集。
                </p>
            </div>

            {/* A. Protagonist DNA */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
                 <h3 className="text-lg font-bold text-pink-400 flex items-center mb-3">
                    <User className="mr-2" size={20}/> 主角 DNA 定錨 (請確認)
                </h3>
                
                {/* Logic Explanation Block */}
                <div className="bg-pink-900/20 border border-pink-500/30 rounded-lg p-3 mb-3 flex items-start text-sm text-pink-200">
                    <Info className="flex-shrink-0 mr-3 mt-0.5 text-pink-400" size={16} />
                    <div className="opacity-90 text-xs leading-relaxed">
                        <strong>來源機制 (Visual DNA)：</strong> 
                        此特徵由 V-MAX Kernel 自動提取。若 AI 誤判（例如將「美如奶奶」誤判為學生），請直接在此修正姓名與外貌，系統將依據您的修正生成圖像。
                    </div>
                </div>

                <div className="mb-3">
                    <label className="text-xs text-pink-300 font-bold mb-1 block">主角姓名/身分 (請確認是否正確)</label>
                    <input 
                        className="w-full bg-slate-950 border border-pink-500/50 rounded p-2 text-white text-sm focus:ring-2 focus:ring-pink-500/50 outline-none font-bold"
                        value={protagonistName}
                        onChange={(e) => setProtagonistName(e.target.value)}
                        placeholder="例如：美如奶奶"
                        disabled={isEditingAny}
                    />
                </div>

                <div className="flex gap-4 mb-3">
                    <div className="w-1/3">
                        <label className="text-xs text-slate-500 mb-1 block">性別</label>
                        <input 
                            className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 text-sm focus:ring-2 focus:ring-pink-500/50 outline-none"
                            value={protagonistGender}
                            onChange={(e) => setProtagonistGender(e.target.value)}
                            placeholder="例如：女性"
                            disabled={isEditingAny}
                        />
                    </div>
                    <div className="w-1/3">
                        <label className="text-xs text-slate-500 mb-1 block">年齡</label>
                        <input 
                            className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 text-sm focus:ring-2 focus:ring-pink-500/50 outline-none"
                            value={protagonistAge}
                            onChange={(e) => setProtagonistAge(e.target.value)}
                            placeholder="例如：約70歲"
                            disabled={isEditingAny}
                        />
                    </div>
                </div>

                <div>
                    <label className="text-xs text-slate-500 mb-1 block">外貌特徵細節 (髮型/瞳色/服裝/配件)</label>
                    <textarea 
                        className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-slate-200 text-sm h-24 focus:ring-2 focus:ring-pink-500/50 outline-none"
                        value={protagonistTraits}
                        onChange={(e) => setProtagonistTraits(e.target.value)}
                        placeholder="請描述主角的外貌特徵..."
                        disabled={isEditingAny}
                    />
                </div>
            </div>

            {/* B. Guide Casting */}
            <div className="space-y-4">
                <h3 className="text-lg font-bold text-blue-400 flex items-center">
                    <Users className="mr-2" size={20}/> 引導者選角大會 (請選 1 位，可編輯/混搭語氣)
                </h3>

                {/* Logic Explanation Block */}
                <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3 flex items-start text-sm text-blue-200">
                    <Info className="flex-shrink-0 mr-3 mt-0.5 text-blue-400" size={16} />
                    <div className="opacity-90 text-xs leading-relaxed">
                        <strong>判定邏輯 (Style Sync & Mixed Tone)：</strong> 
                        引導者的外貌會自動適應 Step 3 的視覺風格。
                        點擊編輯按鈕後，您可以自由混搭語氣晶片 (例如：G1 溫暖 + G2 邏輯)，創造獨特的教學風格。
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {data.guides.map((guide, idx) => {
                        const isEditing = editingGuideIndex === idx;
                        const isSelected = selectedGuide?.id === guide.id;

                        return (
                            <div
                                key={idx}
                                className={`rounded-xl transition-all border relative overflow-hidden group ${
                                    isSelected && !isEditing
                                    ? 'bg-blue-600/20 border-blue-500 shadow-lg shadow-blue-900/30' 
                                    : 'bg-slate-900/50 border-slate-800'
                                }`}
                            >
                                {isEditing && tempGuide ? (
                                    <div className="p-4 space-y-3 bg-slate-800/80">
                                         <input 
                                            className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-white text-sm font-bold"
                                            value={tempGuide.name}
                                            onChange={(e) => setTempGuide({...tempGuide, name: e.target.value})}
                                            placeholder="姓名"
                                         />
                                         <div className="flex gap-2">
                                            <select 
                                                className="bg-slate-950 border border-slate-700 rounded p-1.5 text-xs text-white w-full"
                                                value={tempGuide.type}
                                                onChange={(e) => setTempGuide({...tempGuide, type: e.target.value as 'Real' | 'Virtual'})}
                                            >
                                                <option value="Real">Real (真人)</option>
                                                <option value="Virtual">Virtual (虛擬)</option>
                                            </select>
                                         </div>
                                         
                                         {/* Multi-select Tone UI */}
                                         <div className="space-y-1.5">
                                            <label className="text-[10px] uppercase text-slate-500 font-bold">混搭語氣 (Persona Chips)</label>
                                            <div className="grid grid-cols-3 gap-1.5">
                                                {TONE_OPTIONS.map((opt) => {
                                                    const isActive = tempGuide.tone?.includes(opt.code);
                                                    return (
                                                        <button
                                                            key={opt.code}
                                                            onClick={() => toggleTone(opt.code)}
                                                            className={`text-[10px] py-1 px-1 rounded border transition-all ${
                                                                isActive 
                                                                ? `${opt.color} shadow-[0_0_10px_-3px_rgba(255,255,255,0.2)]` 
                                                                : 'bg-slate-900 border-slate-700 text-slate-500 hover:border-slate-500'
                                                            }`}
                                                            title={opt.desc}
                                                        >
                                                            {opt.code} {opt.label}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                            <div className="text-[10px] text-slate-400 font-mono bg-slate-950 p-1 rounded border border-slate-800">
                                                當前設定: {tempGuide.tone || "無"}
                                            </div>
                                         </div>

                                         <textarea 
                                            className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-300 text-xs h-20"
                                            value={tempGuide.style}
                                            onChange={(e) => setTempGuide({...tempGuide, style: e.target.value})}
                                            placeholder="外貌風格描述..."
                                         />
                                         <div className="flex justify-end gap-2 pt-2 border-t border-slate-700/50">
                                            <button onClick={cancelEditGuide} className="p-1.5 text-slate-400 hover:text-white bg-slate-700 rounded"><X size={14}/></button>
                                            <button onClick={saveGuide} className="p-1.5 text-white bg-emerald-600 hover:bg-emerald-500 rounded"><Save size={14}/></button>
                                         </div>
                                    </div>
                                ) : (
                                    <div 
                                        className="p-4 h-full cursor-pointer hover:bg-slate-800/50"
                                        onClick={() => !isEditingAny && setSelectedGuide(guide)}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="font-bold text-white text-lg">{guide.name}</span>
                                            <span className={`text-xs px-2 py-0.5 rounded border ${guide.type === 'Real' ? 'bg-emerald-900/30 text-emerald-400 border-emerald-900' : 'bg-purple-900/30 text-purple-400 border-purple-900'}`}>
                                                {guide.type}
                                            </span>
                                        </div>
                                        
                                        {/* Tone Display Tags */}
                                        <div className="flex flex-wrap gap-1 mb-2">
                                            {guide.tone.split(/[,+ ]+/).filter(t => t.startsWith('G')).map(t => {
                                                const opt = TONE_OPTIONS.find(o => o.code === t);
                                                return opt ? (
                                                    <span key={t} className={`text-[10px] px-1.5 py-0.5 rounded border ${opt.color}`}>
                                                        {opt.code} {opt.label}
                                                    </span>
                                                ) : (
                                                     <span key={t} className="text-[10px] bg-slate-800 text-slate-400 border border-slate-700 px-1.5 py-0.5 rounded">
                                                        {t}
                                                    </span>
                                                );
                                            })}
                                            {/* Fallback if raw text */}
                                            {!guide.tone.match(/G[1-6]/) && <span className="text-xs text-slate-500">{guide.tone}</span>}
                                        </div>

                                        <p className="text-sm text-slate-300 line-clamp-3">{guide.style}</p>
                                        
                                        {/* Edit Button */}
                                        <div className={`absolute bottom-2 right-2 flex gap-1 transition-opacity ${isEditingAny ? 'opacity-0 pointer-events-none' : 'opacity-0 group-hover:opacity-100'}`}>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); startEditGuide(idx, guide); }}
                                                className="bg-slate-700 text-blue-400 hover:text-white p-1.5 rounded-full shadow-lg"
                                            >
                                                <Edit2 size={14} />
                                            </button>
                                        </div>

                                        {isSelected && (
                                            <div className="absolute top-2 right-2 bg-blue-500 rounded-full p-1">
                                                <Check size={12} className="text-white" />
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* C. Fusion Mapping Table */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
                 <h3 className="text-lg font-bold text-amber-400 flex items-center mb-3">
                    <Table className="mr-2" size={20}/> P3 物理融合對照表 (Fusion Mapping)
                </h3>
                <div className="prose prose-invert prose-sm max-w-none bg-slate-950 p-4 rounded border border-slate-800 overflow-x-auto">
                    <ReactMarkdown>{data.fusionTable}</ReactMarkdown>
                </div>
            </div>
         </div>
      </div>

       {/* --- CONFIRM BUTTON (STICKY FOOTER) --- */}
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
                disabled={!selectedGuide || isLoading || isEditingAny}
                className={`flex-1 max-w-xl py-3 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center ${
                    !selectedGuide || isLoading || isEditingAny
                    ? 'bg-slate-700 text-slate-400 cursor-not-allowed' 
                    : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/50'
                }`}
             >
                 {isLoading ? (
                    "正在生產核心模組..."
                 ) : isEditingAny ? (
                    "請先儲存引導者設定"
                 ) : (
                    <>
                        確認選角，開始生產 (Step 4)
                        <Play className="ml-2" size={20} />
                    </>
                 )}
             </button>
      </div>
    </div>
  );
};

export default Step4Casting;