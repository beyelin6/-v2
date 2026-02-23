import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Layers, FileText, CheckSquare, Database, Download, RefreshCw, Sparkles, ArrowLeft, GripVertical, Settings2, Terminal, Gamepad2, Copy, Check, AlertCircle, Headphones } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Step5OutputProps {
  outputScript: string;
  outputWorksheet: string;
  outputAssessment: string;
  outputKb: string;
  outputNotebookLMGuide: string;
  outputGamifiedQuiz: string;
  onGenerateModule: (type: 'worksheet' | 'assessment' | 'kb' | 'notebooklm_guide' | 'gamified_quiz') => void;
  isLoading: boolean;
  onBack: () => void;
}

type ModuleType = 'script' | 'worksheet' | 'assessment' | 'kb' | 'notebooklm_guide' | 'gamified_quiz';

const MODULE_CONFIG: Record<ModuleType, { label: string; icon: React.ElementType; shortLabel: string }> = {
  script: { label: '原子腳本 (Core Script)', shortLabel: '原子腳本', icon: Layers },
  worksheet: { label: '素養學習單 (Worksheet)', shortLabel: '素養學習單', icon: FileText },
  assessment: { label: '複習講義 (Assessment)', shortLabel: '複習講義', icon: CheckSquare },
  kb: { label: '知識庫 (Knowledge Base)', shortLabel: '知識庫', icon: Database },
  notebooklm_guide: { label: 'NotebookLM 操作指南', shortLabel: '操作指南', icon: Terminal },
  gamified_quiz: { label: '遊戲化測驗 (Gamified Quiz)', shortLabel: '遊戲化測驗', icon: Gamepad2 },
};

// --- ✨ 1. 微型元件：獨立管理複製狀態的指令區塊 ---
const CommandBlock = ({ subtitle, command }: { subtitle: string, command: string }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('複製失敗:', err);
    }
  };

  return (
    <div className="mt-4 first:mt-2">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-sm font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-md">{subtitle}</h4>
        <button
          onClick={handleCopy}
          className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
            isCopied 
              ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200'
          }`}
        >
          {isCopied ? <Check size={14} /> : <Copy size={14} />}
          {isCopied ? '已複製！' : '複製此指令'}
        </button>
      </div>
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-400 rounded-l-md"></div>
        <pre className="bg-slate-800 text-slate-50 p-4 rounded-md text-xs font-mono whitespace-pre-wrap leading-relaxed pl-5">
          <code>{command}</code>
        </pre>
      </div>
    </div>
  );
};

// --- ✨ 2. 原有的單一複製卡片 (適用於全局與語音) ---
interface CopyableInstructionProps {
  title: string;
  icon: React.ReactNode;
  description: string;
  command: string;
}

const CopyableInstruction: React.FC<CopyableInstructionProps> = ({ title, icon, description, command }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setIsCopied(true);
      // 2秒後恢復原狀
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('複製失敗:', err);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden transition-all hover:border-indigo-300 hover:shadow-md mb-6">
      <div className="bg-slate-50 px-5 py-3 border-b border-slate-100 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="text-indigo-600">{icon}</div>
          <h3 className="font-bold text-slate-800">{title}</h3>
        </div>
        
        {/* ✨ 核心：一鍵複製按鈕 */}
        <button
          onClick={handleCopy}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            isCopied 
              ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200'
          }`}
        >
          {isCopied ? <Check size={16} /> : <Copy size={16} />}
          {isCopied ? '已複製！' : '一鍵複製'}
        </button>
      </div>
      
      <div className="p-5">
        <p className="text-sm text-slate-500 mb-3">{description}</p>
        {/* 指令展示區塊 */}
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 rounded-l-md"></div>
          <pre className="bg-slate-800 text-slate-50 p-4 rounded-md text-sm font-mono whitespace-pre-wrap overflow-x-auto leading-relaxed pl-6">
            <code>{command}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};

// Sortable Item Component
function SortableItem({ id, active }: { id: ModuleType; active: boolean }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.5 : 1,
  };

  const config = MODULE_CONFIG[id];
  const Icon = config.icon;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center p-4 rounded-xl border mb-3 select-none shadow-sm transition-all ${
        active 
          ? 'bg-emerald-50 border-emerald-200 shadow-md' 
          : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-md'
      }`}
    >
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-2 mr-2 text-slate-400 hover:text-slate-600">
        <GripVertical size={20} />
      </div>
      <div className={`p-2 rounded-lg mr-4 ${active ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
        <Icon size={20} />
      </div>
      <div className="flex-1">
        <h3 className={`font-medium ${active ? 'text-emerald-700' : 'text-slate-700'}`}>{config.label}</h3>
        <p className="text-xs text-slate-500">拖曳以調整順序</p>
      </div>
    </div>
  );
}

