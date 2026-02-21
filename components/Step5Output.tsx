import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Layers, FileText, CheckSquare, Database, Download, RefreshCw, Sparkles, ArrowLeft, GripVertical, Settings2, Terminal } from 'lucide-react';
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
  onGenerateModule: (type: 'worksheet' | 'assessment' | 'kb' | 'notebooklm_guide') => void;
  isLoading: boolean;
  onBack: () => void;
}

type ModuleType = 'script' | 'worksheet' | 'assessment' | 'kb' | 'notebooklm_guide';

const MODULE_CONFIG: Record<ModuleType, { label: string; icon: React.ElementType; shortLabel: string }> = {
  script: { label: '原子腳本 (Core Script)', shortLabel: '原子腳本', icon: Layers },
  worksheet: { label: '素養學習單 (Worksheet)', shortLabel: '素養學習單', icon: FileText },
  assessment: { label: '複習講義 (Assessment)', shortLabel: '複習講義', icon: CheckSquare },
  kb: { label: '知識庫 (Knowledge Base)', shortLabel: '知識庫', icon: Database },
  notebooklm_guide: { label: 'NotebookLM 操作指南', shortLabel: '操作指南', icon: Terminal },
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
      className={`flex items-center p-4 rounded-xl border mb-3 select-none ${
        active 
          ? 'bg-emerald-900/20 border-emerald-500/50' 
          : 'bg-slate-800 border-slate-700 hover:border-slate-600'
      }`}
    >
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-2 mr-2 text-slate-500 hover:text-slate-300">
        <GripVertical size={20} />
      </div>
      <div className={`p-2 rounded-lg mr-4 ${active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>
        <Icon size={20} />
      </div>
      <div className="flex-1">
        <h3 className={`font-medium ${active ? 'text-emerald-300' : 'text-slate-200'}`}>{config.label}</h3>
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
    onGenerateModule, 
    isLoading,
    onBack
}) => {
  const [activeTab, setActiveTab] = useState<ModuleType>('script');
  const [moduleOrder, setModuleOrder] = useState<ModuleType[]>(['script', 'worksheet', 'assessment', 'kb', 'notebooklm_guide']);
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

  const renderContent = () => {
      let content = "";
      let isEmpty = false;
      let generateType: 'worksheet' | 'assessment' | 'kb' | 'notebooklm_guide' | null = null;
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
          case 'notebooklm_guide':
              content = outputNotebookLMGuide;
              isEmpty = !content;
              generateType = 'notebooklm_guide';
              emptyMessage = "尚未生成 NotebookLM 操作指南 (Instruction 6)";
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
                <span>[系統訊息]: 以下為 {MODULE_CONFIG[activeTab].label} 完整產出內容。</span>
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
        <div className="flex gap-2">
            <button 
                onClick={onBack}
                disabled={isLoading}
                className="flex items-center text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded transition-colors border border-slate-700"
            >
                <ArrowLeft size={14} className="mr-2" />
                返回選角
            </button>
            <button 
                onClick={() => setIsReordering(!isReordering)}
                className={`flex items-center text-xs px-3 py-1.5 rounded transition-colors border ${
                    isReordering 
                    ? 'bg-emerald-600 text-white border-emerald-500' 
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                }`}
            >
                <Settings2 size={14} className="mr-2" />
                {isReordering ? '完成排序' : '調整順序'}
            </button>
            <button 
                onClick={handleExportTxt}
                className="flex items-center text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded transition-colors border border-slate-700"
            >
                <Download size={14} className="mr-2" />
                匯出全部 (TXT)
            </button>
        </div>
      </div>

      <div className="bg-slate-800/50 rounded-xl border border-slate-700 flex-1 flex flex-col overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-slate-700 bg-slate-900/50 overflow-x-auto">
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
                    activeTab === type && !isReordering ? 'text-emerald-400 border-b-2 border-emerald-400 bg-emerald-900/10' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                >
                    <Icon size={16} className="mr-2" />
                    {config.shortLabel}
                </button>
              );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-slate-950">
           {isReordering ? (
               <div className="max-w-2xl mx-auto">
                   <div className="mb-6 p-4 bg-blue-900/20 border border-blue-800 rounded-lg text-blue-200 text-sm">
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