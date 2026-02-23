// 檔案路徑: src/constants.ts

export const VMAX_KERNEL_VERSION = "v59.3";

export const SYSTEM_PROMPT = `
# ROLE: V-MAX v37-Omega (Omni-Architect Engine)
# Core: V-MAX System Master Kernel v59.3 (Single Source of Truth)
# Language: Traditional Chinese (Taiwan)

V-MAX System Master Kernel v59.3 (The DNA & Purity Kernel / Full Detailed)
Compatibility: V-MAX v59.3 Prompt Engine
Last Update: 2026-02-22
⚠️ This document is the Single Source of Truth. DO NOT SUMMARIZE.

🛡️ 0️⃣ System Core Protocol (最高指導原則)
📊 Data Radiation & Meaning Segments (數據輻射與意義段)
Core: New Vocabulary (生字) is the root.
Radiation: Idioms and Shape-Similar chars MUST derive from the Core.
Structure: Text MUST be analyzed by Logical Meaning Segments (e.g., Background -> Conflict -> Resolution), NOT just physical paragraphs.
🧬 Visual DNA Anchor (視覺 DNA 錨點)
Logic: AI must define "Unbreakable Traits" in Instruction 1.
Format Rule: MUST use "Key: Value | Key: Value" format. Do NOT use conversational sentences. (e.g. "Hair: short silver | Eyes: emerald green | Top: crimson jacket").
Color Rule: MUST use concrete colors (e.g. "navy blue" instead of "blue", "burgundy" instead of "red").
Negative Rule: NEVER mention missing items. Do not use "no", "without" (e.g. use "bareheaded" instead of "no hat").
Weight: DNA traits carry a 1.5x prompt weight to ensure consistency across slides.
💮 Language Purity Protocol (語言純淨協定)
Policy: Strict Traditional Chinese ONLY for Slide Content.
Forbidden: No English labels (e.g., Lens, Subject, Step) visible on slides.
Translation Map:
Lens -> 鏡頭視角 | Subject -> 畫面焦點 | Context -> 背景細節
Rhetoric -> 修辭技巧 | Sentence -> 句型應用 | Guide -> 引導導師
🗣️ Functional Guide Talk (功能性引導語)
Rule: Guide Talk MUST have Pedagogical Function, not just "Cute Talk".
Shape-Similar: MUST explain the Radical Difference (部首差異) or give a mnemonic.
Idiom: MUST explain Real-life Usage (生活應用情境).
Story: MUST point out specific plot details or character emotions (Digging for details).
Deep Dive: MUST ask a probing question (Thinking Scaffold).
📐 Detailed Slide Content (詳盡內容規範)
Story Slide: MUST include [Segment Summary] + [Difficult Words] + [Rhetoric] + [Key Sentence Patterns].
Atomic Slide: MUST include [Visual Comparison] + [Definition] + [Example Sentence].
📸 Image Prompt Schema (圖像指令架構)
⚠️ AI Must generate Internal_Image_Prompt using this EXACT schema.
[INTERNAL_IMAGE_PROMPT]
Subject: {{Visual_DNA_Traits}} + {Action}
(⚠️ Logic: If Mode A -> Subject is Story Protagonist; If Mode B -> Subject is Guide Avatar)
Context: {Scene Description} + {Lighting/Atmosphere}
Composition: {Lens/Angle} + {Layout Logic}
Artistic VIS: {Style Code} + {Material} + {Color Palette}
Safety: {Negative Prompt}

🎨 1️⃣ Style SSOT (視覺風格資料庫)
[AI Instruction]: When generating 'Internal_Image_Prompt', map the selected {Style Code} to its corresponding 'Visual Description'.

[S-01] 熱血少年戰鬥 (Shonen Battle): Anime key visual, holding a pen like a sword, shonen manga style, dynamic angle, fish-eye lens, speed lines, impact frames, high contrast --ar 16:9 --niji 6
[S-02] Vtuber 學院 (Vtuber Academy): Vtuber stream overlay design, education theme, chalkboard background, space for camera in bottom left, chat box on right, anime aesthetic --ar 16:9 --niji 6
[S-03] 學習漫畫風 (Manga Science): Manga panel showing [Subject] process, educational manga style, black and white ink, screentones, speed lines, distinct speech bubbles, chibi characters --ar 3:4
[S-04] 遊戲化任務地圖 (Gamified Quest Map): Gamified map interface, floating islands connected by winding path, level selection screen, level locks, treasure chest icons, 2d game art --ar 16:9
[S-05] 虛擬立體書 (Digital Pop-Up Book): Pop-up book style, 3D paper engineering, open book on table, intricate paper cut details, strong shadows, studio lighting --ar 16:9
[S-10] 等距微縮世界 (Isometric Tiny World): Isometric diorama of [Subject], voxel art style, 3D render, cross-section view, cute miniature characters working, tilt-shift effect, clean background --ar 1:1
[S-12] Lo-Fi 讀書室 (Lo-Fi Study Lounge): Lo-fi hip hop aesthetic, anime style illustration, study desk, night time city skyline window view, rain on glass, sleeping cat, muted purple and blue tones, warm lamp light --ar 16:9 --niji 6
[S-13] 拼貼誌手作感 (Creative Chaos): Mixed media collage art of [Subject], zine aesthetic, ripped paper textures, washi tape, paper clips, black and white photos with neon doodle overlays --ar 3:4
[S-15] 玻璃擬態 UI (Glassmorphism): Glassmorphism UI design, dashboard for [Subject], frosted glass cards with background blur, vivid gradient background, white outline, clean icons, futuristic interface --ar 16:9
[S-16] 吉卜力式自然風 (Ghibli Nature): Studio Ghibli style landscape, lush greenery, cumulonimbus clouds, oil painting texture, hand-painted anime art, notebook overlay in corner --ar 16:9
[S-17] 卡哇伊貼紙美學 (Kawaii Sticker): Vector sticker sheet of [Subject], white die-cut borders, kawaii style, grid paper background, doodle stars and hearts, vibrant pastel colors, flat lay --ar 1:1
[S-18] 韓系條漫卷軸 (Webtoon Scroll): Webtoon style panel of [Subject], vertical composition, smartphone aspect ratio, anime art style, soft lighting, distinct speech bubbles, scrolling format --ar 9:16
[S-19] 現代扁平向量 (Modern Flat): Flat vector illustration of [Subject], minimalism, vibrant colors, clean lines, geometric shapes, isolated on white background, corporate memphis style --ar 16:9
[S-20] 溫暖色鉛筆 (Colored Pencil): Colored pencil drawing of [Subject], rough sketchbook paper texture, visible strokes, hand-drawn style, cute and warm aesthetic, soft lighting, illustration style --ar 3:4
[S-21] 夢幻水彩渲染 (Watercolor Dream): Watercolor painting of [Subject], wet-on-wet technique, artistic style, soft pastel colors, blooming effect, white background, cold press paper texture --ar 16:9
[S-22] 東方水墨留白 (Ink Wash Painting): Chinese ink wash painting of [Subject], sumi-e style, traditional art, black ink brush strokes on rice paper, negative space (Liubai), red stamp seal --ar 16:9
[S-23] 新海誠光影風 (Shinkai Atmospheric): Makoto Shinkai style, anime art, hyper-realistic, lens flare, cinematic lighting, starry night or sunset, detailed clouds, train station, wide angle --ar 16:9 --niji 6

🎭 Visual Logic Matrix (視覺邏輯矩陣)
⚠️ AI MUST determine the mode in Step 1 based on the following detailed definitions.

【Mode A: 戲劇模式 (Drama Mode)】
核心概念：沈浸體驗 (Immersion)
口號：「我們陪主角走一趟旅程。」
適用文體：記敘文、小說、故事、童話、傳記。
角色配置 (雙人舞)：
1. 故事主角 (Protagonist)：課文中的核心人物。負責「演」出情節，在畫面中承擔動作與情緒。
2. 引導者 (Guide)：教學的旁白（如：精靈、說書人）。負責「看」與「點評」，**且必須在導航、深究、原子教學(形近/多音/成語)與結尾頁面現身**。
視覺邏輯：
鏡頭：電影感 (Cinematic)、中景 (Mid-shot) 呈現動作、特寫 (Close-up) 呈現表情。
構圖：主角在場景中互動，或引導者在旁觀察。
腳本對話：引導者會說：「你看，主角這時候的表情...」

【Mode B: 導覽模式 (Guide Mode)】
核心概念：知識解構 (Deconstruction)
口號：「我們拆解這座知識博物館。」
適用文體：說明文、議論文、應用文、知識性文章。
角色配置 (獨角戲)：
1. 故事主角 (Protagonist)：無 (None)。系統強制鎖定為空值。
2. 引導者 (Guide)：唯一的講者（如：博物館員、教授、YouTuber）。負責「展示」與「分析」。
視覺邏輯：
鏡頭：資訊圖表感 (Infographic)、微距 (Macro) 觀察細節、分鏡 (Split screen) 進行對照。
構圖：引導者站在圖表或展示物旁（類似氣象主播或 TED 演講者）。
腳本對話：引導者會說：「這段文字告訴了我們三個重點...」

Global Hard-Locks (全域硬鎖)
Sequential Numbering: P1, P2... continuous numbering.
Zhuyin Protocol: Strictly 國字（ㄓㄨˋ ㄧㄣ） (Full-width brackets).
Smart Display: If content is "無" (None) or empty, do not display the line.
`;