const Step5Output: React.FC<Step5OutputProps> = ({ 
    outputScript, 
    outputWorksheet, 
    outputAssessment, 
    outputKb,
    outputNotebookLMGuide,
    outputGamifiedQuiz,
    onGenerateModule, 
    isLoading,
    onBack
}) => {
  const [activeTab, setActiveTab] = useState<ModuleType>('script');
  const [moduleOrder, setModuleOrder] = useState<ModuleType[]>(['script', 'worksheet', 'assessment', 'kb', 'notebooklm_guide', 'gamified_quiz']);
  const [isReordering, setIsReordering] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setModuleOrder((items) => {
        const oldIndex = items.indexOf(active.id as ModuleType);
        const newIndex = items.indexOf(over.id as ModuleType);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleExportTxt = () => {
    const parts = [];
    
    // Use moduleOrder to determine export sequence
    for (const type of moduleOrder) {
        switch (type) {
            case 'script':
                if (outputScript) parts.push(`=== ${MODULE_CONFIG.script.label} ===\n\n` + outputScript);
                break;
            case 'worksheet':
                if (outputWorksheet) parts.push(`\n\n=== ${MODULE_CONFIG.worksheet.label} ===\n\n` + outputWorksheet);
                break;
            case 'assessment':
                if (outputAssessment) parts.push(`\n\n=== ${MODULE_CONFIG.assessment.label} ===\n\n` + outputAssessment);
                break;
            case 'kb':
                if (outputKb) parts.push(`\n\n=== ${MODULE_CONFIG.kb.label} ===\n\n` + outputKb);
                break;
            case 'notebooklm_guide':
                if (outputNotebookLMGuide) parts.push(`\n\n=== ${MODULE_CONFIG.notebooklm_guide.label} ===\n\n` + outputNotebookLMGuide);
                break;
            case 'gamified_quiz':
                if (outputGamifiedQuiz) parts.push(`\n\n=== ${MODULE_CONFIG.gamified_quiz.label} ===\n\n` + outputGamifiedQuiz);
                break;
        }
    }

    if (parts.length === 0) {
        alert("目前沒有可匯出的內容。");
        return;
    }

    const fullContent = parts.join("\n\n" + "=".repeat(40) + "\n\n");
    
    const blob = new Blob([fullContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `V-MAX_Output_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const renderNotebookLMGuide = () => {
    // 組合動態變數
    // 這裡為了簡化，暫時使用預設值，實際應從 props 傳入 selectedGuide 和 basicInfo
    const guideName = "引導導師"; 
    const toneDesc = "專業語氣";
    const grade = "國小";
    const topic = "本課主題";

    return (
      <div className="max-w-4xl mx-auto py-6">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-slate-800 flex items-center justify-center gap-2 mb-2">
            <Terminal className="w-8 h-8 text-indigo-600" />
            NotebookLM 萬能操作指南
          </h2>
          <p className="text-slate-500 text-sm">請將生成的 TXT 腳本上傳至 NotebookLM 後，搭配以下指令進行精準控制。</p>
        </div>

        <CopyableInstruction 
          title="1. 全局生成防護鎖 (Global Lock)"
          icon={<Terminal size={20} />}
          description="貼入「簡報」按鈕旁邊的 ✏️ 自訂指令框。這能防止 AI 擅自修改文字或畫風。"
          command={`請扮演一位嚴格的『視覺執行導演』。請依照來源文件中的 \`notebooklm_driver\` 設定，以及 \`Instruction 2: 原子化動態腳本\` 的結構，為我生成從 [P1] 到最後一頁的詳細投影片內容。

⚠️ 最高指導原則 (Critical Protocols)：
1. 視覺絕對忠誠 (Visual Fidelity)：請嚴格遵守【視覺提示詞】中的描述。禁止歷史覆寫：即使成語典故與特定物品有關，若指令要求畫『發光的古物』，你必須畫『發光的古物』。請勿使用背景知識來替換視覺物件。
2. 文字逐字鎖定 (Text Verbatim)：投影片上的文字內容，必須 100% 逐字複製【顯示文字】區塊（被 --- 包夾的區域）內的繁體中文。禁止潤飾：請勿修改標題、縮減例句或優化語意，嚴禁增加英文。
3. 風格與特徵一致性：請嚴格遵守 YAML 設定檔中的 dna_traits (角色特徵) 與 style_prompt (視覺風格咒語)。確保每一頁的人物長相與畫風完全一致。`}
        />

        {/* 🌟 2. 複合式卡片：單頁精準修復指令 */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-6">
          <div className="bg-slate-50 px-5 py-3 border-b border-slate-100 flex items-center gap-2">
            <div className="text-amber-500"><AlertCircle size={20} /></div>
            <h3 className="font-bold text-slate-800">2. 單頁精準修復指令</h3>
          </div>
          <div className="p-5">
            <p className="text-sm text-slate-500 mb-4">若產出後單頁發生錯誤，請點擊該頁右上角的 ✏️，並根據錯誤類型複製對應指令：</p>
            
            <CommandBlock 
              subtitle="情況 A：圖片跑版、角色長相變了" 
              command="請維持這頁的文字完全不變。請嚴格去來源文件尋找這一頁對應的【視覺提示詞】，並將圖片強制修正為原本設定的 dna_traits 與 style_prompt，不准擅自改變角色的服裝、髮型或場景畫風。" 
            />
            
            <div className="h-px bg-slate-100 my-4 w-full"></div> {/* 分隔線 */}

            <CommandBlock 
              subtitle="情況 B：文字漏印、沒有照腳本顯示" 
              command="這頁的文字有遺漏或被擅自改寫了。請維持這頁的圖片不變，嚴格去來源文件尋找這一頁對應的【顯示文字】區塊（被 --- 包夾的區域）。請將該區塊內的繁體中文 100% 逐字補回畫面上，禁止縮減例句或省略段落大意。" 
            />
          </div>
        </div>

        <CopyableInstruction 
          title="3. 語音摘要設定指令 (Audio Overview)"
          icon={<Headphones size={20} />}
          description="生成生動的雙人對講 Podcast 預習音檔。"
          command={`啟動教學模式對話：
- 主講人：${guideName}（角色：引導導師）。
- 語氣設定：${toneDesc}。
- 目標對象：${grade} 學生。
- 核心內容：根據來源文件的【引導語/腳本】，針對『${topic}』進行深度對話與拆解。
- 互動要求：對話中必須包含對修辭技巧、生字部首的具體解釋，並使用『孩子們』、『準備好了嗎』作為課堂互動用語。`}
        />
      </div>
    );
  };

  const renderContent = () => {
      let content = "";
      let isEmpty = false;
      let generateType: 'worksheet' | 'assessment' | 'kb' | 'notebooklm_guide' | 'gamified_quiz' | null = null;
      let emptyMessage = "";
      let buttonLabel = "立即生成";

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
          case 'notebooklm_guide':
              // content = outputNotebookLMGuide; // Not used for custom UI
              // isEmpty = !content; // Always show the guide UI even if not generated via API yet (or maybe we want to generate it first?)
              // Actually, the request implies we render the UI directly. 
              // Let's assume we want to show the UI we built.
              // If we want to support "generating" it first via LLM to get specific values, we can keep the empty check.
              // But the user request says "render NotebookLM Guide section... using CopyableInstruction".
              // Let's show the UI directly.
              return renderNotebookLMGuide();
          case 'gamified_quiz':
              content = outputGamifiedQuiz;
              isEmpty = !content;
              generateType = 'gamified_quiz';
              emptyMessage = "尚未生成遊戲化測驗 (Instruction 7)";
              buttonLabel = "🎮 產生 Kahoot 題庫";
              break;
      }

      if (isEmpty && generateType) {
          return (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center animate-in fade-in">
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 mb-6 max-w-md shadow-sm">
                      <Sparkles className="mx-auto text-emerald-500 mb-4" size={32} />
                      <h3 className="text-lg font-bold text-slate-800 mb-2">{emptyMessage}</h3>
                      <p className="text-slate-500 text-sm">
                          點擊下方按鈕，AI 將根據核心腳本延伸生成此模組。
                      </p>
                  </div>
                  <button
                      onClick={() => generateType && onGenerateModule(generateType)}
                      disabled={isLoading}
                      className={`flex items-center px-6 py-3 rounded-xl font-bold transition-all transform ${
                          isLoading
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                          : 'bg-blue-600 hover:bg-blue-500 text-white hover:scale-105 shadow-lg shadow-blue-200'
                      }`}
                  >
                      {isLoading ? (
                          <>
                              <RefreshCw size={18} className="animate-spin mr-2" />
                              正在生成模組...
                          </>
                      ) : (
                          <>
                              {generateType === 'gamified_quiz' ? <Gamepad2 size={18} className="mr-2" /> : <Sparkles size={18} className="mr-2" />}
                              {buttonLabel}
                          </>
                      )}
                  </button>
              </div>
          );
      }

      return (
           <div className="prose prose-slate max-w-none">
             <div className="p-4 bg-slate-50 rounded border border-slate-200 mb-4 text-xs font-mono text-slate-500 flex justify-between items-center">
                <span>[系統訊息]: 以下為 {MODULE_CONFIG[activeTab].label} 完整產出內容。</span>
                <span className="text-[10px] bg-white border border-slate-200 px-2 py-1 rounded shadow-sm">Markdown Mode</span>
             </div>
             <ReactMarkdown 
              components={{
                code(props) {
                  const {children, className, node, ...rest} = props
                  return (
                    <code className="bg-slate-100 text-orange-600 px-1 py-0.5 rounded text-sm font-mono border border-slate-200" {...rest}>
                      {children}
                    </code>
                  )
                },
                pre(props) {
                   return <pre className="bg-slate-50 p-4 rounded-lg overflow-x-auto border border-slate-200 my-4 text-slate-700" {...props} />
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
        <h2 className="text-xl font-bold text-slate-800 flex items-center">
          <span className="bg-emerald-600 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm shadow-md shadow-emerald-200">5</span>
          六大模組產出 (Big 6 Production)
        </h2>
        <div className="flex gap-2">
            <button 
                onClick={onBack}
                disabled={isLoading}
                className="flex items-center text-xs bg-white hover:bg-slate-50 text-slate-600 px-3 py-1.5 rounded transition-colors border border-slate-200 shadow-sm"
            >
                <ArrowLeft size={14} className="mr-2" />
                返回選角
            </button>
            <button 
                onClick={() => setIsReordering(!isReordering)}
                className={`flex items-center text-xs px-3 py-1.5 rounded transition-colors border shadow-sm ${
                    isReordering 
                    ? 'bg-emerald-600 text-white border-emerald-500' 
                    : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'
                }`}
            >
                <Settings2 size={14} className="mr-2" />
                {isReordering ? '完成排序' : '調整順序'}
            </button>
            <button 
                onClick={handleExportTxt}
                className="flex items-center text-xs bg-white hover:bg-slate-50 text-slate-600 px-3 py-1.5 rounded transition-colors border border-slate-200 shadow-sm"
            >
                <Download size={14} className="mr-2" />
                匯出全部 (TXT)
            </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 flex-1 flex flex-col overflow-hidden shadow-sm">
        {/* Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 overflow-x-auto">
          {moduleOrder.map((type) => {
              const config = MODULE_CONFIG[type];
              const Icon = config.icon;
              return (
                <button
                    key={type}
                    onClick={() => {
                        setActiveTab(type);
                        setIsReordering(false);
                    }}
                    className={`flex items-center px-4 md:px-6 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
                    activeTab === type && !isReordering ? 'text-emerald-600 border-b-2 border-emerald-500 bg-emerald-50' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                    }`}
                >
                    <Icon size={16} className="mr-2" />
                    {config.shortLabel}
                </button>
              );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-white">
           {isReordering ? (
               <div className="max-w-2xl mx-auto">
                   <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm">
                       <p className="flex items-center font-bold mb-1">
                           <Settings2 size={16} className="mr-2" />
                           調整模組順序
                       </p>
                       <p className="opacity-80">
                           拖曳下方項目可調整順序。此順序將影響「匯出全部」時的內容排列，以及上方分頁的顯示順序。
                       </p>
                   </div>
                   
                   <DndContext 
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleDragEnd}
                   >
                       <SortableContext 
                          items={moduleOrder}
                          strategy={verticalListSortingStrategy}
                       >
                           {moduleOrder.map((id) => (
                               <SortableItem key={id} id={id} active={activeTab === id} />
                           ))}
                       </SortableContext>
                   </DndContext>
               </div>
           ) : (
               renderContent()
           )}
        </div>
      </div>
    </div>
  );
};

export default Step5Output;