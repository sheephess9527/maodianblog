import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { MeetingAnalysisResult } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const meetingAnalysisSchema = {
  type: Type.OBJECT,
  properties: {
    summary: {
      type: Type.STRING,
      description: "用不超过3句话，高度概括本次会议的核心议题、主要结论和达成的共识。",
    },
    discussionTopics: {
      type: Type.ARRAY,
      description: "会议中讨论的主要议题及其摘要。",
      items: {
        type: Type.OBJECT,
        properties: {
          topic: { type: Type.STRING, description: "讨论议题的简洁标题。" },
          summary: { type: Type.STRING, description: "该议题的详细讨论摘要，包括关键观点、论据和提出的问题。" },
        },
        required: ["topic", "summary"],
      },
    },
    keyDecisions: {
        type: Type.ARRAY,
        description: "会议中做出的所有重要决定或达成的共识列表。",
        items: { type: Type.STRING }
    },
    tasks: {
      type: Type.ARRAY,
      description: "从会议中提取的具体待办事项、责任人和截止日期列表。",
      items: {
        type: Type.OBJECT,
        properties: {
          task: {
            type: Type.STRING,
            description: "具体的任务描述。",
          },
          assignee: {
            type: Type.STRING,
            description: "负责此任务的人员姓名。",
          },
          deadline: {
            type: Type.STRING,
            description: "任务的完成时限。",
          },
        },
        required: ["task", "assignee", "deadline"],
      },
    },
  },
  required: ["summary", "discussionTopics", "keyDecisions", "tasks"],
};

export const analyzeMeetingTranscript = async (transcript: string): Promise<MeetingAnalysisResult | null> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: `这是会议的逐字稿: ${transcript}`,
      config: {
        systemInstruction: `# 角色：
你是一位顶级的会议纪要专家和效率分析师，扮演“金牌会议纪要官”的角色。你的任务是将原始、混乱的会议逐字稿，通过一个严谨的四阶段流程，转化为一份结构清晰、信息完整、可执行的专业会议纪要。

# 工作流程与输出要求：
你必须严格遵循以下流程处理文本，并根据最终产出要求生成 JSON 对象。

### 第一阶段：文本顺滑与预处理
首先，通读整个逐字稿，在你的处理流程中进行“文本顺滑”：
- **删除口水词**：去除所有无意义的填充词（如“嗯”、“啊”、“那个”）。
- **修正错别字**：根据上下文修正明显的语音识别错误。
- **优化标点**：确保文本流畅可读，逻辑清晰。

### 第二阶段：议题聚类与讨论摘要 (Topic Clustering & Summarization)
在顺滑的文本基础上，识别出会议中讨论的几个核心议题。对于每个议题：
- **识别议题**：给每个议题起一个简洁明确的标题。
- **提炼摘要**：总结该议题下的主要讨论内容，包括各方的核心观点、提出的问题和关键论据。这部分将成为输出中的 \`discussionTopics\`。

### 第三阶段：关键信息抽取 (Key Information Extraction)
从对话中精准地抽取出以下两类关键信息：
1.  **关键决策 (Key Decisions)**：明确记录会议达成的每一项共识、最终决定或重要声明。这些将成为 \`keyDecisions\` 数组的内容。
2.  **待办事项 (Action Items)**：识别出所有被分配的任务。每个任务必须包含清晰的“任务描述”、“责任人”和“截止日期”。如果没有明确提及责任人或时限，需在任务描述中注明。这些将成为 \`tasks\` 数组的内容。

### 第四阶段：生成最终报告
最后，将以上所有处理结果整合，并额外生成一个全局的“会议核心摘要”。
- **核心摘要 (Summary)**：用不超过3句话，高度概括本次会议的总体目标、最重要的成果和后续方向。

# 最终产出格式：
请严格按照定义的 JSON Schema 输出结果，确保所有字段都准确填充。`,
        responseMimeType: "application/json",
        responseSchema: meetingAnalysisSchema,
        thinkingConfig: { thinkingBudget: 32768 }
      },
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as MeetingAnalysisResult;
  } catch (error) {
    console.error("Error analyzing meeting transcript:", error);
    return null;
  }
};

export const analyzeImage = async (prompt: string, imageBase64: string, mimeType: string): Promise<string> => {
    try {
        const imagePart = {
            inlineData: {
                data: imageBase64,
                mimeType,
            },
        };
        const textPart = { text: prompt };

        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, textPart] },
        });

        return response.text;
    } catch (error) {
        console.error("Error analyzing image:", error);
        return "抱歉，无法分析该图像。请重试。";
    }
};

export const getQuickChat = () => {
    return ai.chats.create({
        model: 'gemini-flash-lite-latest',
    });
};