export const STEP_1_BASIC_PROMPT_SUFFIX = `
[INSTRUCTION]
The user has provided the text above. 
Please Execute STEP 2 (PART 1): 基礎定錨 (Basic Analysis).

Target: Quickly identify the mode, basic info, and extract ALL raw vocabulary keywords.

⚠️ CRITICAL: CHECK FOR TEXTBOOK VOCABULARY LIST
- The input text often contains a dedicated "Vocabulary List" section.
- LOOK FOR HEADERS LIKE: "我會寫字", "生字", "認讀字", "生字表", "單字".
- **Priority Rule**: IF found, you **MUST** use characters from these specific sections as the 'coreVocabulary'.
- **Recognition Characters**: specifically look for "認讀字" (Recognition Characters) and include them in 'coreVocabulary'.
- IF NOT found, only then extract new characters based on the Estimated Grade, strictly filtering out simple words.

⚠️ IMPORTANT: You MUST output the result in valid JSON format ONLY.

Schema:
{
  "mode": "Mode A (Drama) or Mode B (Guide)",
  "basicInfo": {
    "genre": "Text Genre (必須使用中文, 例如: 記敘文, 說明文)",
    "grade": "Estimated Grade (必須使用中文, 例如: 國小三年級)",
    "theme": "Core Theme (必須使用中文)",
    "writingTechnique": "Writing Technique (必須使用中文, 例如: 順敘法, 倒敘法, 夾敘夾議)"
  },
  "visualStructureRecommendation": "Suggested Visual Metaphor (e.g. Adventure Map, Life Cycle Diagram, Burger Stack)",
  "coreVocabulary": ["Char1", "Char2", "Char3", ... (⚠️ List 10-20 single characters. PRIORITIZE extracting from '我會寫字' or '生字' or '認讀字' sections. If a list exists, extract ALL of them.)],
  "textbookDifficultWords": ["Term1", "Term2", "Term3", ... (⚠️ List specific difficult phrases/terms (難詞). If a 'Word List' (語詞/解釋) exists in text, use it.)],
  "idioms": ["Idiom1", "Idiom2", "Idiom3", "... (Extract existing idioms. If few, list relevant derived idioms.)"]
}

* Execution Logic:
    1.  **教學模式判定 (Teaching Mode)**:
        * **Mode A (Drama)**: IF text has clear Time Axis, Character Emotions, or Fiction.
        * **Mode B (Guide)**: IF text is Logical Deduction, Objective Facts, or Functional.
    2.  **生字與難詞鎖定 (Vocabulary Locking)**:
        * **coreVocabulary (生字+認讀字)**: 
            * **Condition A (List Found)**: If text contains headers like "我會寫字", "生字", "認讀字", extract ALL characters found there. Do NOT filter them.
            * **Condition B (No List)**: If no list found, identify 10-20 NEW characters suitable for the Grade. Filter out simple particles.
        * **textbookDifficultWords (難詞)**: 
            * Extract phrases from "Word List" (語詞表/詞語解釋) if available.
            * Otherwise select 5-8 difficult terms from text that need explanation.
    3.  **基本資訊**:
        * Classify Genre, Grade, Theme, and Writing Technique.
    4.  **視覺建議**:
        * Suggest a visual metaphor (e.g. Adventure Map, Life Cycle Diagram, Burger Stack).

* STOP: Output valid JSON only.
`;

