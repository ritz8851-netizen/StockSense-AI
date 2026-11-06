import { DocumentAnalysis, ComparisonResult, LanguageMode } from '../types/document';

export interface AnalyzePayload {
  fileData?: string;
  mimeType?: string;
  fileName: string;
  language?: LanguageMode;
  documentText?: string;
}

export interface AskPayload {
  question: string;
  documentContext: any;
  conversationHistory?: { role: 'user' | 'assistant'; content: string }[];
  language?: LanguageMode;
}

export interface AskResponse {
  answer: string;
  citations: { pageNumber: number; quote: string; sectionRef?: string }[];
  clarificationNeeded?: boolean;
  relatedTopics?: string[];
}

export const analyzeDocumentApi = async (payload: AnalyzePayload): Promise<DocumentAnalysis> => {
  const response = await fetch('/api/analyze-document', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Server error (${response.status})`);
  }

  const data = await response.json();
  if (!data.success || !data.analysis) {
    throw new Error('Invalid analysis response from server.');
  }

  return data.analysis;
};

export const askDocumentApi = async (payload: AskPayload): Promise<AskResponse> => {
  const response = await fetch('/api/ask-document', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to get response (${response.status})`);
  }

  const data = await response.json();
  return data.result;
};

export const compareDocumentsApi = async (
  doc1: any,
  doc2: any,
  doc1Name: string,
  doc2Name: string
): Promise<ComparisonResult> => {
  const response = await fetch('/api/compare-documents', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ doc1, doc2, doc1Name, doc2Name }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to compare documents (${response.status})`);
  }

  const data = await response.json();
  return data.comparison;
};
