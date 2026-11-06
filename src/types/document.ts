export type LanguageMode = 'english' | 'hindi' | 'hinglish';

export interface ClauseItem {
  id: string;
  title: string;
  originalQuote: string;
  simpleExplanation: string;
  hindiExplanation?: string;
  hinglishExplanation?: string;
  whyItMatters: string;
  pageNumber: number;
  sectionRef: string;
  category: 'rights' | 'restrictions' | 'termination' | 'liability' | 'general';
  importance: 'critical' | 'important' | 'info';
}

export interface FeeItem {
  id: string;
  feeName: string;
  amount: string;
  frequency: 'one-time' | 'monthly' | 'annual' | 'conditional';
  purpose: string;
  penaltiesOrLateFee: string;
  refundConditions: string;
  pageNumber: number;
  sectionRef: string;
  severity: 'critical' | 'important' | 'info';
}

export interface DeadlinesItem {
  id: string;
  date: string;
  isoDate?: string;
  requirement: string;
  pageNumber: number;
  sectionRef: string;
  isExplicit: boolean;
  isCompleted?: boolean;
  status: 'upcoming' | 'pending' | 'completed' | 'urgent';
  urgency?: 'urgent' | 'medium' | 'low';
}

export interface RequiredAction {
  id: string;
  actionText: string;
  description: string;
  dueDate?: string;
  urgency: 'urgent' | 'medium' | 'low';
  completed: boolean;
  pageNumber: number;
  sectionRef: string;
  partiesInvolved: string[];
}

export interface ImportantCondition {
  id: string;
  title: string;
  condition: string;
  potentialImpact: string;
  recommendation: string;
  severity: 'critical' | 'important' | 'info';
  pageNumber: number;
  sectionRef: string;
}

export interface SourceReference {
  pageNumber: number;
  summarySnippet: string;
  topicsCovered: string[];
}

export interface DocumentOverview {
  title: string;
  category: string;
  mainPurpose: string;
  partiesMentioned: string[];
  effectiveDates: string;
  summaryEnglish: string;
  summaryHindi: string;
  summaryHinglish: string;
  keyTakeaways: string[];
  complexityScore: number;
  readingTimeMinutes: number;
}

export interface DocumentAnalysis {
  id: string;
  documentId: string;
  overview: DocumentOverview;
  keyClauses: ClauseItem[];
  fees: FeeItem[];
  deadlines: DeadlinesItem[];
  requiredActions: RequiredAction[];
  importantConditions: ImportantCondition[];
  sourceReferences: SourceReference[];
  createdAt: string;
}

export interface DocumentItem {
  id: string;
  userId: string;
  fileName: string;
  fileType: 'pdf' | 'png' | 'jpg' | 'jpeg' | 'txt' | 'sample';
  fileSize: number;
  documentCategory: string;
  uploadDate: string;
  pageCount: number;
  rawText?: string;
  base64Data?: string;
  mimeType?: string;
  isDemo?: boolean;
  analysis?: DocumentAnalysis;
  previewPages?: string[]; // text or simulated render per page
}

export interface ChatCitation {
  pageNumber: number;
  quote: string;
  sectionRef?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  citations?: ChatCitation[];
  relatedTopics?: string[];
}

export interface ComparisonResult {
  doc1Title: string;
  doc2Title: string;
  summaryOfDifferences: string;
  addedClauses: { title: string; explanation: string; presentIn: string }[];
  removedClauses: { title: string; explanation: string; absentIn: string }[];
  feeChanges: { item: string; doc1Amount: string; doc2Amount: string; changeNote: string }[];
  deadlineChanges: { requirement: string; doc1Date: string; doc2Date: string; note: string }[];
  riskAssessment: string;
  recommendation: string;
}

export interface Reminder {
  id: string;
  userId: string;
  documentId?: string;
  documentTitle?: string;
  title: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
  isUserCreated: boolean;
  notes?: string;
  createdAt: string;
}

export interface SavedInsight {
  id: string;
  userId: string;
  documentId: string;
  documentTitle: string;
  title: string;
  snippet: string;
  type: 'clause' | 'fee' | 'deadline' | 'condition' | 'general';
  savedAt: string;
  tags: string[];
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  isDemoUser?: boolean;
  createdAt: string;
}