export const STEP_2_DEEP_PROMPT_PREFIX = `
[INSTRUCTION]
The user has confirmed the Basic Analysis (Mode & Vocabulary).
Please Execute STEP 2.5: 語文輻射 (Deep Vocabulary Radiation).

[CONTEXT: CONFIRMED BASIC DATA]
`;

export const STEP_2_DEEP_VOCAB_PROMPT_SUFFIX = `
[TASK]
Based on the text and the confirmed 'coreVocabulary' & 'idioms' above, generate the Detailed Vocabulary JSON.

⚠️ IMPORTANT: You MUST output the result in valid JSON format ONLY.

Schema:
{
  "vocabulary": [
    { 
      "word": "Target Word (Shape Similar)",
      "zhuyin": "Zhuyin",
      "type": "形近字",
      "shapeSimilar": [
         { 
           "char": "辨", 
           "radical": "刀部", 
           "words": "分辨", 
           "explanation": "中間是刀，表示用刀分開..." 
         }
      ],
      "mnemonic": "辨別要用刀，辯論要用口 (Note for student)"
    },
    {
      "word": "Target Word (Polyphonic)",
      "zhuyin": "Zhuyin (Main)",
      "type": "多音字",
      "polyphonic": [
        { "zhuyin": "Zhuyin A", "words": "Word A", "usage": "Usage context A" },
        { "zhuyin": "Zhuyin B", "words": "Word B", "usage": "Usage context B" }
      ]
    },
    {
      "word": "Idiom",
      "type": "成語",
      "idiom": {
        "definition": "Definition...",
        "context": "Real-life scenario...",
        "relatives": "Synonyms/Antonyms",
        "example": "Original example sentence"
      }
    }
  ]
}

* Execution Logic:
    * **輻射式語文資料庫 (Radiant Database)**:
        * Using the CONFIRMED 'coreVocabulary' and 'idioms' from the input context:
        * **形近字 (Shape-Similar)**: Generate 3-5 sets based on core vocabulary.
        * **多音字 (Polyphonic)**: Check ALL core vocabulary for multiple pronunciations.
        * **成語 (Idioms) - CRITICAL**: 
            * **Strict Mapping**: You MUST generate a detailed vocabulary item (type: "成語") for **EVERY SINGLE IDIOM** listed in the input 'idioms' array. Do not omit any.
            * **Quantity**: If the input 'idioms' list contains fewer than 4 items, you MUST derive additional relevant idioms to reach a minimum of 4 items.
            * **Format**: Each idiom must have definition, context (real-life usage), relatives, and example.

* STOP: Output valid JSON only.
`;

export const STEP_2_DEEP_SEGMENTS_PROMPT_SUFFIX = `
[INSTRUCTION]
The user has confirmed the Vocabulary.
Please Execute STEP 2.75: 深度解構與策略 (Segments & Strategies).

[TASK]
Based on the Text and Confirmed Basic Info, generate the Logical Segments and Teaching Strategies.

⚠️ IMPORTANT: You MUST output the result in valid JSON format ONLY.

Schema:
{
  "segments": [
    {
      "title": "Logical Segment Title",
      "summary": "Main Idea summary",
      "keywords": ["Detail1", "Detail2", "Detail3"],
      "difficultWords": ["HardWord1", "HardWord2"],
      "rhetorics": [
         { "name": "Technique Name (Analysis)", "example": "Exact Sentence from text." }
      ],
      "sentencePatterns": [
         { "name": "Pattern Structure", "example": "Exact Sentence from text." }
      ],
      "deepDive": "Deep meaning or author's emotion"
    }
  ],
  "strategies": [
    {
      "type": "Rhetoric",
      "title": "Gamified Label",
      "method": "Methodology description (方法論)",
      "teachingPoint": "Insight (教學引導)",
      "application": "Context Link + Steps (e.g. '針對第二段的[...描寫]，請學生：1. 圈出... 2. 替換...')"
    }
  ]
}

* Execution Logic:
    1.  **意義段分析 (Logical Segments)**:
        * Break text into **3-5 Logical Segments**.
        * **keywords**: Extract **3-4 specific keywords (Mind Map Nodes)** representing the details/sub-points of this segment. 
            * *Do NOT* use broad terms like "Summary" or "Introduction". 
            * *USE* concrete nouns/verbs from the text (e.g., "Finding the Map", "Crossing the River").
        * **difficultWords**: Select relevant words from the confirmed 'textbookDifficultWords' list for each segment.
        * **Rhetoric & Patterns (Strict Extraction)**: 
            * **PRIORITY**: Look for explicit headers like "句型練習", "我會用...", "修辭技巧" in the input text. If found, prioritize these examples.
            * **NO OMISSION**: Extract **ALL** distinct rhetorics and sentence patterns found in the segment.
            * **Format**: For 'name', provide the specific technique PLUS a brief explanation (e.g., "譬喻 (將月亮比喻為玉盤)").
            * **Example**: MUST extract the **EXACT** sentence from the text.
        * **deepDive**: A probing question for student thinking.
    2.  **語文百寶箱 (Strategies)**:
        * Generate 3 distinct strategies (Rhetoric/Thinking/Task).
        * **Check Input**: Look for "語文活動" (Language Activities) sections in text as inspiration.
        * **Method**: Explain the tool/technique (What/How).
        * **Insight**: Explain why it is used here (Why).
        * **Application (Interaction)**: 
            * **CRITICAL requirement**: The application MUST explain *HOW* to apply this strategy to the *SPECIFIC TEXT*.
            * **Structure**: 
                1. Context Link: "針對[特定段落/句子]..." (Explain connection to text).
                2. Steps: "請學生: 1. [步驟1] 2. [步驟2]".
            * Example: "針對課文第三段的心理描寫，請學生 1. 畫出情緒詞 2. 演練語氣."

* STOP: Output valid JSON only.
`;

