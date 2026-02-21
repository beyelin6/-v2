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
  ShapeSimilarItem,
  PolyphonicItem
} from './types';
import { 
  sendMessageToGemini, 
  resetSession,
  setApiKey,
  hasApiKey,
  isSessionActive
} from './services/gemini';
import { 
  STEP_1_BASIC_PROMPT_SUFFIX,
  STEP_2_DEEP_PROMPT_PREFIX,
  STEP_2_DEEP_VOCAB_PROMPT_SUFFIX,
  STEP_2_DEEP_SEGMENTS_PROMPT_SUFFIX,
  REGENERATE_STRATEGIES_PROMPT,
  GENERATE_SINGLE_STRATEGY_PROMPT,
  GENERATE_MNEMONIC_PROMPT,
  GENERATE_POLYPHONIC_PROMPT,
  GENERATE_SHAPE_SIMILAR_PROMPT,
  GENERATE_RHETORIC_GUIDANCE_PROMPT,
  STEP_2_VISUALS_PROMPT,
  STEP_3_CASTING_PROMPT_PREFIX,
  STEP_3_CASTING_PROMPT_SUFFIX,
  STEP_4_GENERATION_PROMPT_PREFIX,
  STEP_4_GENERATION_PROMPT_SUFFIX,
  PROMPT_GENERATE_WORKSHEET,
  PROMPT_GENERATE_ASSESSMENT,
  PROMPT_GENERATE_KB,
  PROMPT_GENERATE_NOTEBOOKLM_GUIDE
} from './constants';

import StatusControl from './components/StatusControl';
import Step1Input from './components/Step1Input';
import Step2Basic from './components/Step2Basic';
import Step2Deep from './components/Step2Deep';
import Step2DeepSegments from './components/Step2DeepSegments';
import Step3Visuals from './components/Step3Visuals';
import Step4Casting from './components/Step4Casting';
import Step5Output from './components/Step5Output';
import ApiKeyModal from './components/ApiKeyModal';

const LOCAL_STORAGE_STATE_KEY = 'vmax_app_state_v59';

