// 檔案路徑: src/hooks/useVMaxWorkflow.ts
// [DevPartner] 核心業務邏輯封裝：負責狀態管理、IndexedDB 持久化與 AI 流程控制

import { useState, useEffect } from 'react';
import { 
  AppStep, VMaxState, MediaData, AnalysisData, StrategyItem, 
  RecStyleItem, RecMetaphorItem, GuideCandidate, ShapeSimilarItem, PolyphonicItem 
} from '../types';
import { sendMessageToGemini, resetSession, isSessionActive } from '../services/gemini';
import { 
  STEP_1_BASIC_PROMPT_SUFFIX, STEP_2_DEEP_PROMPT_PREFIX, STEP_2_DEEP_VOCAB_PROMPT_SUFFIX, 
  STEP_2_DEEP_SEGMENTS_PROMPT_SUFFIX, REGENERATE_STRATEGIES_PROMPT, GENERATE_SINGLE_STRATEGY_PROMPT, 
  GENERATE_MNEMONIC_PROMPT, GENERATE_POLYPHONIC_PROMPT, GENERATE_SHAPE_SIMILAR_PROMPT, 
  GENERATE_RHETORIC_GUIDANCE_PROMPT, STEP_2_VISUALS_PROMPT, STEP_3_CASTING_PROMPT_PREFIX, 
  STEP_3_CASTING_PROMPT_SUFFIX, STEP_4_GENERATION_PROMPT_PREFIX, STEP_4_GENERATION_PROMPT_SUFFIX, 
  PROMPT_GENERATE_WORKSHEET, PROMPT_GENERATE_ASSESSMENT, PROMPT_GENERATE_KB, PROMPT_GENERATE_NOTEBOOKLM_GUIDE
} from '../constants';
import { saveToDB, loadFromDB } from '../utils';

const LOCAL_STORAGE_STATE_KEY = 'vmax_app_state_v59';

const initialState: VMaxState = {
  currentStep: AppStep.STEP_1_INPUT,
  inputText: '',
  inputMedia: null,
  basicAnalysisResult: '', 
  deepVocabResult: '', 
  deepSegmentsResult: '', 
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
  outputGamifiedQuiz: '', //
  isLoading: false,
  error: null,
};

