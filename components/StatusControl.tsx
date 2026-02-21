import React from 'react';
import { AppStep } from '../types';
import { VMAX_KERNEL_VERSION } from '../constants';
import { Activity, Cpu } from 'lucide-react';

interface StatusControlProps {
  step: AppStep;
  statusText?: string;
  isProcessing: boolean;
}

const StatusControl: React.FC<StatusControlProps> = ({ step, statusText, isProcessing }) => {
  const getStepLabel = () => {
    switch (step) {
        case AppStep.STEP_1_INPUT: return "1.0 INPUT_LOCK";
        case AppStep.STEP_2_BASIC: return "2.0 BASIC_ANALYSIS";
        case AppStep.STEP_3_DEEP_VOCAB: return "2.5 DEEP_RADIATION";
        case AppStep.STEP_3_DEEP_SEGMENTS: return "2.75 LOGIC_DECONSTRUCTION";
        case AppStep.STEP_4_VISUALS: return "3.0 VISUAL_SKIN";
        case AppStep.STEP_5_CASTING: return "4.0 SOUL_CASTING";
        case AppStep.STEP_6_OUTPUT: return "5.0 CORE_GENERATION";
        default: return "SYSTEM_IDLE";
    }
  };

  return (
    <div className="w-full bg-slate-950/70 backdrop-blur-md border-b border-white/10 p-2 font-mono text-xs md:text-sm shadow-lg sticky top-0 z-50 overflow-x-hidden">
      <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* System Status Indicator */}
            <div className="flex items-center space-x-2 bg-slate-900/50 px-2 py-1 rounded border border-white/5">
                <div className={`w-2 h-2 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)] ${isProcessing ? 'bg-amber-400 animate-pulse shadow-amber-500/50' : 'bg-emerald-500'}`} />
                <span className={`text-[10px] font-bold tracking-wider ${isProcessing ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {isProcessing ? "PROCESSING" : "ONLINE"}
                </span>
            </div>

            {/* Step Info */}
            <div className="hidden md:flex items-center space-x-2 text-slate-400">
                <span className="opacity-50">||</span>
                <span className="text-blue-400 font-bold">{getStepLabel()}</span>
                <span className="opacity-50">||</span>
                <span>KERNEL: {VMAX_KERNEL_VERSION}</span>
            </div>
          </div>

          {/* Scrolling Log (Simplified) */}
          <div className="flex-1 text-right truncate pl-4 text-slate-500 text-[10px]">
             {statusText ? (
                 <span className="text-emerald-500/80 animate-pulse">{statusText}</span>
             ) : (
                 <span className="opacity-30">AWAITING INPUT STREAM...</span>
             )}
          </div>
      </div>
      
      {/* Loading Progress Bar Line */}
      {isProcessing && (
          <div className="absolute bottom-0 left-0 w-full h-[1px] bg-slate-800">
              <div className="h-full bg-gradient-to-r from-transparent via-blue-500 to-transparent w-1/3 animate-[shimmer_1.5s_infinite_linear]"></div>
          </div>
      )}
      <style>{`
        @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(300%); }
        }
      `}</style>
    </div>
  );
};

export default StatusControl;