const initialState: VMaxState = {
  currentStep: AppStep.STEP_1_INPUT,
  inputText: '',
  inputMedia: null,
  
  basicAnalysisResult: '', // Step 2 Output
  deepVocabResult: '', // Step 2.5 Output
  deepSegmentsResult: '', // Step 2.75 Output
  
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
  outputNotebookLMGuide: '',

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
    
    // Load state from localStorage
    try {
        const savedState = localStorage.getItem(LOCAL_STORAGE_STATE_KEY);
        if (savedState) {
            const parsedState = JSON.parse(savedState);
            // Merge with initialState to ensure new fields are present
            setState(prev => ({ ...initialState, ...parsedState, isLoading: false, error: null }));
        }
    } catch (e) {
        console.error("Failed to load state from localStorage", e);
    }
    
    // We do NOT call resetSession() here if we loaded state, 
    // but since chatSession is in memory, it IS effectively reset.
    // We rely on getRecoveryContext() to restore context to the LLM.
    if (!isSessionActive()) {
        resetSession(); 
    }
  }, []);

  // Save state to localStorage on change
  useEffect(() => {
      try {
          const stateToSave = JSON.stringify(state);
          localStorage.setItem(LOCAL_STORAGE_STATE_KEY, stateToSave);
      } catch (e: any) {
          if (e.name === 'QuotaExceededError' || e.code === 22 || e.code === 1014) {
              console.warn("LocalStorage quota exceeded. Clearing old state and retrying...");
              try {
                  localStorage.removeItem(LOCAL_STORAGE_STATE_KEY);
                  localStorage.setItem(LOCAL_STORAGE_STATE_KEY, JSON.stringify(state));
              } catch (retryError) {
                  console.error("Failed to save state even after clearing. State might be too large.", retryError);
                  // Optional: Notify user or disable auto-save temporarily
              }
          } else {
              console.error("Failed to save state to localStorage", e);
          }
      }
  }, [state]);

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
    
    let msg = "發生未預期的錯誤";
    
    if (typeof error === 'string') {
        msg = error;
    } else if (error?.error?.message) {
        // Handle structured JSON error like {"error": {"code": 429, "message": "..."}}
        msg = error.error.message;
    } else if (error instanceof Error) {
        msg = error.message;
    } else if (error?.message) {
        msg = error.message;
    }

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

  const getRecoveryContext = () => {
    if (isSessionActive()) return "";
    
    console.log("Session lost, constructing recovery context...");
    return `[SYSTEM: SESSION RESTORED]
The user's session was interrupted (page reload). 
Here is the FULL CONTEXT of the project so far. Use this to resume the process.

[ORIGINAL INPUT TEXT]:
${state.inputText}

[CURRENT ANALYSIS STATE (JSON)]:
${JSON.stringify(state.analysisData || {}, null, 2)}

[CURRENT VISUAL STATE (JSON)]:
${JSON.stringify(state.visualData || {}, null, 2)}

[CURRENT CASTING STATE (JSON)]:
${JSON.stringify(state.castingData || {}, null, 2)}

[INSTRUCTION]:
Resume the process from the last state.
`;
  };

  // --- Step 1: Input -> Step 2 Basic Analysis ---
  const handleStep1Analyze = async (text: string, media: MediaData[] | null) => {
    setState(prev => ({ ...prev, isLoading: true, error: null, inputText: text, inputMedia: media }));
    try {
      let promptText = "";
      if (text.trim()) {
        promptText = `[INPUT TEXT/CONTEXT]:\n${text}\n${STEP_1_BASIC_PROMPT_SUFFIX}`;
      } else {
         promptText = `${STEP_1_BASIC_PROMPT_SUFFIX}`;
      }

      // Step 1 always starts a new session, so no recovery context needed
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

  // --- Step 2: Confirm Basic -> Step 2.5 Deep Vocab Analysis ---
  const handleStep2BasicConfirm = async (confirmedBasicData: AnalysisData) => {
      setState(prev => ({
          ...prev,
          isLoading: true,
          error: null,
          analysisData: confirmedBasicData // Store basic data
      }));

      try {
          const basicJson = JSON.stringify(confirmedBasicData, null, 2);
          const recovery = getRecoveryContext();
          const prompt = `${recovery}\n${STEP_2_DEEP_PROMPT_PREFIX}\n${basicJson}\n${STEP_2_DEEP_VOCAB_PROMPT_SUFFIX}`;
          
          const response = await sendMessageToGemini(prompt);

          setState(prev => ({
              ...prev,
              isLoading: false,
              deepVocabResult: response,
              currentStep: AppStep.STEP_3_DEEP_VOCAB
          }));

      } catch (e) {
          handleError(e);
      }
  };

  // --- Step 2.5: Confirm Deep Vocab -> Step 2.75 Deep Segments Analysis ---
  const handleStep2DeepVocabConfirm = async (refinedVocabJson: string) => {
      
      // Update analysisData with the vocabulary
      let currentData = state.analysisData;
      try {
          // Parse the refined vocab result to extract vocabulary list
          let cleanJson = refinedVocabJson;
          if (cleanJson.includes('```json')) cleanJson = cleanJson.replace(/```json/g, '').replace(/```/g, '');
          else if (cleanJson.includes('```')) cleanJson = cleanJson.replace(/```/g, '');
          const vocabData = JSON.parse(cleanJson);
          
          if (currentData) {
              currentData = {
                  ...currentData,
                  vocabulary: vocabData.vocabulary || []
              };
          }
      } catch (e) {
          console.error("Failed to merge vocab data", e);
      }

      setState(prev => ({ 
        ...prev, 
        isLoading: true, 
        error: null, 
        deepVocabResult: refinedVocabJson, // Save edits
        analysisData: currentData
      }));

      try {
        const recovery = getRecoveryContext();
        const prompt = `${recovery}\n${STEP_2_DEEP_SEGMENTS_PROMPT_SUFFIX}`;
        // Note: The context (Basic Info + Vocab) is implicitly known by the chat session history.
        // We just need to prompt for the next logical step.
        const response = await sendMessageToGemini(prompt);
        
        setState(prev => ({
            ...prev,
            isLoading: false,
            deepSegmentsResult: response,
            currentStep: AppStep.STEP_3_DEEP_SEGMENTS
        }));
      } catch (e) {
          handleError(e);
      }
  };

  // --- Step 2.75: Confirm Deep Segments -> Step 3 Visuals ---
  const handleStep2DeepSegmentsConfirm = async (refinedSegmentsJson: string) => {

      // Update analysisData with segments and strategies
      let currentData = state.analysisData;
      try {
          let cleanJson = refinedSegmentsJson;
          if (cleanJson.includes('```json')) cleanJson = cleanJson.replace(/```json/g, '').replace(/```/g, '');
          else if (cleanJson.includes('```')) cleanJson = cleanJson.replace(/```/g, '');
          const segmentData = JSON.parse(cleanJson);

           if (currentData) {
              currentData = {
                  ...currentData,
                  segments: segmentData.segments || [],
                  strategies: segmentData.strategies || []
              };
          }
      } catch (e) {
          console.error("Failed to merge segment data", e);
      }

      setState(prev => ({
          ...prev,
          isLoading: true,
          error: null,
          deepSegmentsResult: refinedSegmentsJson,
          analysisData: currentData
      }));

      try {
          const recovery = getRecoveryContext();
          const prompt = `${recovery}\n${STEP_2_VISUALS_PROMPT}`;
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
      const recovery = getRecoveryContext();
      const prompt = `${recovery}\n${contextPrefix}${REGENERATE_STRATEGIES_PROMPT}`;
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
      
      const recovery = getRecoveryContext();
      let finalPrompt = `${recovery}\n${contextPrefix}${GENERATE_SINGLE_STRATEGY_PROMPT}`;
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
      
      const recovery = getRecoveryContext();
      const prompt = `${recovery}\n${GENERATE_MNEMONIC_PROMPT.replace('{CHARACTERS_LIST}', charListStr)}`;
      const response = await sendMessageToGemini(prompt);
      return response.trim();
    } catch (e) {
      console.error("Mnemonic Generation Error:", e);
      throw e;
    }
  };

  const handleGeneratePolyphonic = async (char: string): Promise<PolyphonicItem[]> => {
    try {
      const recovery = getRecoveryContext();
      const prompt = `${recovery}\n${GENERATE_POLYPHONIC_PROMPT.replace('{CHAR}', char)}`;
      const response = await sendMessageToGemini(prompt);
      
      let jsonStr = response;
      if (jsonStr.includes('```json')) jsonStr = jsonStr.replace(/```json/g, '').replace(/```/g, '');
      else if (jsonStr.includes('```')) jsonStr = jsonStr.replace(/```/g, '');
      
      const result = JSON.parse(jsonStr);
      return Array.isArray(result) ? result : [];
    } catch (e) {
      console.error("Polyphonic Generation Error:", e);
      throw e;
    }
  };

  const handleGenerateShapeSimilar = async (char: string): Promise<ShapeSimilarItem[]> => {
    try {
      const recovery = getRecoveryContext();
      const prompt = `${recovery}\n${GENERATE_SHAPE_SIMILAR_PROMPT.replace('{CHAR}', char)}`;
      const response = await sendMessageToGemini(prompt);
      
      let jsonStr = response;
      if (jsonStr.includes('```json')) jsonStr = jsonStr.replace(/```json/g, '').replace(/```/g, '');
      else if (jsonStr.includes('```')) jsonStr = jsonStr.replace(/```/g, '');
      
      const result = JSON.parse(jsonStr);
      return Array.isArray(result) ? result : [];
    } catch (e) {
      console.error("Shape Similar Generation Error:", e);
      throw e;
    }
  };

  const handleGenerateRhetoricGuidance = async (segmentTitle: string, rhetoricName: string, rhetoricExample: string): Promise<{teachingPoint: string, application: string} | null> => {
      try {
          const recovery = getRecoveryContext();
          const prompt = `${recovery}\n${GENERATE_RHETORIC_GUIDANCE_PROMPT
              .replace('{SEGMENT_TITLE}', segmentTitle)
              .replace('{RHETORIC_NAME}', rhetoricName)
              .replace('{RHETORIC_EXAMPLE}', rhetoricExample)}`;
          
          const response = await sendMessageToGemini(prompt);
          
          let jsonStr = response;
          if (jsonStr.includes('```json')) jsonStr = jsonStr.replace(/```json/g, '').replace(/```/g, '');
          else if (jsonStr.includes('```')) jsonStr = jsonStr.replace(/```/g, '');
          
          const result = JSON.parse(jsonStr);
          return result;
      } catch (e) {
          console.error("Rhetoric Guidance Generation Error:", e);
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
          const recovery = getRecoveryContext();
          const prompt = `${recovery}\n${STEP_3_CASTING_PROMPT_PREFIX}${style.name} (Code: ${style.code})\nMetaphor: ${metaphor.name} (Code: ${metaphor.code})\n${STEP_3_CASTING_PROMPT_SUFFIX}`;
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
          const recovery = getRecoveryContext();
          const prompt = `${recovery}\n${STEP_4_GENERATION_PROMPT_PREFIX}${state.selectedStyle?.name}\nGuide: ${guide.name}\nProtagonist Traits: ${traits}\n${STEP_4_GENERATION_PROMPT_SUFFIX}`;
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

  const handleGenerateModule = async (type: 'worksheet' | 'assessment' | 'kb' | 'notebooklm_guide') => {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      try {
          let prompt = "";
          if (type === 'worksheet') prompt = PROMPT_GENERATE_WORKSHEET;
          else if (type === 'assessment') prompt = PROMPT_GENERATE_ASSESSMENT;
          else if (type === 'kb') prompt = PROMPT_GENERATE_KB;
          else if (type === 'notebooklm_guide') {
              // Inject context for NotebookLM Guide
              const guideName = state.selectedGuide?.name || "引導者";
              const tone = state.selectedGuide?.tone || "G1";
              const grade = state.analysisData?.basicInfo.grade || "國小";
              const topic = state.analysisData?.basicInfo.theme || "本課主題";
              
              prompt = PROMPT_GENERATE_NOTEBOOKLM_GUIDE
                  .replace('{Guide_Name}', guideName)
                  .replace('{Tone_Description}', tone)
                  .replace('{Grade}', grade)
                  .replace('{Topic}', topic);
          }

          const recovery = getRecoveryContext();
          const response = await sendMessageToGemini(`${recovery}\n${prompt}`);
          
          setState(prev => ({
              ...prev,
              isLoading: false,
              outputWorksheet: type === 'worksheet' ? response : prev.outputWorksheet,
              outputAssessment: type === 'assessment' ? response : prev.outputAssessment,
              outputKb: type === 'kb' ? response : prev.outputKb,
              outputNotebookLMGuide: type === 'notebooklm_guide' ? response : prev.outputNotebookLMGuide,
          }));
      } catch (e) {
          handleError(e);
      }
  };

  // --- Backward Navigation ---
  const handleBack = () => {
    setState(prev => {
        let prevStep = AppStep.STEP_1_INPUT;
        switch (prev.currentStep) {
            case AppStep.STEP_2_BASIC:
                prevStep = AppStep.STEP_1_INPUT;
                break;
            case AppStep.STEP_3_DEEP_VOCAB:
                prevStep = AppStep.STEP_2_BASIC;
                break;
            case AppStep.STEP_3_DEEP_SEGMENTS:
                prevStep = AppStep.STEP_3_DEEP_VOCAB;
                break;
            case AppStep.STEP_4_VISUALS:
                prevStep = AppStep.STEP_3_DEEP_SEGMENTS;
                break;
            case AppStep.STEP_5_CASTING:
                prevStep = AppStep.STEP_4_VISUALS;
                break;
            case AppStep.STEP_6_OUTPUT:
                prevStep = AppStep.STEP_5_CASTING;
                break;
            default:
                prevStep = AppStep.STEP_1_INPUT;
        }
        return {
            ...prev,
            currentStep: prevStep,
            error: null, // Clear errors when going back
            isLoading: false
        };
    });
  };

  const currentStatusText = 
    state.currentStep === AppStep.STEP_1_INPUT ? undefined :
    state.currentStep === AppStep.STEP_2_BASIC ? extractStatus(state.basicAnalysisResult) :
    state.currentStep === AppStep.STEP_3_DEEP_VOCAB ? extractStatus(state.deepVocabResult) :
    state.currentStep === AppStep.STEP_3_DEEP_SEGMENTS ? extractStatus(state.deepSegmentsResult) :
    state.currentStep === AppStep.STEP_4_VISUALS ? extractStatus(state.visualResult) :
    state.currentStep === AppStep.STEP_5_CASTING ? extractStatus(state.castingResult) :
    extractStatus(state.finalOutput);

  return (
    <div className="min-h-screen flex flex-col relative text-slate-200 selection:bg-emerald-500/30 selection:text-emerald-200">
      
      {/* Ambient Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-purple-600/10 rounded-full blur-3xl opacity-30 animate-pulse delay-1000"></div>
        <div className="absolute bottom-[10%] left-[20%] w-[35%] h-[35%] bg-emerald-600/10 rounded-full blur-3xl opacity-20 animate-pulse delay-2000"></div>
      </div>

      <StatusControl 
        step={state.currentStep} 
        statusText={currentStatusText}
        isProcessing={state.isLoading}
      />

      <main className="flex-1 p-4 md:p-6 max-w-[1400px] mx-auto w-full relative z-10 flex flex-col justify-center">
        <div className="absolute top-0 right-4 md:right-6 z-20">
            <button 
                onClick={() => setShowApiKeyModal(true)}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/40 hover:bg-slate-800/60 text-slate-400 hover:text-white rounded-lg text-xs font-mono transition-all border border-white/5 hover:border-white/20 backdrop-blur-md shadow-sm"
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
           <div className="mb-6 bg-red-950/40 border border-red-500/50 text-red-200 p-4 rounded-xl flex items-center animate-in fade-in zoom-in-95 mt-10 md:mt-0 shadow-lg backdrop-blur-md">
             <svg className="w-6 h-6 mr-3 flex-shrink-0 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
             <div className="flex-1">
               <p className="font-bold text-lg mb-1 text-red-100">發生錯誤</p>
               <p className="text-sm break-all leading-relaxed opacity-90">{state.error}</p>
             </div>
             <button 
               onClick={() => setState(prev => ({...prev, error: null}))}
               className="ml-4 p-2 hover:bg-red-900/50 rounded-full transition-colors"
             >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
             </button>
           </div>
        )}

        {/* Main Application Frame */}
        <div className="glass-panel rounded-2xl p-1.5 md:p-2 h-[82vh] flex flex-col shadow-2xl mt-8 md:mt-4 relative overflow-hidden">
          {/* Subtle Inner Glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
          
          <div className="flex-1 p-2 md:p-4 overflow-hidden relative z-10">
             {state.currentStep === AppStep.STEP_1_INPUT && (
               <Step1Input onAnalyze={handleStep1Analyze} isLoading={state.isLoading} />
             )}
             {state.currentStep === AppStep.STEP_2_BASIC && (
               <Step2Basic
                 analysis={state.basicAnalysisResult} 
                 onConfirmBasic={handleStep2BasicConfirm} 
                 isLoading={state.isLoading}
                 onBack={handleBack}
               />
             )}
             {state.currentStep === AppStep.STEP_3_DEEP_VOCAB && state.analysisData && (
                <Step2Deep
                  basicData={state.analysisData}
                  deepAnalysisResult={state.deepVocabResult}
                  onConfirmDeepVocab={handleStep2DeepVocabConfirm}
                  isLoading={state.isLoading}
                  onGenerateMnemonic={handleGenerateMnemonic}
                  onGeneratePolyphonic={handleGeneratePolyphonic}
                  onGenerateShapeSimilar={handleGenerateShapeSimilar}
                  onBack={handleBack}
                />
             )}
             {state.currentStep === AppStep.STEP_3_DEEP_SEGMENTS && state.analysisData && (
                <Step2DeepSegments
                  currentData={state.analysisData}
                  deepSegmentsResult={state.deepSegmentsResult}
                  onConfirmSegments={handleStep2DeepSegmentsConfirm}
                  isLoading={state.isLoading}
                  onRegenerateStrategies={handleRegenerateStrategies}
                  onGenerateSingleStrategy={handleGenerateSingleStrategy}
                  onGenerateRhetoricGuidance={handleGenerateRhetoricGuidance}
                  onBack={handleBack}
                />
             )}
             {state.currentStep === AppStep.STEP_4_VISUALS && (
                <Step3Visuals 
                    visualResult={state.visualResult}
                    onConfirmVisuals={handleStep3Confirm}
                    isLoading={state.isLoading}
                    onBack={handleBack}
                />
             )}
             {state.currentStep === AppStep.STEP_5_CASTING && (
                <Step4Casting 
                    castingResult={state.castingResult}
                    onConfirmCasting={handleStep4Confirm}
                    isLoading={state.isLoading}
                    onBack={handleBack}
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
                  onBack={handleBack}
               />
             )}
          </div>
        </div>
      </main>

      <footer className="p-4 text-center text-slate-500 text-[10px] font-mono tracking-widest uppercase opacity-60">
        V-MAX System Kernel v59.0 &middot; Omni-Architect &middot; Gemini 3.0 Flash
      </footer>
    </div>
  );
}

export default App;