import React, { useState, useEffect } from 'react';
import { User, Users, Table, Check, AlertCircle, Play, Info, Edit2, X, Save, ArrowLeft } from 'lucide-react';
import { CastingData, GuideCandidate } from '../types';
import ReactMarkdown from 'react-markdown';

interface Step4CastingProps {
  castingResult: string;
  onConfirmCasting: (protagonistTraits: string, guide: GuideCandidate) => void;
  isLoading: boolean;
  onBack: () => void;
}

const TONE_OPTIONS = [
  { code: 'G1', label: '溫暖', desc: '關懷/陪伴', color: 'border-pink-200 text-pink-700 bg-pink-50 hover:bg-pink-100' },
  { code: 'G2', label: '邏輯', desc: '推理/分析', color: 'border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100' },
  { code: 'G3', label: '知識', desc: '百科/權威', color: 'border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100' },
  { code: 'G4', label: '魔法', desc: '想像/奇幻', color: 'border-purple-200 text-purple-700 bg-purple-50 hover:bg-purple-100' },
  { code: 'G5', label: '任務', desc: '指令/目標', color: 'border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100' },
  { code: 'G6', label: '熱血', desc: '激勵/挑戰', color: 'border-red-200 text-red-700 bg-red-50 hover:bg-red-100' },
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
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg flex items-center text-red-700">
           <AlertCircle className="mr-2" size={20} />
           {parseError || "資料載入中..."}
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 max-h-96 overflow-y-auto whitespace-pre-wrap font-mono text-sm text-slate-600 shadow-sm">
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
                    <h2 className="text-xl font-bold text-slate-800 flex items-center">
                        <span className="bg-emerald-600 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm shadow-md shadow-emerald-200">4</span>
                        靈魂與策略 (Casting & Mapping)
                    </h2>
                </div>
                <p className="text-slate-500 text-sm">
                    決定投影片的「演員」與「詳細藍圖」。設定將同步寫入 NotebookLM 驅動指令集。
                </p>
            </div>

            {/* A. Protagonist DNA */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                 <h3 className="text-lg font-bold text-pink-600 flex items-center mb-3">
                    <User className="mr-2" size={20}/> 主角 DNA 定錨 (請確認)
                </h3>
                
                {/* Logic Explanation Block */}
                <div className="bg-pink-50 border border-pink-200 rounded-lg p-3 mb-3 flex items-start text-sm text-pink-700">
                    <Info className="flex-shrink-0 mr-3 mt-0.5 text-pink-500" size={16} />
                    <div className="opacity-90 text-xs leading-relaxed">
                        <strong>來源機制 (Visual DNA)：</strong> 
                        此特徵由 V-MAX Kernel 自動提取。若 AI 誤判（例如將「美如奶奶」誤判為學生），請直接在此修正姓名與外貌，系統將依據您的修正生成圖像。
                    </div>
                </div>

                <div className="mb-3">
                    <label className="text-xs text-pink-600 font-bold mb-1 block">主角姓名/身分 (請確認是否正確)</label>
                    <input 
                        className="w-full bg-white border border-pink-200 rounded p-2 text-slate-800 text-sm focus:ring-2 focus:ring-pink-500 outline-none font-bold placeholder-slate-400"
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
                            className="w-full bg-white border border-slate-300 rounded p-2 text-slate-800 text-sm focus:ring-2 focus:ring-pink-500 outline-none placeholder-slate-400"
                            value={protagonistGender}
                            onChange={(e) => setProtagonistGender(e.target.value)}
                            placeholder="例如：女性"
                            disabled={isEditingAny}
                        />
                    </div>
                    <div className="w-1/3">
                        <label className="text-xs text-slate-500 mb-1 block">年齡</label>
                        <input 
                            className="w-full bg-white border border-slate-300 rounded p-2 text-slate-800 text-sm focus:ring-2 focus:ring-pink-500 outline-none placeholder-slate-400"
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
                        className="w-full bg-white border border-slate-300 rounded p-3 text-slate-800 text-sm h-24 focus:ring-2 focus:ring-pink-500 outline-none placeholder-slate-400"
                        value={protagonistTraits}
                        onChange={(e) => setProtagonistTraits(e.target.value)}
                        placeholder="請描述主角的外貌特徵..."
                        disabled={isEditingAny}
                    />
                </div>
            </div>

            {/* B. Guide Casting */}
            <div className="space-y-4">
                <h3 className="text-lg font-bold text-blue-600 flex items-center">
                    <Users className="mr-2" size={20}/> 引導者選角大會 (請選 1 位，可編輯/混搭語氣)
                </h3>

                {/* Logic Explanation Block */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start text-sm text-blue-700">
                    <Info className="flex-shrink-0 mr-3 mt-0.5 text-blue-500" size={16} />
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
                                className={`rounded-xl transition-all border relative overflow-hidden group shadow-sm ${
                                    isSelected && !isEditing
                                    ? 'bg-blue-50 border-blue-400 shadow-md shadow-blue-100' 
                                    : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-md'
                                }`}
                            >
                                {isEditing && tempGuide ? (
                                    <div className="p-4 space-y-3 bg-slate-50">
                                         <input 
                                            className="w-full bg-white border border-slate-300 rounded p-1.5 text-slate-800 text-sm font-bold placeholder-slate-400"
                                            value={tempGuide.name}
                                            onChange={(e) => setTempGuide({...tempGuide, name: e.target.value})}
                                            placeholder="姓名"
                                         />
                                         <div className="flex gap-2">
                                            <select 
                                                className="bg-white border border-slate-300 rounded p-1.5 text-xs text-slate-800 w-full"
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
                                                                ? `${opt.color} shadow-sm ring-1 ring-offset-1 ring-slate-200` 
                                                                : 'bg-white border-slate-200 text-slate-500 hover:border-slate-400 hover:bg-slate-50'
                                                            }`}
                                                            title={opt.desc}
                                                        >
                                                            {opt.code} {opt.label}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                            <div className="text-[10px] text-slate-500 font-mono bg-white p-1 rounded border border-slate-200">
                                                當前設定: {tempGuide.tone || "無"}
                                            </div>
                                         </div>

                                         <textarea 
                                            className="w-full bg-white border border-slate-300 rounded p-2 text-slate-800 text-xs h-20 placeholder-slate-400"
                                            value={tempGuide.style}
                                            onChange={(e) => setTempGuide({...tempGuide, style: e.target.value})}
                                            placeholder="外貌風格描述..."
                                         />
                                         <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                                            <button onClick={cancelEditGuide} className="p-1.5 text-slate-500 hover:text-slate-700 bg-slate-200 hover:bg-slate-300 rounded"><X size={14}/></button>
                                            <button onClick={saveGuide} className="p-1.5 text-white bg-emerald-600 hover:bg-emerald-500 rounded shadow-sm"><Save size={14}/></button>
                                         </div>
                                    </div>
                                ) : (
                                    <div 
                                        className="p-4 h-full cursor-pointer hover:bg-slate-50 transition-colors"
                                        onClick={() => !isEditingAny && setSelectedGuide(guide)}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="font-bold text-slate-800 text-lg">{guide.name}</span>
                                            <span className={`text-xs px-2 py-0.5 rounded border ${guide.type === 'Real' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-purple-50 text-purple-700 border-purple-200'}`}>
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
                                                     <span key={t} className="text-[10px] bg-slate-100 text-slate-500 border border-slate-200 px-1.5 py-0.5 rounded">
                                                        {t}
                                                    </span>
                                                );
                                            })}
                                            {/* Fallback if raw text */}
                                            {!guide.tone.match(/G[1-6]/) && <span className="text-xs text-slate-500">{guide.tone}</span>}
                                        </div>

                                        <p className="text-sm text-slate-600 line-clamp-3">{guide.style}</p>
                                        
                                        {/* Edit Button */}
                                        <div className={`absolute bottom-2 right-2 flex gap-1 transition-opacity ${isEditingAny ? 'opacity-0 pointer-events-none' : 'opacity-0 group-hover:opacity-100'}`}>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); startEditGuide(idx, guide); }}
                                                className="bg-white border border-slate-200 text-blue-500 hover:text-blue-700 p-1.5 rounded-full shadow-md hover:bg-slate-50"
                                            >
                                                <Edit2 size={14} />
                                            </button>
                                        </div>

                                        {isSelected && (
                                            <div className="absolute top-2 right-2 bg-blue-500 rounded-full p-1 shadow-sm">
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
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                 <h3 className="text-lg font-bold text-amber-600 flex items-center mb-3">
                    <Table className="mr-2" size={20}/> P3 物理融合對照表 (Fusion Mapping)
                </h3>
                <div className="prose prose-slate prose-sm max-w-none bg-slate-50 p-4 rounded border border-slate-200 overflow-x-auto">
                    <ReactMarkdown>{data.fusionTable}</ReactMarkdown>
                </div>
            </div>
         </div>
      </div>

       {/* --- CONFIRM BUTTON (STICKY FOOTER) --- */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-slate-200 flex justify-center gap-4 z-10 shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.1)]">
             <button
                onClick={onBack}
                disabled={isLoading}
                className="px-6 py-3 text-slate-600 font-bold rounded-xl border border-slate-200 hover:bg-slate-50 transition-all flex items-center justify-center disabled:opacity-50"
             >
                <ArrowLeft className="mr-2" size={20} />
                返回上一步
             </button>
             <button
                onClick={handleConfirm}
                disabled={!selectedGuide || isLoading || isEditingAny}
                className={`flex-1 max-w-xl py-3 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center ${
                    !selectedGuide || isLoading || isEditingAny
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                    : 'bg-teal-600 hover:bg-teal-500 shadow-teal-200'
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