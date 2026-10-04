import { CardTemplate } from './card';

export type UserRole = 'user' | 'admin' | 'super_admin';

export interface AppUser {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  isBlocked: boolean;
  createdAt: string;
}

export type SubmissionType = 'new_card' | 'card_update';
export type SubmissionStatus = 'pending' | 'approved' | 'rejected';

export interface CardSubmission {
  id: string;
  templateId: string;
  template: CardTemplate;
  submittedByEmail: string;
  submittedById: string;
  creatorName: string;
  type: SubmissionType;
  originalCardId?: string; // If this is an update to an existing published card
  changeSummary?: string;
  status: SubmissionStatus;
  rejectionReason?: string;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export type FeedbackType = 'app' | 'card';
export type FeedbackCategory = 'general' | 'bug' | 'devaluation' | 'rule_change' | 'feature';
export type FeedbackStatus = 'pending' | 'reviewed' | 'resolved';

export interface FeedbackItem {
  id: string;
  userId?: string;
  userEmail: string;
  type: FeedbackType;
  cardTemplateId?: string;
  cardName?: string;
  category: FeedbackCategory;
  message: string;
  status: FeedbackStatus;
  adminNotes?: string;
  createdAt: string;
}
