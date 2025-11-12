
export enum AppFeature {
  MeetingAssistant = 'MeetingAssistant',
  ImageAnalyzer = 'ImageAnalyzer',
  QuickChat = 'QuickChat',
}

export enum TaskStatus {
  Pending = '待处理',
  Completed = '已完成',
}

export interface TaskItem {
  id: string;
  task: string;
  assignee: string;
  deadline: string;
  status: TaskStatus;
}

export interface MeetingAnalysisResult {
  summary: string;
  discussionTopics: { topic: string; summary: string }[];
  keyDecisions: string[];
  tasks: Omit<TaskItem, 'id' | 'status'>[];
}
