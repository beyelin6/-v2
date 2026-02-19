import React, { useState, useEffect } from 'react';
import { Key } from 'lucide-react';
import { 
  AppStep, 
  VMaxState,
  MediaData,
  AnalysisData,
  StrategyItem,
  RecStyleItem,
  RecMetaphorItem,
  GuideCandidate,
  ShapeSimilarItem
} from './types';
import { 
  sendMessageToGemini, 
  resetSession,
  setApiKey,
  hasApiKey
} from './services/gemini';
import { 
  STEP_1_BASIC_PROMPT_SUFFIX,
  STEP_2_DEEP_PROMPT_PREFIX,
  STEP_2_DEEP_PROMPT_SUFFIX,
  REGENERATE_STRATEGIES_PROMPT,
  GENERATE_SINGLE_STRATEGY_PROMPT,
  GENERATE_MNEMONIC_PROMPT,
  STEP_2_VISUALS_PROMPT,
  STEP_3_CASTING_PROMPT_PREFIX,
  STEP_3_CASTING_PROMPT_SUFFIX,
  STEP_4_GENERATION_PROMPT_PREFIX,
  STEP_4_GENERATION_PROMPT_SUFFIX,
  PROMPT_GENERATE_WORKSHEET,
  PROMPT_GENERATE_ASSESSMENT,
  PROMPT_GENERATE_KB
} from './constants';

import StatusControl from './components/StatusControl';
import Step1Input from './components/Step1Input';
import Step2Basic from './components/Step2Basic';
import Step2Deep from './components/Step2Deep';
import Step3Visuals from './components/Step3Visuals';
import Step4Casting from './components/Step4Casting';
import Step5Output from './components/Step5Output';
import ApiKeyModal from './components/ApiKeyModal';

const initialState: VMaxState = {
  currentStep: AppStep.STEP_1_INPUT,
  inputText: '',
  inputMedia: null,
  
  basicAnalysisResult: '', // Step 2 Output
  deepAnalysisResult: '', // Step 2.5 Output
  
  analysisData: null,
  
  visualResult: '',
  visualData: null,
  selectedStyle: null,
  selectedMetaphor: null,

  castingResult: '',
  castingData: null,
  selectedGuide: null,
  confirmedProtagonistTraits: '',

  finalOutput: '',
  outputScript: '',
  outputWorksheet: '',
  outputAssessment: '',
  outputKb: '',

  isLoading: false,
  error: null,
};

