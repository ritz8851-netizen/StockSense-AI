import { DocumentItem, Reminder, SavedInsight, UserProfile } from '../types/document';
import { SAMPLE_DOCUMENTS } from '../data/sampleDocuments';

const STORAGE_KEYS = {
  USER: 'paperwise_current_user',
  DOCUMENTS: 'paperwise_documents',
  REMINDERS: 'paperwise_reminders',
  INSIGHTS: 'paperwise_insights',
  USERS_LIST: 'paperwise_users_db',
};

// Default Demo User
export const DEFAULT_DEMO_USER: UserProfile = {
  id: 'demo-user',
  name: 'Mohit',
  email: 'mohit@example.com',
  isDemoUser: true,
  createdAt: '2026-10-01T00:00:00.000Z',
};

export const getStoredUser = (): UserProfile => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading user from localStorage', e);
  }
  return DEFAULT_DEMO_USER;
};

export const setStoredUser = (user: UserProfile | null) => {
  if (!user) {
    localStorage.removeItem(STORAGE_KEYS.USER);
  } else {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  }
};

export const getStoredDocuments = (userId: string): DocumentItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DOCUMENTS);
    let allDocs: DocumentItem[] = [];
    if (raw) {
      allDocs = JSON.parse(raw);
    } else {
      // Initialize with sample documents for demo user
      allDocs = [...SAMPLE_DOCUMENTS];
      localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(allDocs));
    }
    // Return documents belonging to this user or demo documents if in demo mode
    return allDocs.filter(d => d.userId === userId || (userId === 'demo-user' && d.isDemo));
  } catch (e) {
    console.error('Error fetching documents', e);
    return SAMPLE_DOCUMENTS;
  }
};

export const saveDocument = (doc: DocumentItem): DocumentItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DOCUMENTS);
    let allDocs: DocumentItem[] = raw ? JSON.parse(raw) : [...SAMPLE_DOCUMENTS];
    const index = allDocs.findIndex(d => d.id === doc.id);
    if (index >= 0) {
      allDocs[index] = doc;
    } else {
      allDocs.unshift(doc);
    }
    localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(allDocs));
    return allDocs.filter(d => d.userId === doc.userId || (doc.userId === 'demo-user' && d.isDemo));
  } catch (e) {
    console.error('Error saving document', e);
    return [];
  }
};

export const deleteStoredDocument = (docId: string, userId: string): DocumentItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DOCUMENTS);
    if (!raw) return [];
    let allDocs: DocumentItem[] = JSON.parse(raw);
    allDocs = allDocs.filter(d => d.id !== docId);
    localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(allDocs));

    // Also remove associated reminders and insights
    deleteAssociatedReminders(docId);
    return allDocs.filter(d => d.userId === userId || (userId === 'demo-user' && d.isDemo));
  } catch (e) {
    console.error('Error deleting document', e);
    return [];
  }
};

// Reminders
export const getStoredReminders = (userId: string): Reminder[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REMINDERS);
    if (raw) {
      const allReminders: Reminder[] = JSON.parse(raw);
      return allReminders.filter(r => r.userId === userId);
    }
    // Generate initial reminders from sample documents for demo user
    const sampleReminders: Reminder[] = [
      {
        id: 'rem-1',
        userId: 'demo-user',
        documentId: 'demo-doc-rental',
        documentTitle: 'Sample Rental Agreement Indiranagar',
        title: 'Pay monthly rent ₹38,000 (Avoid ₹500/day penalty)',
        dueDate: '5th of this month',
        priority: 'high',
        completed: false,
        isUserCreated: false,
        notes: 'Pay through HDFC Netbanking before grace period ends on 10th.',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'rem-2',
        userId: 'demo-user',
        documentId: 'demo-doc-bank',
        documentTitle: 'Sample Bank Loan Agreement SME',
        title: 'Maintain ₹35,000 balance for loan EMI auto-debit',
        dueDate: '1st of next month',
        priority: 'high',
        completed: false,
        isUserCreated: false,
        notes: 'NACH return penalty is ₹650 + 24% annual interest.',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'rem-3',
        userId: 'demo-user',
        documentId: 'demo-doc-insurance',
        documentTitle: 'Health Insurance Shield Plus',
        title: 'Download and print TPA cashless health e-card',
        dueDate: 'Within 7 days',
        priority: 'medium',
        completed: true,
        isUserCreated: true,
        notes: 'Required for 24-hr emergency hospital notification.',
        createdAt: new Date().toISOString(),
      }
    ];
    localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(sampleReminders));
    return sampleReminders;
  } catch (e) {
    return [];
  }
};

