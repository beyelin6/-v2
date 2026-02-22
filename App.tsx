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
    handleBack,
    handleReset
  } = useVMaxWorkflow();

  const handleApiKeyConfirm = (key: string) => {
    setApiKey(key);
    setShowApiKeyModal(false);
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
    <div className="flex h-screen w-full bg-slate-50 text-slate-800 selection:bg-teal-50 selection:text-teal-900 font-sans overflow-hidden">
      
      <StatusControl 
        step={state.currentStep} 
        statusText={currentStatusText}
        isProcessing={state.isLoading}
        onReset={handleReset}
      />

      <div className="flex-1 flex flex-col min-w-0 h-full relative">
      <main className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
        <div className="max-w-5xl mx-auto w-full relative pb-10">
        <div className="absolute top-0 right-0 z-20">
            <button 
                onClick={() => setShowApiKeyModal(true)}
                className="flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 rounded-lg text-xs font-mono transition-all border border-slate-200 hover:border-slate-300 shadow-sm"
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
           <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center animate-in fade-in zoom-in-95 mt-10 md:mt-0 shadow-sm">
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

        <div className="glass-panel bg-white border border-slate-200 rounded-2xl p-1.5 md:p-2 min-h-[calc(100vh-10rem)] flex flex-col shadow-lg mt-12 md:mt-4 relative overflow-hidden">
          
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
        </div>
      </main>

      <footer className="p-4 text-center text-slate-500 text-[10px] font-mono tracking-widest uppercase opacity-60 bg-slate-50 border-t border-slate-200">
        V-MAX System Kernel v59.3 &middot; Omni-Architect &middot; Focus Reading Mode
      </footer>
      </div>
    </div>
  );
}

export default App;