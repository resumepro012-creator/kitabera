export function slugify(value) {
  return (
    String(value || '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'item'
  );
}

// Appends a short random suffix to keep slugs unique even when two writers
// (or two novels by the same writer) share the same title.
export function uniqueSlug(value) {
  const base = slugify(value);
  const suffix = Math.random().toString(36).slice(2, 8);
  return `${base}-${suffix}`;
}
