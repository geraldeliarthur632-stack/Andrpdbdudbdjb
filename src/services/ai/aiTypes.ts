export interface AIMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  subject?: string;
  isError?: boolean;
}

export interface AIConversation {
  id: string;
  title: string;
  subject?: string;
  createdAt: string;
  updatedAt: string;
  messages: AIMessage[];
}

export interface AITutorRequest {
  message: string;
  context?: string;
  subject?: string;
  lessonTitle?: string;
  grade?: string;
  history?: Array<{ role: 'user' | 'model'; parts: string }>;
}

export interface AITutorResponse {
  answer: string;
  subject?: string;
  relatedTopics?: string[];
  encouragement?: string;
  suggestedAction?: string;
  offlineFallback?: boolean;
}

export interface AITextAnalysisRequest {
  text: string;
  action: 'explain' | 'summarize' | 'questions' | 'vocabulary';
  subject?: string;
}

export interface AITextAnalysisResponse {
  result: string;
  keyPoints?: string[];
  practiceQuestions?: Array<{ question: string; answer: string }>;
}
