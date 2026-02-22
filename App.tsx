import React, { useState } from 'react';
import { Key } from 'lucide-react';
import { AppStep } from './types';
import { hasApiKey, setApiKey } from './services/gemini';
import { useVMaxWorkflow } from './hooks/useVMaxWorkflow';

import StatusControl from './components/StatusControl';
import Step1Input from './components/Step1Input';
import Step2Basic from './components/Step2Basic';
import Step2Deep from './components/Step2Deep';
import Step2DeepSegments from './components/Step2DeepSegments';
import Step3Visuals from './components/Step3Visuals';
import Step4Casting from './components/Step4Casting';
import Step5Output from './components/Step5Output';
import ApiKeyModal from './components/ApiKeyModal';

function App() {
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  
  const {
    state,
    setState,
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
  } = useVMaxWorkflow();

  const handleApiKeyConfirm = (key: string) => {
    setApiKey(key);
    setShowApiKeyModal(false);
    // Clear previous error when new key is set
    if (state.error) {
        setState(prev => ({ ...prev, error: null }));
    }
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
    <div className="min-h-screen flex flex-col relative text-slate-700 selection:bg-emerald-200 selection:text-emerald-900">
      
      {/* Ambient Background Effects - Light Mode */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-400/20 rounded-full blur-3xl opacity-40 animate-pulse"></div>
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-purple-400/20 rounded-full blur-3xl opacity-40 animate-pulse delay-1000"></div>
        <div className="absolute bottom-[10%] left-[20%] w-[35%] h-[35%] bg-emerald-400/20 rounded-full blur-3xl opacity-30 animate-pulse delay-2000"></div>
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
                className="flex items-center gap-2 px-3 py-1.5 bg-white/60 hover:bg-white/90 text-slate-600 hover:text-slate-900 rounded-lg text-xs font-mono transition-all border border-slate-200 hover:border-slate-300 backdrop-blur-md shadow-sm"
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
           <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center animate-in fade-in zoom-in-95 mt-10 md:mt-0 shadow-lg backdrop-blur-md">
             <svg className="w-6 h-6 mr-3 flex-shrink-0 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
             <div className="flex-1">
               <p className="font-bold text-lg mb-1 text-red-800">發生錯誤</p>
               <p className="text-sm break-all leading-relaxed opacity-90">{state.error}</p>
             </div>
             <button 
               onClick={() => setState(prev => ({...prev, error: null}))}
               className="ml-4 p-2 hover:bg-red-100 rounded-full transition-colors"
             >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
             </button>
           </div>
        )}

        {/* Main Application Frame */}
        <div className="glass-panel rounded-2xl p-1.5 md:p-2 h-[82vh] flex flex-col shadow-xl mt-8 md:mt-4 relative overflow-hidden bg-white/80 border-white/50">
          {/* Subtle Inner Glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent pointer-events-none"></div>
          
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
                  outputNotebookLMGuide={state.outputNotebookLMGuide}
                  outputGamifiedQuiz={state.outputGamifiedQuiz}
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