export function useVMaxWorkflow() {
  const [state, setState] = useState<VMaxState>(initialState);

  // 1. 初始化讀取 IndexedDB
  useEffect(() => {
    const loadState = async () => {
      try {
        const savedState = await loadFromDB(LOCAL_STORAGE_STATE_KEY);
        if (savedState) {
          setState(prev => ({ ...initialState, ...savedState, isLoading: false, error: null }));
        }
      } catch (e) {
        console.error("Failed to load state from IndexedDB", e);
      } finally {
        if (!isSessionActive()) resetSession(); 
      }
    };
    loadState();
  }, []);

  // 2. 狀態變更時寫入 IndexedDB
  useEffect(() => {
    const syncStateToDB = async () => {
      try {
        await saveToDB(LOCAL_STORAGE_STATE_KEY, state);
      } catch (e) {
        console.error("Failed to save state to IndexedDB", e);
      }
    };
    // Debounce saving slightly to avoid thrashing DB on rapid inputs
    const timer = setTimeout(syncStateToDB, 1000);
    return () => clearTimeout(timer);
  }, [state]);

  // 3. 錯誤處理邏輯
  const handleError = (error: any) => {
    console.error("Workflow Error:", error);
    let msg = "發生未預期的錯誤";
    if (typeof error === 'string') msg = error;
    else if (error?.error?.message) msg = error.error.message;
    else if (error instanceof Error) msg = error.message;
    else if (error?.message) msg = error.message;

    const lowerMsg = msg.toLowerCase();
    if (lowerMsg.includes("400") || lowerMsg.includes("invalid_argument")) msg = "請求無效 (400)。輸入內容可能過長、格式不支援，或包含無法處理的字元。";
    else if (lowerMsg.includes("401") || lowerMsg.includes("unauthenticated")) msg = "驗證失敗 (401)。API Key 無效或已過期，請點擊右上角按鈕重新設定。";
    else if (lowerMsg.includes("403") || lowerMsg.includes("permission_denied")) msg = "權限不足 (403)。請檢查 API Key 是否正確，或確認該 GCP 專案已啟用 Gemini API 服務。";
    else if (lowerMsg.includes("404") || lowerMsg.includes("not_found")) msg = "模型未找到 (404)。目前使用的模型可能暫時無法存取或名稱有誤。";
    else if (lowerMsg.includes("429") || lowerMsg.includes("resource_exhausted") || lowerMsg.includes("quota")) msg = "請求次數過多 (429)。API 配額已滿，請稍後再試。";
    else if (lowerMsg.includes("500") || lowerMsg.includes("internal")) msg = "伺服器錯誤 (500)。Google 端發生內部錯誤，請稍後重試。";
    else if (lowerMsg.includes("503") || lowerMsg.includes("unavailable")) msg = "服務暫時無法使用 (503)。伺服器過載或維護中，請稍候再試。";
    else if (lowerMsg.includes("fetch failed") || lowerMsg.includes("networkerror")) msg = "網路連線失敗。請檢查您的網路狀態或 VPN 設定。";
    else if (lowerMsg.includes("safety") || lowerMsg.includes("blocked")) msg = "內容被安全過濾器攔截。請嘗試調整輸入的文字或圖片內容。";
    else if (lowerMsg.includes("candidate_unspecified")) msg = "模型未產生有效回應。可能是內容過於敏感或無法處理。";

    setState(prev => ({ ...prev, isLoading: false, error: msg }));
  };

  const clearError = () => setState(prev => ({ ...prev, error: null }));

  const extractStatus = (text: string) => {
    const match = text.match(/\[STATUS\].*?(\n|$)/);
    return match ? match[0] : undefined;
  };

  const getRecoveryContext = () => {
    if (isSessionActive()) return "";
    return `[SYSTEM: SESSION RESTORED]
The user's session was interrupted. Here is the FULL CONTEXT of the project so far.
[ORIGINAL INPUT TEXT]:\n${state.inputText}
[CURRENT ANALYSIS STATE]:\n${JSON.stringify(state.analysisData || {}, null, 2)}
[INSTRUCTION]:\nResume the process from the last state.`;
  };

  // --- Step Handlers ---
  const handleStep1Analyze = async (text: string, media: MediaData[] | null) => {
    setState(prev => ({ ...prev, isLoading: true, error: null, inputText: text, inputMedia: media }));
    try {
      const promptText = text.trim() ? `[INPUT TEXT/CONTEXT]:\n${text}\n${STEP_1_BASIC_PROMPT_SUFFIX}` : `${STEP_1_BASIC_PROMPT_SUFFIX}`;
      const response = await sendMessageToGemini(promptText, media);
      setState(prev => ({ ...prev, isLoading: false, basicAnalysisResult: response, currentStep: AppStep.STEP_2_BASIC }));
    } catch (e) { handleError(e); }
  };

  const handleStep2BasicConfirm = async (confirmedBasicData: AnalysisData) => {
    setState(prev => ({ ...prev, isLoading: true, error: null, analysisData: confirmedBasicData }));
    try {
      const prompt = `${getRecoveryContext()}\n${STEP_2_DEEP_PROMPT_PREFIX}\n${JSON.stringify(confirmedBasicData, null, 2)}\n${STEP_2_DEEP_VOCAB_PROMPT_SUFFIX}`;
      const response = await sendMessageToGemini(prompt);
      setState(prev => ({ ...prev, isLoading: false, deepVocabResult: response, currentStep: AppStep.STEP_3_DEEP_VOCAB }));
    } catch (e) { handleError(e); }
  };

  const handleStep2DeepVocabConfirm = async (refinedVocabJson: string) => {
    let currentData = state.analysisData;
    try {
      const cleanJson = refinedVocabJson.replace(/```json/g, '').replace(/```/g, '');
      const vocabData = JSON.parse(cleanJson);
      if (currentData) currentData = { ...currentData, vocabulary: vocabData.vocabulary || [] };
    } catch (e) { console.error("Failed to merge vocab data", e); }

    setState(prev => ({ ...prev, isLoading: true, error: null, deepVocabResult: refinedVocabJson, analysisData: currentData }));
    try {
      const response = await sendMessageToGemini(`${getRecoveryContext()}\n${STEP_2_DEEP_SEGMENTS_PROMPT_SUFFIX}`);
      setState(prev => ({ ...prev, isLoading: false, deepSegmentsResult: response, currentStep: AppStep.STEP_3_DEEP_SEGMENTS }));
    } catch (e) { handleError(e); }
  };

  const handleStep2DeepSegmentsConfirm = async (refinedSegmentsJson: string) => {
    let currentData = state.analysisData;
    try {
      const cleanJson = refinedSegmentsJson.replace(/```json/g, '').replace(/```/g, '');
      const segmentData = JSON.parse(cleanJson);
      if (currentData) currentData = { ...currentData, segments: segmentData.segments || [], strategies: segmentData.strategies || [] };
    } catch (e) { console.error("Failed to merge segment data", e); }

    setState(prev => ({ ...prev, isLoading: true, error: null, deepSegmentsResult: refinedSegmentsJson, analysisData: currentData }));
    try {
      const response = await sendMessageToGemini(`${getRecoveryContext()}\n${STEP_2_VISUALS_PROMPT}`);
      setState(prev => ({ ...prev, isLoading: false, visualResult: response, currentStep: AppStep.STEP_4_VISUALS }));
    } catch (e) { handleError(e); }
  };

  // --- Sub-Tools Handlers ---
  const handleRegenerateStrategies = async (currentData: AnalysisData): Promise<StrategyItem[]> => {
    try {
      const prompt = `${getRecoveryContext()}\n[CONTEXT: EXISTING_ANALYSIS_DATA]\n${JSON.stringify(currentData, null, 2)}\n\n${REGENERATE_STRATEGIES_PROMPT}`;
      const response = await sendMessageToGemini(prompt);
      const jsonStr = response.replace(/```json/g, '').replace(/```/g, '');
      const strategies = JSON.parse(jsonStr);
      return Array.isArray(strategies) ? strategies : [];
    } catch (e) { console.error("Strategy Regeneration Error:", e); throw e; }
  };

  const handleGenerateSingleStrategy = async (currentData: AnalysisData, existingStrategies: StrategyItem[], targetType?: string): Promise<StrategyItem | null> => {
    try {
      const existingTitles = existingStrategies.map(s => s.title).join(", ");
      let finalPrompt = `${getRecoveryContext()}\n[CONTEXT: EXISTING_ANALYSIS_DATA]\n${JSON.stringify(currentData, null, 2)}\n[EXISTING_STRATEGIES_TO_AVOID_DUPLICATION]: ${existingTitles}\n\n${GENERATE_SINGLE_STRATEGY_PROMPT}`;
      if (targetType) finalPrompt += `\n\n⚠️ IMPORTANT: You MUST generate a "${targetType}" strategy.`;
      const response = await sendMessageToGemini(finalPrompt);
      const jsonStr = response.replace(/```json/g, '').replace(/```/g, '');
      const strategy = JSON.parse(jsonStr);
      return strategy && strategy.title ? strategy : null;
    } catch (e) { console.error("Single Strategy Gen Error:", e); throw e; }
  };

  const handleGenerateMnemonic = async (chars: ShapeSimilarItem[]): Promise<string> => {
    try {
      const charListStr = chars.map(c => `- ${c.char} (部首: ${c.radical}, 詞: ${c.words})${c.explanation ? ` [備註: ${c.explanation}]` : ''}`).join('\n');
      return (await sendMessageToGemini(`${getRecoveryContext()}\n${GENERATE_MNEMONIC_PROMPT.replace('{CHARACTERS_LIST}', charListStr)}`)).trim();
    } catch (e) { console.error("Mnemonic Gen Error:", e); throw e; }
  };

  const handleGeneratePolyphonic = async (char: string): Promise<PolyphonicItem[]> => {
    try {
      const response = await sendMessageToGemini(`${getRecoveryContext()}\n${GENERATE_POLYPHONIC_PROMPT.replace('{CHAR}', char)}`);
      const result = JSON.parse(response.replace(/```json/g, '').replace(/```/g, ''));
      return Array.isArray(result) ? result : [];
    } catch (e) { console.error("Polyphonic Gen Error:", e); throw e; }
  };

  const handleGenerateShapeSimilar = async (char: string): Promise<ShapeSimilarItem[]> => {
    try {
      const response = await sendMessageToGemini(`${getRecoveryContext()}\n${GENERATE_SHAPE_SIMILAR_PROMPT.replace('{CHAR}', char)}`);
      const result = JSON.parse(response.replace(/```json/g, '').replace(/```/g, ''));
      return Array.isArray(result) ? result : [];
    } catch (e) { console.error("Shape Similar Gen Error:", e); throw e; }
  };

  const handleGenerateRhetoricGuidance = async (segmentTitle: string, rhetoricName: string, rhetoricExample: string) => {
    try {
      const prompt = `${getRecoveryContext()}\n${GENERATE_RHETORIC_GUIDANCE_PROMPT.replace('{SEGMENT_TITLE}', segmentTitle).replace('{RHETORIC_NAME}', rhetoricName).replace('{RHETORIC_EXAMPLE}', rhetoricExample)}`;
      const response = await sendMessageToGemini(prompt);
      return JSON.parse(response.replace(/```json/g, '').replace(/```/g, ''));
    } catch (e) { console.error("Rhetoric Guidance Error:", e); throw e; }
  };

  const handleStep3Confirm = async (style: RecStyleItem, metaphor: RecMetaphorItem) => {
    setState(prev => ({ ...prev, isLoading: true, error: null, selectedStyle: style, selectedMetaphor: metaphor }));
    try {
      const response = await sendMessageToGemini(`${getRecoveryContext()}\n${STEP_3_CASTING_PROMPT_PREFIX}${style.name} (Code: ${style.code})\nMetaphor: ${metaphor.name} (Code: ${metaphor.code})\n${STEP_3_CASTING_PROMPT_SUFFIX}`);
      setState(prev => ({ ...prev, isLoading: false, castingResult: response, currentStep: AppStep.STEP_5_CASTING }));
    } catch (e) { handleError(e); }
  };

  const handleStep4Confirm = async (traits: string, guide: GuideCandidate) => {
    setState(prev => ({ ...prev, isLoading: true, error: null, confirmedProtagonistTraits: traits, selectedGuide: guide }));
    try {
      const response = await sendMessageToGemini(`${getRecoveryContext()}\n${STEP_4_GENERATION_PROMPT_PREFIX}${state.selectedStyle?.name}\nGuide: ${guide.name}\nProtagonist Traits: ${traits}\n${STEP_4_GENERATION_PROMPT_SUFFIX}`);
      setState(prev => ({ ...prev, isLoading: false, outputScript: response, finalOutput: response, currentStep: AppStep.STEP_6_OUTPUT }));
    } catch (e) { handleError(e); }
  };

// 🔄 [UPDATE] 支援 'gamified_quiz' 類型
  const handleGenerateModule = async (type: 'worksheet' | 'assessment' | 'kb' | 'notebooklm_guide' | 'gamified_quiz') => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      let prompt = "";
      if (type === 'worksheet') prompt = PROMPT_GENERATE_WORKSHEET;
      else if (type === 'assessment') prompt = PROMPT_GENERATE_ASSESSMENT;
      else if (type === 'kb') prompt = PROMPT_GENERATE_KB;
      else if (type === 'notebooklm_guide') {
        prompt = PROMPT_GENERATE_NOTEBOOKLM_GUIDE
          .replace('{Guide_Name}', state.selectedGuide?.name || "引導者")
          .replace('{Tone_Description}', state.selectedGuide?.tone || "G1")
          .replace('{Grade}', state.analysisData?.basicInfo.grade || "國小")
          .replace('{Topic}', state.analysisData?.basicInfo.theme || "本課主題");
      } 
      else if (type === 'gamified_quiz') {
        // ➕ 引入我們剛剛新增的 Prompt
        prompt = PROMPT_GENERATE_GAMIFIED_QUIZ; 
      }

      const response = await sendMessageToGemini(`${getRecoveryContext()}\n${prompt}`);
      
      setState(prev => ({
        ...prev, isLoading: false,
        outputWorksheet: type === 'worksheet' ? response : prev.outputWorksheet,
        outputAssessment: type === 'assessment' ? response : prev.outputAssessment,
        outputKb: type === 'kb' ? response : prev.outputKb,
        outputNotebookLMGuide: type === 'notebooklm_guide' ? response : prev.outputNotebookLMGuide,
        outputGamifiedQuiz: type === 'gamified_quiz' ? response : prev.outputGamifiedQuiz, // ➕ 儲存結果
      }));
    } catch (e) { handleError(e); }
  };

  const handleBack = () => {
    setState(prev => {
      let prevStep = AppStep.STEP_1_INPUT;
      switch (prev.currentStep) {
        case AppStep.STEP_2_BASIC: prevStep = AppStep.STEP_1_INPUT; break;
        case AppStep.STEP_3_DEEP_VOCAB: prevStep = AppStep.STEP_2_BASIC; break;
        case AppStep.STEP_3_DEEP_SEGMENTS: prevStep = AppStep.STEP_3_DEEP_VOCAB; break;
        case AppStep.STEP_4_VISUALS: prevStep = AppStep.STEP_3_DEEP_SEGMENTS; break;
        case AppStep.STEP_5_CASTING: prevStep = AppStep.STEP_4_VISUALS; break;
        case AppStep.STEP_6_OUTPUT: prevStep = AppStep.STEP_5_CASTING; break;
      }
      return { ...prev, currentStep: prevStep, error: null, isLoading: false };
    });
  };

  return {
    state,
    setState, // Expose setState if needed for simple updates like error clearing
    clearError,
    extractStatus,
    handleStep1Analyze,
    handleStep2BasicConfirm,
    handleStep2DeepVocabConfirm,
    handleStep2DeepSegmentsConfirm,
    handleRegenerateStrategies,
    handleGenerateSingleStrategy,
    handleGenerateMnemonic,
    handleGeneratePolyphonic,
    handleGenerateShapeSimilar,
    handleGenerateRhetoricGuidance,
    handleStep3Confirm,
    handleStep4Confirm,
    handleGenerateModule,
    handleBack
  };
}