export const saveReminder = (reminder: Reminder): Reminder[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REMINDERS);
    let all: Reminder[] = raw ? JSON.parse(raw) : [];
    const index = all.findIndex(r => r.id === reminder.id);
    if (index >= 0) {
      all[index] = reminder;
    } else {
      all.unshift(reminder);
    }
    localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(all));
    return all.filter(r => r.userId === reminder.userId);
  } catch (e) {
    return [];
  }
};

export const deleteReminder = (reminderId: string, userId: string): Reminder[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REMINDERS);
    if (!raw) return [];
    let all: Reminder[] = JSON.parse(raw);
    all = all.filter(r => r.id !== reminderId);
    localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(all));
    return all.filter(r => r.userId === userId);
  } catch (e) {
    return [];
  }
};

const deleteAssociatedReminders = (docId: string) => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REMINDERS);
    if (!raw) return;
    let all: Reminder[] = JSON.parse(raw);
    all = all.filter(r => r.documentId !== docId);
    localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(all));
  } catch (e) {
    // ignore
  }
};

// Saved Insights
export const getStoredInsights = (userId: string): SavedInsight[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.INSIGHTS);
    if (raw) {
      const all: SavedInsight[] = JSON.parse(raw);
      return all.filter(i => i.userId === userId);
    }
    const sampleInsights: SavedInsight[] = [
      {
        id: 'ins-1',
        userId: 'demo-user',
        documentId: 'demo-doc-rental',
        documentTitle: 'Rental Agreement Indiranagar',
        title: 'Painting Charge ₹38,000 is Mandatory on Move-out',
        snippet: 'Section 3 mandates deduction of one month rent (₹38,000) for painting from the ₹1.5L deposit regardless of wall condition.',
        type: 'fee',
        savedAt: '2026-10-16T12:00:00.000Z',
        tags: ['Rental', 'Deposit', 'Deduction']
      },
      {
        id: 'ins-2',
        userId: 'demo-user',
        documentId: 'demo-doc-insurance',
        documentTitle: 'Health Insurance Shield Plus',
        title: '20% Co-Payment for Non-Network Hospitals',
        snippet: 'Section III states 20% co-pay applies if not using an empanelled network hospital. Always seek cashless pre-auth.',
        type: 'condition',
        savedAt: '2026-09-21T09:30:00.000Z',
        tags: ['Insurance', 'Co-payment', 'Hospitals']
      }
    ];
    localStorage.setItem(STORAGE_KEYS.INSIGHTS, JSON.stringify(sampleInsights));
    return sampleInsights;
  } catch (e) {
    return [];
  }
};

export const saveInsight = (insight: SavedInsight): SavedInsight[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.INSIGHTS);
    let all: SavedInsight[] = raw ? JSON.parse(raw) : [];
    const index = all.findIndex(i => i.id === insight.id);
    if (index >= 0) {
      all[index] = insight;
    } else {
      all.unshift(insight);
    }
    localStorage.setItem(STORAGE_KEYS.INSIGHTS, JSON.stringify(all));
    return all.filter(i => i.userId === insight.userId);
  } catch (e) {
    return [];
  }
};

export const deleteInsight = (insightId: string, userId: string): SavedInsight[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.INSIGHTS);
    if (!raw) return [];
    let all: SavedInsight[] = JSON.parse(raw);
    all = all.filter(i => i.id !== insightId);
    localStorage.setItem(STORAGE_KEYS.INSIGHTS, JSON.stringify(all));
    return all.filter(i => i.userId === userId);
  } catch (e) {
    return [];
  }
};
