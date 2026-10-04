import { CardTemplate } from '../types/card';
import { CardSubmission, FeedbackItem, SubmissionType, FeedbackType, FeedbackCategory } from '../types/admin';
import { getSupabaseClient } from './supabaseClient';
import { loadCardTemplates, saveCardTemplates, deleteCardTemplate } from './storage';
import { canManageCards } from './adminAuth';

const SUBMISSIONS_STORAGE_KEY = 'ccr_card_submissions_v1';
const FEEDBACKS_STORAGE_KEY = 'ccr_feedbacks_v1';

// ---------------------------------------------------------------------------
// Card Submissions & Publishing
// ---------------------------------------------------------------------------

/**
 * Load all card submissions (local fallback)
 */
export function loadLocalSubmissions(): CardSubmission[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(SUBMISSIONS_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/**
 * Save card submissions locally
 */
export function saveLocalSubmissions(submissions: CardSubmission[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SUBMISSIONS_STORAGE_KEY, JSON.stringify(submissions));
}

/**
 * Submit a card for Admin Approval (new card or update to existing)
 */
export async function submitCardForPublishing(params: {
  template: CardTemplate;
  submittedByEmail: string;
  submittedById?: string;
  creatorName: string;
  type: SubmissionType;
  originalCardId?: string;
  changeSummary?: string;
}): Promise<CardSubmission> {
  const submission: CardSubmission = {
    id: `sub_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    templateId: params.template.id,
    template: {
      ...params.template,
      creatorName: params.creatorName,
      creatorEmail: params.submittedByEmail,
      status: 'pending',
    },
    submittedByEmail: params.submittedByEmail,
    submittedById: params.submittedById || `anon_${Date.now()}`,
    creatorName: params.creatorName,
    type: params.type,
    originalCardId: params.originalCardId,
    changeSummary: params.changeSummary,
    status: 'pending',
    submittedAt: new Date().toISOString(),
  };

  // 1. Save locally
  const list = loadLocalSubmissions();
  list.unshift(submission);
  saveLocalSubmissions(list);

  // 2. Sync to Supabase if connected
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('card_submissions').insert({
        id: submission.id,
        template_id: submission.templateId,
        template_json: submission.template,
        submitted_by_id: params.submittedById || null,
        submitted_by_email: submission.submittedByEmail,
        creator_name: submission.creatorName,
        submission_type: submission.type,
        original_card_id: submission.originalCardId || null,
        change_summary: submission.changeSummary || null,
        status: 'pending',
      });
    } catch (err) {
      console.warn('Could not sync card submission to Supabase:', err);
    }
  }

  return submission;
}

/**
 * Admin directly publishes a card (or approves an existing submission)
 */
export async function approveCardSubmission(
  submissionId: string,
  reviewerEmail: string,
  overrideTemplate?: CardTemplate
): Promise<CardTemplate> {
  const submissions = loadLocalSubmissions();
  const subIndex = submissions.findIndex((s) => s.id === submissionId);

  let approvedTemplate: CardTemplate;

  if (subIndex !== -1) {
    const sub = submissions[subIndex];
    approvedTemplate = overrideTemplate || sub.template;
    approvedTemplate = {
      ...approvedTemplate,
      status: 'published',
      publishedAt: new Date().toISOString(),
      creatorName: sub.creatorName || approvedTemplate.creatorName || reviewerEmail,
      creatorEmail: sub.submittedByEmail || approvedTemplate.creatorEmail || reviewerEmail,
    };

    submissions[subIndex] = {
      ...sub,
      status: 'approved',
      reviewedAt: new Date().toISOString(),
      reviewedBy: reviewerEmail,
      template: approvedTemplate,
    };
    saveLocalSubmissions(submissions);
  } else if (overrideTemplate) {
    approvedTemplate = {
      ...overrideTemplate,
      status: 'published',
      publishedAt: new Date().toISOString(),
      creatorName: overrideTemplate.creatorName || reviewerEmail,
      creatorEmail: overrideTemplate.creatorEmail || reviewerEmail,
    };
  } else {
    throw new Error('Submission not found.');
  }

  // Add/Update in global published card templates list
  const existingTemplates = loadCardTemplates();
  const existingIdx = existingTemplates.findIndex((t) => t.id === approvedTemplate.id);
  if (existingIdx !== -1) {
    existingTemplates[existingIdx] = approvedTemplate;
  } else {
    existingTemplates.push(approvedTemplate);
  }
  saveCardTemplates(existingTemplates);

  // Sync to Supabase
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('card_submissions').update({
        status: 'approved',
        reviewed_at: new Date().toISOString(),
      }).eq('id', submissionId);

      await supabase.from('card_templates').upsert({
        id: approvedTemplate.id,
        template_json: approvedTemplate,
        is_custom: true,
        updated_at: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('Could not sync approved card to Supabase:', err);
    }
  }

  return approvedTemplate;
}

/**
 * Admin rejects a card submission with a reason
 */
export async function rejectCardSubmission(
  submissionId: string,
  reviewerEmail: string,
  rejectionReason: string
): Promise<boolean> {
  const submissions = loadLocalSubmissions();
  const subIndex = submissions.findIndex((s) => s.id === submissionId);
  if (subIndex === -1) return false;

  submissions[subIndex] = {
    ...submissions[subIndex],
    status: 'rejected',
    rejectionReason,
    reviewedAt: new Date().toISOString(),
    reviewedBy: reviewerEmail,
  };
  saveLocalSubmissions(submissions);

  // Sync to Supabase
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('card_submissions').update({
        status: 'rejected',
        rejection_reason: rejectionReason,
        reviewed_at: new Date().toISOString(),
      }).eq('id', submissionId);
    } catch {
      // ignore
    }
  }

  return true;
}

/**
 * Fetch all pending submissions for Admin Review
 */
export async function fetchAllSubmissions(): Promise<CardSubmission[]> {
  const localList = loadLocalSubmissions();

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data } = await supabase.from('card_submissions').select('*').order('submitted_at', { ascending: false });
      if (data && Array.isArray(data)) {
        const mergedMap = new Map<string, CardSubmission>();
        localList.forEach((s) => mergedMap.set(s.id, s));
        data.forEach((row) => {
          mergedMap.set(row.id, {
            id: row.id,
            templateId: row.template_id,
            template: row.template_json,
            submittedByEmail: row.submitted_by_email,
            submittedById: row.submitted_by_id || '',
            creatorName: row.creator_name,
            type: row.submission_type,
            originalCardId: row.original_card_id,
            changeSummary: row.change_summary,
            status: row.status,
            rejectionReason: row.rejection_reason,
            submittedAt: row.submitted_at || row.created_at,
            reviewedAt: row.reviewed_at,
            reviewedBy: row.reviewed_by,
          });
        });
        return Array.from(mergedMap.values());
      }
    } catch {
      // ignore
    }
  }

  return localList;
}

/**
 * Admin deletes a card template from the catalog and local storage
 */
export async function deleteCardFromCatalog(
  templateId: string,
  adminEmail: string
): Promise<boolean> {
  if (!canManageCards(adminEmail)) {
    throw new Error('Only administrators can remove cards from the Community Catalog.');
  }

  // 1. Delete locally (and track in deleted templates)
  deleteCardTemplate(templateId);

  // 2. Sync deletion to Supabase
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('card_templates').delete().eq('id', templateId);
      await supabase.from('card_submissions').delete().eq('template_id', templateId);
    } catch (err) {
      console.warn('Could not sync card template deletion to Supabase:', err);
    }
  }

  return true;
}

// ---------------------------------------------------------------------------
// Feedback Management (App-Level & Card-Specific)
// ---------------------------------------------------------------------------

/**
 * Load local feedbacks
 */
export function loadLocalFeedbacks(): FeedbackItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(FEEDBACKS_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/**
 * Save feedbacks locally
 */
export function saveLocalFeedbacks(feedbacks: FeedbackItem[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(FEEDBACKS_STORAGE_KEY, JSON.stringify(feedbacks));
}

/**
 * Submit feedback (App or Card Specific)
 */
export async function submitFeedback(params: {
  userEmail: string;
  userId?: string;
  type: FeedbackType;
  cardTemplateId?: string;
  cardName?: string;
  category: FeedbackCategory;
  message: string;
}): Promise<FeedbackItem> {
  const item: FeedbackItem = {
    id: `fb_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    userEmail: params.userEmail,
    userId: params.userId,
    type: params.type,
    cardTemplateId: params.cardTemplateId,
    cardName: params.cardName,
    category: params.category,
    message: params.message,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  // 1. Save locally
  const list = loadLocalFeedbacks();
  list.unshift(item);
  saveLocalFeedbacks(list);

  // 2. Sync to Supabase if connected
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('feedbacks').insert({
        id: item.id,
        user_id: params.userId || null,
        user_email: item.userEmail,
        type: item.type,
        card_template_id: item.cardTemplateId || null,
        card_name: item.cardName || null,
        category: item.category,
        message: item.message,
        status: 'pending',
      });
    } catch (err) {
      console.warn('Could not sync feedback to Supabase:', err);
    }
  }

  return item;
}

/**
 * Admin updates feedback status (reviewed, resolved)
 */
export async function updateFeedbackStatus(
  feedbackId: string,
  status: 'reviewed' | 'resolved',
  adminNotes?: string
): Promise<boolean> {
  const feedbacks = loadLocalFeedbacks();
  const idx = feedbacks.findIndex((f) => f.id === feedbackId);
  if (idx !== -1) {
    feedbacks[idx] = {
      ...feedbacks[idx],
      status,
      adminNotes: adminNotes || feedbacks[idx].adminNotes,
    };
    saveLocalFeedbacks(feedbacks);
  }

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('feedbacks').update({
        status,
        admin_notes: adminNotes || null,
      }).eq('id', feedbackId);
    } catch {
      // ignore
    }
  }

  return true;
}

/**
 * Admin fetches all feedback items
 */
export async function fetchAllFeedbacks(): Promise<FeedbackItem[]> {
  const localList = loadLocalFeedbacks();

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data } = await supabase.from('feedbacks').select('*').order('created_at', { ascending: false });
      if (data && Array.isArray(data)) {
        const mergedMap = new Map<string, FeedbackItem>();
        localList.forEach((f) => mergedMap.set(f.id, f));
        data.forEach((row) => {
          mergedMap.set(row.id, {
            id: row.id,
            userId: row.user_id,
            userEmail: row.user_email,
            type: row.type,
            cardTemplateId: row.card_template_id,
            cardName: row.card_name,
            category: row.category,
            message: row.message,
            status: row.status,
            adminNotes: row.admin_notes,
            createdAt: row.created_at,
          });
        });
        return Array.from(mergedMap.values());
      }
    } catch {
      // ignore
    }
  }

  return localList;
}