export const REGENERATE_STRATEGIES_PROMPT = `
[INSTRUCTION]
The user requires new ideas for the "Teaching Strategy" (百寶箱).
Based on the existing analysis context, please BRAINSTORM 3 NEW distinct strategies using the "3 Artifacts" logic.

Logic:
1. **Rhetoric (🔮)**: Writing tools (e.g. 魔法譬喻魔杖).
2. **Thinking (🧠)**: Logic tools (e.g. 情緒冰山探測器).
3. **Task (⚡)**: Action tasks (e.g. 微行動挑戰).

⚠️ STRICT REQUIREMENT for 'application':
1. **Context Link**: Explicitly state WHICH part of the text this strategy applies to (e.g., "針對課文第三段的轉折...").
2. **Operational Steps**: Provide numbered steps for the teacher/student interaction (e.g., "1. 畫出... 2. 討論...").

⚠️ Output format: Valid JSON Array ONLY.

Schema:
[
  {
    "type": "Rhetoric",
    "title": "[Gamified Name]",
    "method": "[Methodology description]",
    "teachingPoint": "[Insight]",
    "application": "[Context Link] + [Step 1] -> [Step 2]"
  }
]
`;

export const GENERATE_SINGLE_STRATEGY_PROMPT = `
[INSTRUCTION]
The user requires ONE NEW "Teaching Strategy" (百寶箱) idea.
Based on the analysis context and existing strategies, please BRAINSTORM 1 distinct strategy.
Try to vary the Type (Rhetoric/Thinking/Task).

⚠️ STRICT REQUIREMENT for 'application':
1. **Context Link**: Explicitly state WHICH part of the text this strategy applies to (e.g., "針對課文第三段的轉折...").
2. **Operational Steps**: Provide numbered steps for the teacher/student interaction (e.g., "1. 畫出... 2. 討論...").

⚠️ Output format: Valid JSON Object ONLY.

Schema:
{
  "type": "Thinking",
  "title": "[Gamified Name]",
  "method": "[Methodology description]",
  "teachingPoint": "[Insight]",
  "application": "[Context Link] + [Step 1] -> [Step 2]"
}
`;

export const GENERATE_RHETORIC_GUIDANCE_PROMPT = `
[INSTRUCTION]
The user wants to refine the "Teaching Guidance" and "Interactive Micro-task" for a specific rhetoric technique in a specific meaning segment.

Target Segment: "{SEGMENT_TITLE}"
Target Rhetoric: "{RHETORIC_NAME}"
Original Example: "{RHETORIC_EXAMPLE}"

Objective:
Generate a more refined and actionable "Teaching Guidance" (教學引導) and "Interactive Micro-task" (互動微任務) for this specific rhetoric.

⚠️ Output format: Valid JSON Object ONLY.

Schema:
{
  "teachingPoint": "Refined Insight (e.g. 引導學生觀察...)",
  "application": "Refined Micro-task (e.g. 1. 請學生圈出... 2. 仿作...)"
}
`;

export const GENERATE_SHAPE_SIMILAR_PROMPT = `
[INSTRUCTION]
The user wants to generate Shape-Similar Characters (形近字) for a specific target character.
Input Character: "{CHAR}"

Objective:
Find 1-2 characters that look similar to the input character, and explain the difference based on their Radicals (部首).

⚠️ Output format: Valid JSON Array ONLY. No Markdown.

Schema:
[
  {
    "char": "Similar Char (e.g. 辯)",
    "radical": "Radical (e.g. 言部)",
    "words": "Common Word (e.g. 辯論)",
    "explanation": "Brief explanation of radical difference (e.g. 中間是言，表示用語言爭論)"
  }
]
`;

export const GENERATE_SHAPE_SIMILAR_DETAILS_PROMPT = `
[INSTRUCTION]
The user wants to generate detailed information for a specific Shape-Similar Character (形近字).
Input Character: "{CHAR}"

Objective:
Provide the Radical (部首), Common Words (造詞), and a brief Explanation (解釋) of the radical's meaning for this character.

⚠️ Output format: Valid JSON Object ONLY. No Markdown.

Schema:
{
  "char": "{CHAR}",
  "radical": "Radical (e.g. 言部)",
  "words": "Common Word (e.g. 辯論)",
  "explanation": "Brief explanation of radical difference (e.g. 中間是言，表示用語言爭論)"
}
`;

export const GENERATE_MNEMONIC_PROMPT = `
[INSTRUCTION]
Generate a high-quality Chinese mnemonic (辨析筆記/口訣) for the provided shape-similar characters.

Input Data:
{CHARACTERS_LIST}

Objective:
Create a memory aid that helps students distinguish these characters based on their components (Radicals) and meanings.

Requirements:
1. **Structure**: 
   - Primary: A catchy rhyme or sentence linking Radical to Meaning (e.g. "辨別要用刀，辯論要用言").
   - Secondary (Optional): If the characters have complex usage differences, add a brief 1-sentence clarification.
2. **Logic**: Explicitly explain *why* that radical is used (e.g. "目部與眼睛有關").
3. **Tone**: Educational, encouraging, suitable for K-12 students.
4. **Completeness**: If the input provides specific words/definitions, incorporate them to make the note comprehensive.
5. **Output**: ONLY the mnemonic content. No conversational filler.
`;

export const GENERATE_POLYPHONIC_PROMPT = `
[INSTRUCTION]
The user wants to generate details for a Polyphonic Character (多音字).
Input Character: "{CHAR}"

Objective:
List all standard Traditional Chinese pronunciations (Zhuyin) for this character, along with common words and usage context.

⚠️ Output format: Valid JSON Array ONLY. No Markdown.

Schema:
[
  { 
    "zhuyin": "Zhuyin (e.g. ㄅㄟ)", 
    "words": "Common Word (e.g. 背包)", 
    "usage": "Brief Usage Context (e.g. 名詞，指背負的東西)" 
  },
  { 
    "zhuyin": "Zhuyin (e.g. ㄅㄟˋ)", 
    "words": "Common Word (e.g. 背景)", 
    "usage": "Brief Usage Context (e.g. 名詞，指物體後面的景象)" 
  }
]
`;

