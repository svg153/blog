export const BLOG_TIME_ZONE = 'Europe/Madrid';
export const DEFAULT_WORDS_PER_MINUTE = 220;

export const isValidIsoCalendarDate = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/u.test(String(value ?? ''))) return false;
  const date = new Date(value + 'T00:00:00Z');
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
};

export const calendarDateInTimeZone = (now = new Date(), timeZone = BLOG_TIME_ZONE) => {
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now);
  const values = Object.fromEntries(parts.filter((part) => part.type !== 'literal').map((part) => [part.type, part.value]));
  return values.year + '-' + values.month + '-' + values.day;
};

export const isPublished = (post, { now = new Date(), timeZone = BLOG_TIME_ZONE } = {}) => {
  if (post.data.draft) return false;
  return post.data.date <= calendarDateInTimeZone(now, timeZone);
};
export const getPublishedPosts = (posts, options) => posts.filter((post) => isPublished(post, options));

const readableMarkdown = (body) => String(body ?? '')
  .replace(/~~~[\s\S]*?~~~/gu, ' ')
  .replace(/```[\s\S]*?```/gu, ' ')
  .replace(/<!--([\s\S]*?)-->/gu, ' ')
  .replace(/!\[([^\]]*)\]\([^)]*\)/gu, '$1')
  .replace(/\[([^\]]+)\]\([^)]*\)/gu, '$1')
  .replace(/`[^`]*`/gu, ' ')
  .replace(/<[^>]+>/gu, ' ')
  .replace(/[#>*_~|=-]+/gu, ' ');

export const readingTimeMinutes = (body, wordsPerMinute = DEFAULT_WORDS_PER_MINUTE) => {
  if (!Number.isFinite(wordsPerMinute) || wordsPerMinute <= 0) throw new Error('wordsPerMinute must be a positive number');
  const words = readableMarkdown(body).match(/[\p{L}\p{N}]+(?:['’_-][\p{L}\p{N}]+)*/gu) ?? [];
  return Math.max(1, Math.ceil(words.length / wordsPerMinute));
};
export const readingTimeForPost = (post) => readingTimeMinutes(post.body ?? '');
