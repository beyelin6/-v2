
export enum AppStep {
  IDLE = 0,
  STEP_1_INPUT = 1,
  STEP_2_BASIC = 2, // 2.0: Basic Info & Core Vocab
  STEP_3_DEEP_VOCAB = 3,  // 2.5: Vocabulary Radiation (Shape-Similar, Polyphonic, Idioms)
  STEP_3_DEEP_SEGMENTS = 4, // 2.75: Segments & Strategies
  STEP_4_VISUALS = 5, // 3.0: Visuals
  STEP_5_CASTING = 6, // 4.0: Casting
  STEP_6_OUTPUT = 7   // 5.0: Output
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
  
  vocabulary: VocabularyItem[]; // Point 4: Radiant Database (Step 2.5)
  segments: SegmentItem[]; // Point 5: Logical Segments (Step 2.75)
  strategies: StrategyItem[]; // Point 7: Treasure Chest (Step 2.75)
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
  consistencyAnalysis?: string; // NEW: Short reasoning from AI
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
  inputMedia: MediaData[] | null;
  
  // Step 2 Data (Basic Analysis)
  basicAnalysisResult: string;
  
  // Step 2.5 Data (Deep Vocab)
  deepVocabResult: string;
  
  // Step 2.75 Data (Deep Segments & Strategies)
  deepSegmentsResult: string;

  analysisData: AnalysisData | null; // Merged Data Accumulator
  
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
  outputNotebookLMGuide: string;
  outputGamifiedQuiz: string; // NEW: Gamified Quiz Output
  
  isLoading: boolean;
  error: string | null;
}

export interface StyleOption {
  code: string;
  name: string;
  desc: string;
}

export const VISUAL_STYLES: StyleOption[] = [
  { code: 'S-01', name: '熱血少年戰鬥', desc: '喚醒動機、戰場隱喻 (Shonen Battle)' },
  { code: 'S-02', name: 'Vtuber 學院', desc: '線上直播、高互動 (Vtuber Academy)' },
  { code: 'S-03', name: '學習漫畫風', desc: '科學原理、歷史連載 (Manga Science)' },
  { code: 'S-04', name: '遊戲化任務地圖', desc: '課程進度、RPG地圖 (Gamified Quest Map)' },
  { code: 'S-05', name: '虛擬立體書', desc: '故事流程、精裝書 (Digital Pop-Up Book)' },
  { code: 'S-10', name: '等距微縮世界', desc: '系統架構、博物館模型 (Isometric Tiny World)' },
  { code: 'S-12', name: 'Lo-Fi 讀書室', desc: '自習陪伴、深夜書房 (Lo-Fi Study Lounge)' },
  { code: 'S-13', name: '拼貼誌手作感', desc: '創意寫作、手作雜誌 (Creative Chaos)' },
  { code: 'S-15', name: '玻璃擬態 UI', desc: '儀表板、未來介面 (Glassmorphism)' },
  { code: 'S-16', name: '吉卜力式自然風', desc: '自然治癒、野外 (Ghibli Nature)' },
  { code: 'S-17', name: '卡哇伊貼紙美學', desc: '國小生活、貼紙簿 (Kawaii Sticker)' },
  { code: 'S-18', name: '韓系條漫卷軸', desc: '手機閱讀、條漫 (Webtoon Scroll)' },
  { code: 'S-19', name: '現代扁平向量', desc: '數學規則、App介面 (Modern Flat)' },
  { code: 'S-20', name: '溫暖色鉛筆', desc: '輔導繪本、交換日記 (Colored Pencil)' },
  { code: 'S-21', name: '夢幻水彩渲染', desc: '散文美感、畫廊 (Watercolor Dream)' },
  { code: 'S-22', name: '東方水墨留白', desc: '古文歷史、卷軸 (Ink Wash Painting)' },
  { code: 'S-23', name: '新海誠光影風', desc: '回憶引導、電影感 (Shinkai Atmospheric)' },
];