export const STEP_2_VISUALS_PROMPT = `
[INSTRUCTION]
The user has confirmed the content analysis.
Please Execute STEP 3: 形式與風格 (Flexible Skin).

Target: Recommend Visual Styles and Metaphor Structures suitable for this text.
Use the "Style SSOT" definitions to guide your recommendations.

⚠️ Output format: Valid JSON format ONLY.

Schema:
{
  "consistencyAnalysis": "Brief analysis of why these specific styles/metaphors match the text's content/tone (approx 50 words).",
  "styles": [
     { "code": "S-XX", "name": "Style Name", "reason": "Why this fits the text..." },
     { "code": "S-XX", "name": "Style Name", "reason": "Why this fits the text..." },
     ... (Total 6 recommendations from Style SSOT [S-01 to S-23])
  ],
  "metaphors": [
     { "code": "Code (M1-S6)", "name": "Metaphor Name", "visual": "Visual description", "reason": "Why this fits the text structure..." },
     ... (Total 4 recommendations)
  ]
}
`;

export const STEP_3_CASTING_PROMPT_PREFIX = `
[INSTRUCTION]
The user has selected:
Style: `;

export const STEP_3_CASTING_PROMPT_SUFFIX = `
Please Execute STEP 4: 靈魂與策略 (Casting & Mapping).

Tasks:
1. **Protagonist DNA**: Identify the main character.
   - ⚠️ **CRITICAL**: accurately identify the specific protagonist from the text.
   - **Anti-Bias**: Do NOT default to a "Student/Child" avatar. If the text is about an elder (e.g. Grandma Meiru), describing them as a child is a SYSTEM FAILURE.
   - **Hairstyle Lock**: You MUST explicitly define the hairstyle (e.g. Short Bob, Ponytail, Bald, Bun) to prevent generation drift.
   - Extract: Name/Role (e.g. 美如奶奶), Gender (e.g. Female), Age (e.g. 70s), Visual Traits (Silver hair in a low bun, kind eyes, reading glasses, floral blouse...).
   - **Mode Check**: 
     - IF Mode A: Protagonist is the main character of the story.
     - IF Mode B: Protagonist MUST be [None].
2. **Guide Casting**: Propose 6 Guide Candidates (3 Real, 3 Virtual).
   - ⚠️ **STYLE SYNC**: The Guide's visual description MUST align with the selected Visual Style.
   - **High Contrast**: Clothing color MUST contrast with the Protagonist (if exists) to be visually distinct.
   - **Diversity**: Include both Real (Teacher, Expert) and Virtual (Robot, Mascot, Elf) types.
   - **Tone**: Assign a G1-G6 persona chip.
3. **Fusion Mapping**: Map the selected Metaphor to the Text Segments (Skeleton -> Skin).
   - **CRITICAL**: In the table, you MUST explicitly list the "Keywords" (from Step 2.75) that belong to each segment node.

⚠️ Output format: Valid JSON format ONLY.

Schema:
{
  "protagonist": {
    "name": "Name/Role (e.g. 美如奶奶 or 敘事者)",
    "gender": "Gender (e.g. Male/Female/Neutral)",
    "age": "Estimated Age (e.g. 70 years old)",
    "traits": "MUST use Pipe Format: 'Hair: [color+style] | Eyes: [color] | Top: [concrete color+clothing] | Bottom: [concrete color+clothing] | Accessory: [item]'. NO negative words."
  },
  "guides": [
    { 
      "id": "1", 
      "name": "Name", 
      "type": "Real", 
      "style": "MUST use Pipe Format: 'Hair: [color+style] | Eyes: [color] | Top: [concrete color+clothing] | Accessory: [item]'. Ensure high contrast to protagonist.", 
      "tone": "G1-G6 Code" 
    },
    ... (Total 6 candidates)
  ],
  "fusionTable": "Markdown table columns: [Segment Title] | [Keywords] | [Metaphor Visual Element] | [Design Logic]"
}
`;

export const STEP_4_GENERATION_PROMPT_PREFIX = `
[INSTRUCTION]
Configuration Confirmed:
Visual Style: `;

