
export enum AppStep {
  IDLE = 0,
  STEP_1_INPUT = 1,
  STEP_2_BASIC = 2, // New: Basic Info & Core Vocab
  STEP_3_DEEP = 3,  // Renamed from Analysis: Detailed Segments & Strategies
  STEP_4_VISUALS = 4, // Was 3
  STEP_5_CASTING = 5, // Was 4
  STEP_6_OUTPUT = 6   // Was 5
}

export interface MediaData {
  mimeType: string;
  data: string; // Base64 encoded string
  name?: string;
}

export interface ShapeSimilarItem {
  char: string;
  radical: string;
  words: string;
  explanation?: string; // Radical difference explanation
}

export interface PolyphonicItem {
  zhuyin: string;
  words: string;
  usage: string;
}

export interface IdiomData {
  definition: string;
  relatives: string;
  example: string;
  context?: string; // Real-life usage scenario
}

export interface VocabularyItem {
  word: string;
  zhuyin?: string;
  type: string; // "形近字" | "多音字" | "成語" | other
  
  // Structured Data
  shapeSimilar?: ShapeSimilarItem[];
  mnemonic?: string; // 口訣 or 辨析筆記
  
  polyphonic?: PolyphonicItem[];
  
  idiom?: IdiomData;

  // Fallback
  details?: string;
}

export interface RhetoricItem {
  name: string;
  example: string;
}

export interface PatternItem {
  name: string;
  example: string;
}

export interface SegmentItem {
  title: string;
  summary: string;
  keywords: string[]; // Mind map nodes (Key concepts)
  difficultWords: string[]; // Specific vocabulary in this segment
  
  // NEW: Arrays to support multiple items per segment
  rhetorics: RhetoricItem[]; 
  sentencePatterns: PatternItem[];
  
  deepDive: string;
}

export interface StrategyItem {
  type?: 'Rhetoric' | 'Thinking' | 'Task' | string; // NEW: The 3 Artifacts
  title: string; // Label (Gamified)
  method?: string; // NEW: Methodology (方法論)
  teachingPoint: string; // Insight (教學引導)
  application: string;   // Interaction/Task (微任務)
}

export interface BasicInfo {
  genre: string; // 文體
  grade: string; // 適用年級
  theme: string; // 核心主題
  writingTechnique?: string; // 寫作手法
}

export interface AnalysisData {
  mode: string;
  basicInfo: BasicInfo; // NEW: Step 1 Point 2
  visualStructureRecommendation: string; // NEW: Step 1 Point 6 (Initial suggestion)
  
  coreVocabulary: string[]; // List of all raw characters (生字+認讀字)
  textbookDifficultWords: string[]; // NEW: Specific phrases/terms selected by teacher
  idioms: string[]; // List of idioms found or relevant
  
  vocabulary: VocabularyItem[]; // Point 4: Radiant Database
  segments: SegmentItem[]; // Point 5: Logical Segments
  strategies: StrategyItem[]; // Point 7: Treasure Chest
}

export interface RecStyleItem {
  code: string;
  name: string;
  reason: string;
}

export interface RecMetaphorItem {
  code: string;
  name: string;
  visual: string;
  reason: string;
}

export interface VisualData {
  styles: RecStyleItem[];
  metaphors: RecMetaphorItem[];
}

export interface GuideCandidate {
  id: string;
  name: string;
  type: 'Real' | 'Virtual';
  style: string;
  tone: string;
}

export interface CastingData {
  protagonist: {
    name?: string; // Identity/Name of the character
    gender: string;
    age: string;
    traits: string;
  };
  guides: GuideCandidate[];
  fusionTable: string; // Markdown description of the P3 fusion
}

export interface VMaxState {
  currentStep: AppStep;
  inputText: string;
  inputMedia: MediaData | null;
  
  // Step 2 Data (Basic Analysis)
  basicAnalysisResult: string;
  
  // Step 3 Data (Deep Analysis)
  deepAnalysisResult: string;
  analysisData: AnalysisData | null; // Merged Data
  
  // Step 4 Data (Visuals)
  visualResult: string;
  visualData: VisualData | null;
  selectedStyle: RecStyleItem | null;
  selectedMetaphor: RecMetaphorItem | null;

  // Step 5 Data (Casting)
  castingResult: string;
  castingData: CastingData | null;
  selectedGuide: GuideCandidate | null;
  confirmedProtagonistTraits: string;

  // Step 6 Data (Output)
  finalOutput: string; // Also serves as script output
  outputScript: string;
  outputWorksheet: string;
  outputAssessment: string;
  outputKb: string;
  
  isLoading: boolean;
  error: string | null;
}

export interface StyleOption {
  code: string;
  name: string;
  desc: string;
}

export const VISUAL_STYLES: StyleOption[] = [
  { code: '01', name: '熱血少年戰鬥', desc: '喚醒動機、挑戰困難概念 (Shonen Battle)' },
  { code: '02', name: 'Vtuber 學院', desc: '線上直播、需要高互動課程 (Vtuber Academy)' },
  { code: '03', name: '學習漫畫風', desc: '科學原理、歷史故事 (Manga Science)' },
  { code: '04', name: '遊戲化任務地圖', desc: '課程進度總覽、章節導航 (Gamified Quest Map)' },
  { code: '05', name: '虛擬立體書', desc: '故事敘述、歷史流程 (Digital Pop-Up Book)' },
  { code: '10', name: '等距微縮世界', desc: '系統架構、生態系 (Isometric Tiny World)' },
  { code: '12', name: 'Lo-Fi 讀書室', desc: '自習、閱讀引導 (Lo-Fi Study Lounge)' },
  { code: '13', name: '拼貼誌手作感', desc: '人文社會、創意寫作 (Creative Chaos)' },
  { code: '15', name: '玻璃擬態 UI', desc: '資訊量大的圖解 (Glassmorphism)' },
  { code: '16', name: '吉卜力式自然風', desc: '自然科學、治癒系 (Ghibli Nature)' },
  { code: '17', name: '卡哇伊貼紙美學', desc: '國小、生活化主題 (Kawaii Sticker)' },
  { code: '18', name: '韓系條漫卷軸', desc: '故事性強、手機閱讀 (Webtoon Scroll)' },
  { code: '19', name: '現代扁平向量', desc: '數學幾何、規則說明 (Modern Flat)' },
  { code: '20', name: '溫暖色鉛筆', desc: '繪本教學、班級公約 (Colored Pencil)' },
  { code: '21', name: '夢幻水彩渲染', desc: '國語散文、美感教育 (Watercolor Dream)' },
  { code: '22', name: '東方水墨留白', desc: '成語故事、傳統節慶 (Ink Wash Painting)' },
  { code: '23', name: '新海誠光影風', desc: '寫作引導、情感教育 (Shinkai Atmospheric)' },
];