// Category/subcategory rules — unchanged from the original app so the Digest
// feature and all existing category validation keeps working exactly as before.
export const NOVEL_CATEGORY_RULES = {
  islamic: ['complete-novel', 'afsana', 'episodic-novel', 'novella'],
  romcom: ['complete-novel', 'afsana', 'episodic-novel', 'novella'],
  horror: ['complete-novel', 'afsana', 'episodic-novel', 'novella'],
  historical: ['complete-novel', 'afsana', 'episodic-novel', 'novella'],
  fantasy: ['complete-novel', 'afsana', 'episodic-novel', 'novella'],
  adventure: ['complete-novel', 'afsana', 'episodic-novel', 'novella'],
  mystery: ['complete-novel', 'afsana', 'episodic-novel', 'novella'],
  thrill: ['complete-novel', 'afsana', 'episodic-novel', 'novella'],
  'crime-fiction': ['complete-novel', 'afsana', 'episodic-novel', 'novella'],
  'physiological-thriller': ['complete-novel', 'afsana', 'episodic-novel', 'novella'],
  comedy: ['complete-novel', 'afsana', 'episodic-novel', 'novella'],
  friendship: ['complete-novel', 'afsana', 'episodic-novel', 'novella'],
  'detective-fiction': ['complete-novel', 'afsana', 'episodic-novel', 'novella'],
  'spiritual-fiction': ['complete-novel', 'afsana', 'episodic-novel', 'novella'],
  'action-fiction': ['complete-novel', 'afsana', 'episodic-novel', 'novella'],
  'science-fiction': ['complete-novel', 'afsana', 'episodic-novel', 'novella'],
  romantic: ['complete-novel', 'afsana', 'episodic-novel', 'novella'],
  'social-issues': ['complete-novel', 'afsana', 'episodic-novel', 'novella'],
  'enemy-to-lovers': ['complete-novel', 'afsana', 'episodic-novel', 'novella'],
  'revenge-based': ['complete-novel', 'afsana', 'episodic-novel', 'novella'],
  poetry: [],
  articles: [],
  digest: []
};

export function normalizeKey(value) {
  return String(value || '').trim().toLowerCase();
}

export function isValidCategory(category) {
  return Object.hasOwn(NOVEL_CATEGORY_RULES, category);
}

export function isValidSubcategory(category, subcategory) {
  const allowed = NOVEL_CATEGORY_RULES[category] || [];

  if (allowed.length === 0) {
    return subcategory === '';
  }

  return allowed.includes(subcategory);
}

// Firestore returns Timestamp objects (with a .toDate() method) for any field
// written via FieldValue.serverTimestamp(). The frontend expects plain ISO
// strings (it does `new Date(novel.createdAt)`), so every doc read from
// Firestore must run its timestamp fields through this before leaving the API.
export function normalizeTimestamp(value) {
  if (!value) return null;
  if (typeof value === 'string') return value;
  if (typeof value.toDate === 'function') return value.toDate().toISOString();
  return value;
}

export function normalizeDocTimestamps(doc, fields = ['createdAt', 'updatedAt']) {
  const next = { ...doc };
  for (const field of fields) {
    if (field in next) {
      next[field] = normalizeTimestamp(next[field]);
    }
  }
  return next;
}

export function novelSlugFromTitle(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'novel';
}

export function mapReviewForApi(review) {
  return review;
}