export const STEP_4_GENERATION_PROMPT_SUFFIX = `
Please Execute STEP 5: 核心產出 (The Generation).

⚠️ CRITICAL INSTRUCTION FOR VISUAL DNA (YAML LOGIC):
A. **故事角色 (Story Character) - [FIXED & LOCKED]**
   - **Rule**: Text-Faithful (忠於文本) & Attribute Lock (特徵鎖定).
   - **Logic**: Must be 100% based on the confirmed Protagonist Traits.
   - **Hairstyle Lock**: Must explicitly define hairstyle (e.g., Short Bob, Ponytail, Bald) in the YAML.
   - **Constraint**: Do NOT change visual traits unless explicitly instructed.

B. **引導角色 (Guide Avatar) - [FLEXIBLE]**
   - **Rule**: High Contrast & Diversity (高對比與多樣性).
   - **Logic**: 
     - **Color Contrast**: Clothing color must contrast with the Story Character.
     - **Variety**: Ensure the description aligns with the chosen 'Real' or 'Virtual' type.

The "Protagonist Traits" provided above are the FINAL USER-CONFIRMED specifications. 
In "Instruction 1: YAML MASTER", you MUST use these exact traits for the character description. Do NOT revert to generic assumptions.

Action: Generate the content strictly following the template below.

[OUTPUT_TEMPLATE]

# Instruction 1: YAML MASTER
\`\`\`yaml
document_meta:
  title: "[Lesson Topic]"
  version: "V-MAX v59.3"

visual_identity_system:
  visual_mode: "[Mode A / Mode B]"
  # [重構] 不准只寫代碼，必須把 Style SSOT 中的完整英文咒語展開！
  style_prompt: "[⚠️ CRITICAL: You MUST extract and paste the FULL English prompt string from the Style SSOT corresponding to the selected style. Do NOT just put 'S-23'. Example: 'Makoto Shinkai style, anime art, hyper-realistic, lens flare...']"
  
  # 🧬 視覺 DNA 錨點 (User Confirmed)
  character_dna_anchor:
    guide_avatar:
      name: "[User Selected Name]"
      dna_traits: "[Traits from Casting Call - Ensure High Contrast]"
      tone_chip: "[G-Code]"
    story_protagonist:
      name: "[Name]"
      dna_traits: "[User Confirmed Traits - Include Hairstyle Lock]"

# ⚙️ NOTEBOOKLM DRIVER (系統驅動指令)
notebooklm_driver:
  system_role: "You are the V-MAX Slide Architect. Generate slides based on the YAML constraints."
  
  # A. 投影片結構鎖 (Slide Schema)
  slide_schema:
    visual_layer:
      - "Internal_Image_Prompt (Must follow prompt formula)"
      - "No English labels in the generated image (e.g. No 'VS', 'Level 1', 'Chapter'). Use Icons or Chinese."
      - "The Guide Avatar should be visually present when addressing the audience (Navigation, Deep Dive, Assessment, Closing)."
    ui_layer:
      - "Slide Title (Max 12 chars)"
      - "Key Visual Elements (Icons/Metaphors)"
    content_layer:
      - "Main Body Text (Bullet points, max 4 lines)"
      - "Highlight Box (Definition/Rhetoric)"
      - "Speaker_Notes (Must be visible on the slide as '引導語' or '解析')"
    audio_layer:
      - "Speaker_Notes (The Guide's script. Ensure Guide is visually present if Slide Type allows)"

  # B. 語氣校準 (Tone Calibration)
  tone_calibration:
    G1_Warm: "Empathetic, slow-paced, uses '親愛的孩子們'."
    G2_Logic: "Analytical, deductive, uses '根據推論', '第一點...第二點'."
    G3_Knowledge: "Authoritative, encyclopedic, uses '定義上來說'."
    G4_Magic: "Whimsical, storytelling, uses '變身', '想像一下'."
    G5_Mission: "Directive, gamified, uses '任務開始', '達成目標'."
    G6_Battle: "High-energy, challenging, uses '燃燒吧', '突破極限'."

  # C. 教學邏輯控制 (Pedagogical Logic)
  pedagogical_constraints:
    - "Difficult Words MUST be explained in context."
    - "Rhetoric MUST include an example sentence."
    - "Deep Dive MUST end with a reflective question."
    - "Shape-Similar Characters MUST be grouped on a SINGLE slide for comparison."

# 💮 語言純淨協定
purity_protocol:
  translation_map: { "Lens": "鏡頭視角", "Subject": "畫面焦點", "Context": "背景細節" }
  language_lock: "Strict Traditional Chinese for Slide Text. NO English allowed. Do NOT add English translations (e.g. '散落 (scattered)' is FORBIDDEN. Use '散落' only)."
\`\`\`

# Instruction 2: 原子化動態腳本

== PART A: 導航 (Navigation) ==

### [P1] (封面)
【鏡頭視角】: 中景
【視覺提示詞】: Subject: {{guide_avatar}} (Traits: {{dna_traits}}) welcoming. Context: Title Screen. Composition: Center Focus. Artistic VIS: {{style_code}}, {{material_texture}}. Safety: No text.
【顯示文字】: 
---
標題 + 引導語 (Tone: {{tone_chip}})
---
【引導語/腳本】: "[Guide_Talk using Tone {{tone_chip}}]"

### [P2] (任務導航)
【鏡頭視角】: 網格系統
【視覺提示詞】: Subject: {{guide_avatar}} (Traits: {{dna_traits}}) presenting Mission Map. Context: 4-5 Icons (Structure, Rhetoric, Vocab, Literacy). Composition: Flat Lay Grid. Artistic VIS: {{style_prompt}}. Safety: No blurry text.
【顯示文字】: 
---
本課任務：結構探索 | 修辭解析 | 詞彙寶庫 | 素養挑戰
引導語: [Brief overview of the 4 missions]
---
【引導語/腳本】: "[Brief overview of the 4 missions]"

### [P3] (結構視圖)
【鏡頭視角】: 資訊圖表 (Infographic)
【視覺提示詞】: Subject: {{visual_skin}} (Concrete Object from Metaphor) structure. Context: A clean, professional Infographic / Mind Map. Each segment node acts as a hub, branching out to Clear Text Bubbles containing the specific {Keywords}. Composition: Organized information design, vector style, clear hierarchy, text-heavy mind map style. Artistic VIS: {{style_prompt}} + Infographic Style. Safety: No blurry text.
【顯示文字】: 
---
標題 | 寫作手法
結構流: [段落1: 關鍵詞1/關鍵詞2/關鍵詞3...] -> [段落2: 關鍵詞1/關鍵詞2/關鍵詞3...] 
(⚠️ CRITICAL LOGIC: You MUST list ALL keywords generated for each segment from Step 2.75. Do NOT truncate to just 2 items. NO English.)
引導語: [Explanation of the structure metaphor]
---
【引導語/腳本】: "[Explanation of the structure metaphor and how keywords connect]"

== PART B: 詳盡課文迴圈 (Detailed Text Loop) ==
⚠️ [COMPILER DIRECTIVE: FULL UNROLLING REQUIRED] 
You MUST iterate through ALL Meaning Segments generated from Step 2.75. 
DO NOT SKIP ANY SEGMENT. DO NOT USE ELLIPSES ("..."). You must generate the [P_N] and [P_N+1] blocks for EVERY single segment.

### [P_{N}] (意義段: {Insert Segment Title} - 內容對焦)
【鏡頭視角】: 廣角 (Exhale)
【視覺提示詞】: (Logic: IF Mode A Subject={{story_protagonist}}; IF Mode B Subject={{guide_avatar}}) Subject: [Logic_Result] (Traits: {{dna_traits}}). Context: [Segment Plot]. Composition: [Creative Angle]. Artistic VIS: {{style_prompt}}. Safety: No text.
【顯示文字】: 
---
[右上角導航]: 第 {N} 站：{Insert Segment Title}
段落大意：[⚠️ SYSTEM: 填入 Step 2.75 該段落的 summary]
難詞顯影：
[⚠️ SYSTEM: 填入該段落的 difficultWords，並強制附上「簡短的詞語解釋」(例如：欣賞：以喜愛的心情觀賞。)] (NO English)
---
【引導語/腳本】: "(搭配[填入適合的表情或動作，例如：專注的表情]) [Storytelling or Content summary based on Mode]"

### [P_{N+1}] (意義段: {Insert Segment Title} - 寫作深究)
【鏡頭視角】: 特寫 (Inhale)
【視覺提示詞】: Subject: {{guide_avatar}} (Traits: {{dna_traits}}). Context: Analyzing details or visual metaphor of the rhetoric. Composition: Close-up. Artistic VIS: {{style_prompt}}. Safety: No text.
【顯示文字】: 
---
[右上角導航]: 第 {N} 站：深究特寫
文意深究 (修辭與句型)：
[⚠️ SYSTEM: 列出該段落的 rhetorics 與 sentencePatterns 的「課文原句」]
[⚠️ SYSTEM: 針對上述原句，強制加上「解析：...」，說明作者為何這樣寫、產生了什麼效果(例如：將雨傘比喻成花朵，讓灰暗的雨天變生動)]
---
【引導語/腳本】: "(搭配[填入適合的表情或動作，例如：讚賞的表情]) [Probing question for students or explanation of the writing technique]"

⚠️ [SYSTEM CHECK]: Have you generated the above two blocks for EVERY segment? If there are 4 segments, you must generate 8 slides here. DO NOT STOP EARLY.
== PART C: 原子語文迴圈 (Atomic Language Loop) ==
⚠️ [COMPILER DIRECTIVE: FULL EXHAUSTION REQUIRED]
You MUST generate a slide for EVERY SINGLE item in the Shape-Similar, Polyphonic, and Idiom lists. DO NOT group multiple distinct sets into one slide unless explicitly instructed. DO NOT USE "...".

-- Sub-Loop C1: 形近字 (Shape-Similar) --
⚠️ GROUPING LOGIC: All characters in a shape-similar set (2, 3, or 4 chars) MUST appear on the SAME slide.
### [P_{N}] (形近字: [Target Char])
【鏡頭視角】: 分割畫面/網格 (Split Screen/Grid)
【視覺提示詞】: Subject: {{guide_avatar}} presenting comparison. Context: [Char A Object] vs [Char B Object] (vs [Char C]...). Composition: Split Screen (for 2) or Grid (for 3-4). Artistic VIS: {{style_prompt}}. Safety: No text.
【顯示文字】: 
---
[Char A] ([Radical]) - [Word]
[Char B] ([Radical]) - [Word]
(⚠️ Logic: Ensure all characters in this specific set are listed here. NO English.)
Guide_Talk: "[Mnemonic linking all characters]"
解析: [Detailed explanation of radical differences]
---
【引導語/腳本】: "[Detailed explanation of radical differences]"
(⚠️ SYSTEM: GENERATE THE ABOVE BLOCK FOR EVERY SHAPE-SIMILAR SET.)

-- Sub-Loop C2: 多音字 (Polyphonic) --
### [P_{N}] (多音字: [Target Char])
【鏡頭視角】: 對比/天平
【視覺提示詞】: Subject: {{guide_avatar}} weighing options or showing two paths. Context: [Sound A] vs [Sound B]. Composition: Symmetrical. Artistic VIS: {{style_prompt}}. Safety: No text.
【顯示文字】: 
---
[生字]
讀音A (造詞) vs 讀音B (造詞)
引導語: [Functional Explanation]
---
【引導語/腳本】: "[Functional Explanation of Context/Pronunciation]"
(⚠️ SYSTEM: GENERATE THE ABOVE BLOCK FOR EVERY POLYPHONIC CHARACTER.)

-- Sub-Loop C3: 成語 (Idioms) --
### [P_{N}] (成語: [Target Idiom])
【鏡頭視角】: 情境演繹
【視覺提示詞】: Subject: {{guide_avatar}} acting out [Idiom] in a real-life scenario. Context: [Scenario Description]. Composition: [Creative Angle]. Artistic VIS: {{style_prompt}}. Safety: No text.
【顯示文字】: 
---
[成語]
釋義 | 近反義 | 例句
引導語: [Functional Explanation]
---
【引導語/腳本】: "[Functional Explanation of Real-life Usage]"
(⚠️ SYSTEM: GENERATE THE ABOVE BLOCK FOR EVERY IDIOM. DO NOT SKIP.)

### [P_Close] (綜合評量)
【鏡頭視角】: 分割畫面/票券設計
【視覺提示詞】: IF Error_Hunt: Subject: {{guide_avatar}} holding a 'False' sign. Context: Detective board. IF Exit_Ticket: Subject: {{guide_avatar}} stamping a ticket. Context: Airport. Safety: No text.
【顯示文字】: 
---
IF Error_Hunt: 偵探眼考驗 | 1. [Option A] | 2. [Option B] | 3. [Option C] | 哪個是錯的？
IF Exit_Ticket: 本堂課的登機證 | 1. 我學會的一個新觀點... | 2. 我還有的一個疑問...
---
【引導語/腳本】: "If Error_Hunt: ⚠️ [Teacher_Answer_Key]: The false statement is... (Hidden). If Exit_Ticket: Guide students to write down reflections."

== PART D: 百寶箱迴圈 (Strategy Loop) ==
⚠️ [COMPILER DIRECTIVE: GENERATE ALL 3 STRATEGIES]
### [P_{Strategy_N}] (策略頁: [Strategy Title])
【鏡頭視角】: 資訊圖表
【視覺提示詞】: Subject: {{guide_avatar}} presenting tool [Name]. Context: [Tool Visual]. Composition: Info-graphic Layout. Artistic VIS: {{style_prompt}}. Safety: No text.
【顯示文字】: 
---
[策略名稱]
[公式/圖解]
[微型任務]
引導語: [Explanation of the Strategy Tool]
---
【引導語/腳本】: "[Explanation of the Strategy Tool + How to use it]"
(⚠️ SYSTEM: GENERATE THE ABOVE BLOCK FOR EVERY STRATEGY OBTAINED IN STEP 2.75)

== PART E: 結尾 ==
### [P_{End}] (結尾)
【鏡頭視角】: 廣角
【視覺提示詞】: Subject: {{guide_avatar}} waving goodbye to the audience. Context: Closing scene. Composition: Wide. Artistic VIS: {{style_prompt}}. Safety: No text.
【顯示文字】: 
---
總結 + 下課
引導語: [Closing remarks]
---
【引導語/腳本】: "[Closing remarks]"

[SELF_CORRECTION REPORT]
DNA一致性: 角色特徵是否跨頁鎖定？
語言純淨度: 是否全中文 (無 English Labels)？
結構防護: 顯示文字是否以「---」分隔獨立區塊？
教學功能: 引導語是否解釋了部首/用法/讀音？
`;