function App() {
  const [state, setState] = useState<VMaxState>(initialState);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);

  // Initialize session on mount
  useEffect(() => {
    // Check if API key is present (env variable or previously set)
    if (!hasApiKey()) {
      setShowApiKeyModal(true);
    }
    resetSession();
  }, []);

  const handleApiKeyConfirm = (key: string) => {
    setApiKey(key);
    setShowApiKeyModal(false);
    // Clear previous error when new key is set
    if (state.error) {
        setState(prev => ({ ...prev, error: null }));
    }
  };

  const handleError = (error: any) => {
    console.error("App Error:", error);
    // Do not reset session completely on error to allow retrying without losing context
    // resetSession(); 
    
    let msg = error instanceof Error ? error.message : "發生未預期的錯誤";
    // Normalize message for check
    const lowerMsg = msg.toLowerCase();
    
    // Google GenAI specific error mapping for better UX
    if (lowerMsg.includes("400") || lowerMsg.includes("invalid_argument")) {
         msg = "請求無效 (400)。輸入內容可能過長、格式不支援，或包含無法處理的字元。";
    } else if (lowerMsg.includes("401") || lowerMsg.includes("unauthenticated")) {
         msg = "驗證失敗 (401)。API Key 無效或已過期，請點擊右上角按鈕重新設定。";
    } else if (lowerMsg.includes("403") || lowerMsg.includes("permission_denied")) {
        msg = "權限不足 (403)。請檢查 API Key 是否正確，或確認該 GCP 專案已啟用 Gemini API 服務。";
    } else if (lowerMsg.includes("404") || lowerMsg.includes("not_found")) {
        msg = "模型未找到 (404)。目前使用的模型 (gemini-3-flash-preview) 可能暫時無法存取或名稱有誤。";
    } else if (lowerMsg.includes("429") || lowerMsg.includes("resource_exhausted") || lowerMsg.includes("quota")) {
        msg = "請求次數過多 (429)。API 配額已滿，請稍後再試。若持續發生，請更換一組新的 API Key。";
    } else if (lowerMsg.includes("500") || lowerMsg.includes("internal")) {
        msg = "伺服器錯誤 (500)。Google 端發生內部錯誤，請稍後重試。";
    } else if (lowerMsg.includes("503") || lowerMsg.includes("unavailable")) {
         msg = "服務暫時無法使用 (503)。伺服器過載或維護中，請稍候再試。";
    } else if (lowerMsg.includes("fetch failed") || lowerMsg.includes("networkerror")) {
         msg = "網路連線失敗。請檢查您的網路狀態或 VPN 設定。";
    } else if (lowerMsg.includes("safety") || lowerMsg.includes("blocked")) {
         msg = "內容被安全過濾器攔截。請嘗試調整輸入的文字或圖片內容。";
    } else if (lowerMsg.includes("candidate_unspecified")) {
        msg = "模型未產生有效回應。可能是內容過於敏感或無法處理。";
    }

    setState(prev => ({
      ...prev,
      isLoading: false,
      error: msg
    }));
  };

  const extractStatus = (text: string) => {
    const match = text.match(/\[STATUS\].*?(\n|$)/);
    return match ? match[0] : undefined;
  };

  // --- Step 1: Input -> Step 2 Basic Analysis ---
  const handleStep1Analyze = async (text: string, media: MediaData | null) => {
    setState(prev => ({ ...prev, isLoading: true, error: null, inputText: text, inputMedia: media }));
    try {
      let promptText = "";
      if (text.trim()) {
        promptText = `[INPUT TEXT/CONTEXT]:\n${text}\n${STEP_1_BASIC_PROMPT_SUFFIX}`;
      } else {
         promptText = `${STEP_1_BASIC_PROMPT_SUFFIX}`;
      }

      const response = await sendMessageToGemini(promptText, media);
      setState(prev => ({
        ...prev,
        isLoading: false,
        basicAnalysisResult: response,
        currentStep: AppStep.STEP_2_BASIC
      }));
    } catch (e) {
      handleError(e);
    }
  };

  // --- Step 2: Confirm Basic -> Step 2.5 Deep Analysis ---
  const handleStep2BasicConfirm = async (confirmedBasicData: AnalysisData) => {
      setState(prev => ({
          ...prev,
          isLoading: true,
          error: null,
          analysisData: confirmedBasicData // Store intermediate data
      }));

      try {
          const basicJson = JSON.stringify(confirmedBasicData, null, 2);
          // Construct prompt with text context + basic json context
          const prompt = `${STEP_2_DEEP_PROMPT_PREFIX}\n${basicJson}\n${STEP_2_DEEP_PROMPT_SUFFIX}`;
          
          // Note: We use the same session, so the model remembers the input text from Step 1.
          const response = await sendMessageToGemini(prompt);

          setState(prev => ({
              ...prev,
              isLoading: false,
              deepAnalysisResult: response,
              currentStep: AppStep.STEP_3_DEEP
          }));

      } catch (e) {
          handleError(e);
      }
  };

  // --- Step 2.5: Confirm Deep -> Step 3 Visuals ---
  const handleStep2DeepConfirm = async (refinedDeepAnalysis: string) => {
      // Here refinedDeepAnalysis is the JSON string of the FULL AnalysisData (Basic + Deep)
      // We parse it to ensure we have the latest data before moving on
      
      setState(prev => ({ 
        ...prev, 
        isLoading: true, 
        error: null, 
        deepAnalysisResult: refinedDeepAnalysis, // Save edits
        // analysisData is implicitly updated by the next step's context usage
      }));

      try {
        const contextPrefix = `[CONTEXT: CONFIRMED_ANALYSIS]\n${refinedDeepAnalysis}\n\n`;
        const prompt = `${contextPrefix}${STEP_2_VISUALS_PROMPT}`;
        const response = await sendMessageToGemini(prompt);
        
        setState(prev => ({
            ...prev,
            isLoading: false,
            visualResult: response,
            currentStep: AppStep.STEP_4_VISUALS
        }));
      } catch (e) {
          handleError(e);
      }
  };

  const handleRegenerateStrategies = async (currentData: AnalysisData): Promise<StrategyItem[]> => {
    try {
      const contextPrefix = `[CONTEXT: EXISTING_ANALYSIS_DATA]\n${JSON.stringify(currentData, null, 2)}\n\n`;
      const prompt = `${contextPrefix}${REGENERATE_STRATEGIES_PROMPT}`;
      const response = await sendMessageToGemini(prompt);
      
      let jsonStr = response;
      if (jsonStr.includes('```json')) jsonStr = jsonStr.replace(/```json/g, '').replace(/```/g, '');
      else if (jsonStr.includes('```')) jsonStr = jsonStr.replace(/```/g, '');
      
      const strategies = JSON.parse(jsonStr);
      return Array.isArray(strategies) ? strategies : [];
    } catch (e) {
      console.error("Strategy Regeneration Error:", e);
      throw e; 
    }
  };

  const handleGenerateSingleStrategy = async (currentData: AnalysisData, existingStrategies: StrategyItem[], targetType?: string): Promise<StrategyItem | null> => {
    try {
      const existingTitles = existingStrategies.map(s => s.title).join(", ");
      const contextPrefix = `[CONTEXT: EXISTING_ANALYSIS_DATA]\n${JSON.stringify(currentData, null, 2)}\n[EXISTING_STRATEGIES_TO_AVOID_DUPLICATION]: ${existingTitles}\n\n`;
      
      let finalPrompt = `${contextPrefix}${GENERATE_SINGLE_STRATEGY_PROMPT}`;
      if (targetType) {
        finalPrompt += `\n\n⚠️ IMPORTANT: The user explicitly requested a strategy of Type: "${targetType}". You MUST generate a "${targetType}" strategy using the appropriate tool logic.`;
      }

      const response = await sendMessageToGemini(finalPrompt);
      
      let jsonStr = response;
      if (jsonStr.includes('```json')) jsonStr = jsonStr.replace(/```json/g, '').replace(/```/g, '');
      else if (jsonStr.includes('```')) jsonStr = jsonStr.replace(/```/g, '');
      
      const strategy = JSON.parse(jsonStr);
      return strategy && strategy.title ? strategy : null;
    } catch (e) {
      console.error("Single Strategy Generation Error:", e);
      throw e;
    }
  };
  
  const handleGenerateMnemonic = async (chars: ShapeSimilarItem[]): Promise<string> => {
    try {
      // Include explanation in the context if available
      const charListStr = chars.map(c => {
          let line = `- ${c.char} (部首: ${c.radical}, 詞: ${c.words})`;
          if (c.explanation) {
              line += ` [備註/詳解: ${c.explanation}]`;
          }
          return line;
      }).join('\n');
      
      const prompt = GENERATE_MNEMONIC_PROMPT.replace('{CHARACTERS_LIST}', charListStr);
      const response = await sendMessageToGemini(prompt);
      return response.trim();
    } catch (e) {
      console.error("Mnemonic Generation Error:", e);
      throw e;
    }
  };

  // --- Step 3: Confirm Visuals -> Go to Casting ---
  const handleStep3Confirm = async (style: RecStyleItem, metaphor: RecMetaphorItem) => {
      setState(prev => ({
          ...prev,
          isLoading: true,
          error: null,
          selectedStyle: style,
          selectedMetaphor: metaphor
      }));

      try {
          const prompt = `${STEP_3_CASTING_PROMPT_PREFIX}${style.name} (Code: ${style.code})\nMetaphor: ${metaphor.name} (Code: ${metaphor.code})\n${STEP_3_CASTING_PROMPT_SUFFIX}`;
          const response = await sendMessageToGemini(prompt);
          
          setState(prev => ({
              ...prev,
              isLoading: false,
              castingResult: response,
              currentStep: AppStep.STEP_5_CASTING
          }));
      } catch (e) {
          handleError(e);
      }
  };

  // --- Step 4: Confirm Casting -> Go to Output (Atomic Script Only) ---
  const handleStep4Confirm = async (traits: string, guide: GuideCandidate) => {
      setState(prev => ({
          ...prev,
          isLoading: true,
          error: null,
          confirmedProtagonistTraits: traits,
          selectedGuide: guide
      }));

      try {
          const prompt = `${STEP_4_GENERATION_PROMPT_PREFIX}${state.selectedStyle?.name}\nGuide: ${guide.name}\nProtagonist Traits: ${traits}\n${STEP_4_GENERATION_PROMPT_SUFFIX}`;
          const response = await sendMessageToGemini(prompt);
          
          setState(prev => ({
              ...prev,
              isLoading: false,
              outputScript: response,
              finalOutput: response, // Keep finalOutput as main script reference
              currentStep: AppStep.STEP_6_OUTPUT
          }));
      } catch (e) {
          handleError(e);
      }
  };

  const handleGenerateModule = async (type: 'worksheet' | 'assessment' | 'kb') => {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      try {
          let prompt = "";
          if (type === 'worksheet') prompt = PROMPT_GENERATE_WORKSHEET;
          else if (type === 'assessment') prompt = PROMPT_GENERATE_ASSESSMENT;
          else if (type === 'kb') prompt = PROMPT_GENERATE_KB;

          const response = await sendMessageToGemini(prompt);
          
          setState(prev => ({
              ...prev,
              isLoading: false,
              outputWorksheet: type === 'worksheet' ? response : prev.outputWorksheet,
              outputAssessment: type === 'assessment' ? response : prev.outputAssessment,
              outputKb: type === 'kb' ? response : prev.outputKb,
          }));
      } catch (e) {
          handleError(e);
      }
  };

  const currentStatusText = 
    state.currentStep === AppStep.STEP_1_INPUT ? undefined :
    state.currentStep === AppStep.STEP_2_BASIC ? extractStatus(state.basicAnalysisResult) :
    state.currentStep === AppStep.STEP_3_DEEP ? extractStatus(state.deepAnalysisResult) :
    state.currentStep === AppStep.STEP_4_VISUALS ? extractStatus(state.visualResult) :
    state.currentStep === AppStep.STEP_5_CASTING ? extractStatus(state.castingResult) :
    extractStatus(state.finalOutput);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-200">
      <StatusControl 
        step={state.currentStep} 
        statusText={currentStatusText}
        isProcessing={state.isLoading}
      />

      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full relative">
        <div className="absolute top-4 right-4 md:right-8 z-10">
            <button 
                onClick={() => setShowApiKeyModal(true)}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg text-xs font-mono transition-all border border-slate-700 hover:border-slate-500 backdrop-blur-sm"
            >
                <Key size={14} />
                <span>API KEY</span>
            </button>
        </div>

        {showApiKeyModal && (
            <ApiKeyModal 
                onConfirm={handleApiKeyConfirm} 
                onClose={hasApiKey() ? () => setShowApiKeyModal(false) : undefined}
                hasExistingKey={hasApiKey()}
            />
        )}
        
        {state.error && (
           <div className="mb-6 bg-red-900/50 border border-red-500 text-red-200 p-4 rounded-lg flex items-center animate-in fade-in mt-8 md:mt-0 shadow-lg">
             <svg className="w-6 h-6 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
             <div className="flex-1">
               <p className="font-bold text-lg mb-1">發生錯誤</p>
               <p className="text-sm break-all leading-relaxed">{state.error}</p>
             </div>
             <button 
               onClick={() => setState(prev => ({...prev, error: null}))}
               className="ml-4 p-2 hover:bg-red-800/50 rounded-full transition-colors"
             >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
             </button>
           </div>
        )}

        <div className="bg-slate-900/30 backdrop-blur-sm border border-slate-800 rounded-2xl p-1 md:p-2 h-[80vh] flex flex-col shadow-2xl mt-8 md:mt-0">
          <div className="flex-1 p-2 md:p-4 overflow-hidden relative">
             {state.currentStep === AppStep.STEP_1_INPUT && (
               <Step1Input onAnalyze={handleStep1Analyze} isLoading={state.isLoading} />
             )}
             {state.currentStep === AppStep.STEP_2_BASIC && (
               <Step2Basic
                 analysis={state.basicAnalysisResult} 
                 onConfirmBasic={handleStep2BasicConfirm} 
                 isLoading={state.isLoading}
               />
             )}
             {state.currentStep === AppStep.STEP_3_DEEP && state.analysisData && (
                <Step2Deep
                  basicData={state.analysisData}
                  deepAnalysisResult={state.deepAnalysisResult}
                  onConfirmDeep={handleStep2DeepConfirm}
                  isLoading={state.isLoading}
                  onRegenerateStrategies={handleRegenerateStrategies}
                  onGenerateSingleStrategy={handleGenerateSingleStrategy}
                  onGenerateMnemonic={handleGenerateMnemonic}
                />
             )}
             {state.currentStep === AppStep.STEP_4_VISUALS && (
                <Step3Visuals 
                    visualResult={state.visualResult}
                    onConfirmVisuals={handleStep3Confirm}
                    isLoading={state.isLoading}
                />
             )}
             {state.currentStep === AppStep.STEP_5_CASTING && (
                <Step4Casting 
                    castingResult={state.castingResult}
                    onConfirmCasting={handleStep4Confirm}
                    isLoading={state.isLoading}
                />
             )}
             {state.currentStep === AppStep.STEP_6_OUTPUT && (
               <Step5Output 
                  outputScript={state.outputScript} 
                  outputWorksheet={state.outputWorksheet}
                  outputAssessment={state.outputAssessment}
                  outputKb={state.outputKb}
                  onGenerateModule={handleGenerateModule}
                  isLoading={state.isLoading}
               />
             )}
          </div>
        </div>
      </main>

      <footer className="p-4 text-center text-slate-600 text-xs font-mono">
        V-MAX SYSTEM v59.0 | 核心引擎: GEMINI 2.0 FLASH
      </footer>
    </div>
  );
}

export default App;