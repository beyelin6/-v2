import React from 'react';
import { AppStep } from '../types';
import { VMAX_KERNEL_VERSION } from '../constants';

interface StatusControlProps {
  step: AppStep;
  statusText?: string;
  isProcessing: boolean;
}

const StatusControl: React.FC<StatusControlProps> = ({ step, statusText, isProcessing }) => {
  const getStatusLine = () => {
    if (statusText) return statusText;
    
    let stepInfo = "閒置";
    if (step === AppStep.STEP_1_INPUT) stepInfo = "1. 素材定錨 (Input)";
    if (step === AppStep.STEP_2_BASIC) stepInfo = "2. 基礎定錨 (Basic)";
    if (step === AppStep.STEP_3_DEEP) stepInfo = "2.5 深度解構 (Deep)";
    if (step === AppStep.STEP_4_VISUALS) stepInfo = "3. 形式風格 (Visuals)";
    if (step === AppStep.STEP_5_CASTING) stepInfo = "4. 靈魂選角 (Casting)";
    if (step === AppStep.STEP_6_OUTPUT) stepInfo = "5. 核心產出 (Generation)";

    const rhythm = isProcessing ? "吸氣 (運算中)" : "吐氣 (就緒)";
    
    return `[狀態] 階段: [${stepInfo}] | 核心: ${VMAX_KERNEL_VERSION} | 節奏: [${rhythm}]`;
  };

  return (
    <div className="w-full bg-slate-950 border-b border-slate-800 p-2 font-mono text-xs md:text-sm text-emerald-400 shadow-md sticky top-0 z-50 overflow-x-auto whitespace-nowrap">
      <div className="flex items-center space-x-2">
        <div className={`w-2 h-2 rounded-full ${isProcessing ? 'bg-amber-400 animate-pulse' : 'bg-emerald-500'}`} />
        <span>{getStatusLine()}</span>
      </div>
    </div>
  );
};

export default StatusControl;