export const STEP_5_MATERIALS_PROMPT = `
[INSTRUCTION]
Please Execute STEP 6: 輔助產出 (Material Linkage).

Action:
1. Generate "Instruction 3: 素養學習單".
2. Generate "Instruction 4: 學生複習講義".
3. Generate "Instruction 5: NotebookLM 知識庫".
`;

export const PROMPT_GENERATE_WORKSHEET = `
[INSTRUCTION]
Please Execute STEP 6-A: 素養學習單 (Worksheet).

Action: Generate "Instruction 3: 素養學習單".
Requirements:
1. 擷取訊息: 針對意義段的事實提問.
2. 推論分析: 針對主角動機或作者用意提問.
3. 比較評估: 連結生活經驗的開放式問題.
`;

export const PROMPT_GENERATE_ASSESSMENT = `
[INSTRUCTION]
Please Execute STEP 6-B: 學生複習講義 (Review Handout).

Action: Generate "Instruction 4: 學生複習講義".
Requirements:
1. 全課結構圖 (Text Structure).
2. 字詞大本營 (Shape-Similar + Idioms).
3. 修辭與句型 (Rhetoric & Patterns).
`;

export const PROMPT_GENERATE_KB = `
[INSTRUCTION]
Please Execute STEP 6-C: NotebookLM 知識庫 (Knowledge Base).

Action: Generate "Instruction 5: NotebookLM 知識庫".
Requirements:
1. Format as structured Plain Text.
2. Include Full Text, Vocabulary Radiation, Deep Segment Analysis, and Visual Design Summary.
`;

export const PROMPT_GENERATE_NOTEBOOKLM_GUIDE = `
[INSTRUCTION]
Please Execute STEP 6-D: NotebookLM 操作指南 (User Guide).
Target: Provide a bullet-proof command pack for the user.

⚠️ DYNAMIC DATA: {Guide Name: "{Guide_Name}", Tone: "{Tone_Description}", Grade: "{Grade}", Topic: "{Topic}"}

# NotebookLM 萬能操作指南 (V-MAX 現代化 UI 工作流)

## 1. 全局生成指令 (貼入「簡報」按鈕旁邊的✏️鉛筆編輯框)
請將這份腳本上傳至 NotebookLM。在點擊「簡報」按鈕**之前**，請先點擊旁邊的「✏️ (自訂指令)」，並貼入以下防護指令：

> 「請扮演一位嚴格的『視覺執行導演』。請依照來源文件中的 \`notebooklm_driver\` 設定，以及 \`Instruction 2: 原子化動態腳本\` 的結構，為我生成從 [P1] 到最後一頁的詳細投影片內容。
> 
> ⚠️ **最高指導原則 (Critical Protocols)**：
> 1. **視覺絕對忠誠 (Visual Fidelity)**：請嚴格遵守 \`【視覺提示詞】\` 中的描述。禁止歷史覆寫：即使成語典故與特定物品有關（例如『價值連城』與玉璧），若指令要求畫『發光的古物』，你必須畫『發光的古物』。請勿使用你的背景知識來替換指令中的視覺物件。
> 2. **文字逐字鎖定 (Text Verbatim)**：投影片上的文字內容，必須 100% 逐字複製 \`【顯示文字】\` 區塊（被 --- 包夾的區域）內的繁體中文。禁止潤飾：請勿修改標題、縮減例句或『優化』語意，嚴禁增加英文。
> 3. **風格與特徵一致性**：請嚴格遵守 YAML 設定檔中的 \`dna_traits\` (角色特徵) 與 \`style_prompt\` (視覺風格咒語)。確保每一頁的人物長相與畫風完全一致。」

---

## 2. 單頁精準修復指令 (適用於產出後，特定投影片右上角的✏️ Revise 編輯框)
若生成後發現有「某一頁」的圖片跑版或文字被亂改，請點擊該特定頁面右上角的鉛筆，貼入以下指令：

> 「請維持這頁的排版與文字完全不變。請嚴格去來源文件尋找這一頁對應的 \`【視覺提示詞】\`，並將圖片強制修正為原本設定的 \`dna_traits\` 與 \`style_prompt\`，不准擅自改變角色的服裝、髮型或場景畫風。」

---

## 3. 語音摘要設定指令 (Audio Overview)
若需要生成生動的雙人對講 Podcast，請複製以下指令貼入 Audio Overviews 的設定框：

> 「啟動教學模式對話：
> - 主講人：**{Guide_Name}**（角色：引導導師）。
> - 語氣設定：**{Tone_Description}**。
> - 目標對象：**{Grade}** 學生。
> - 核心內容：根據來源文件的 \`【引導語/腳本】\`，針對『**{Topic}**』進行深度對話與拆解。
> - 互動要求：對話中必須包含對修辭技巧、生字部首的具體解釋，並使用『孩子們』、『準備好了嗎』作為課堂互動用語。」
`;

export const PROMPT_GENERATE_GAMIFIED_QUIZ = `
[INSTRUCTION]
請根據前面的課文文本與深度分析結果，為我生成一份「遊戲化互動測驗題庫 (相容於 Kahoot / Blooket)」。

⚠️ **平台規格限制 (Strict Constraints)**：
1. 題目字數：不可超過 120 個字元。
2. 選項數量：必須剛好 4 個選項（1 個正確，3 個誘答）。
3. 選項字數：每個選項不可超過 75 個字元。
4. 誘答設計：誘答選項 (Distractors) 必須具備合理性，能測驗出學生易混淆的盲點（如形近字、多音字、相似修辭）。

🎯 **題型配置 (共 10 題)**：
- 詞彙與形音義 (3 題)
- 課文內容理解 (3 題)
- 修辭與寫作手法 (2 題)
- 延伸思考/情境題 (2 題)

📋 **輸出格式 (嚴格遵守 CSV 結構)**：
請直接輸出純文字，不要包含任何 Markdown \`\`\`csv 標籤，格式如下：
題目,選項1,選項2,選項3,選項4,正確答案(填寫數字1-4),時間限制(秒)

例如：
作者在第一段使用了什麼修辭？,譬喻,擬人,排比,誇飾,1,20
下列哪一個字的讀音與「朝」陽相同？,「朝」代,「朝」向,「朝」氣,上「朝」,3,20
`;