import { getPublishedPosts } from './content-lifecycle.mjs';
import { postSlug, tagSlug } from './taxonomy.mjs';

const normalizedTags = (post) =>
  new Set((post.data.tags ?? []).map((tag) => tagSlug(tag)));

const compareSlug = (left, right) => {
  const a = postSlug(left.id);
  const b = postSlug(right.id);
  return a < b ? -1 : a > b ? 1 : 0;
};

export const relatedPostsFor = (
  current,
  posts,
  {
    limit = 3,
    publicationOptions,
  } = {},
) => {
  if (!Number.isInteger(limit) || limit < 0) {
    throw new Error('Related-post limit must be a non-negative integer');
  }

  if (limit === 0) return [];

  const currentSeries = current.data.series?.id;
  const currentTags = normalizedTags(current);

  return getPublishedPosts(posts, publicationOptions)
    .filter((candidate) => candidate.id !== current.id)
    .map((candidate) => {
      const candidateTags = normalizedTags(candidate);
      const sharedTags = [...currentTags]
        .filter((slug) => candidateTags.has(slug))
        .sort();

      return {
        post: candidate,
        sameSeries: Boolean(
          currentSeries
          && candidate.data.series?.id === currentSeries,
        ),
        sharedTagCount: sharedTags.length,
        sharedTags,
      };
    })
    .sort((left, right) => {
      if (left.sameSeries !== right.sameSeries) {
        return left.sameSeries ? -1 : 1;
      }

      if (left.sharedTagCount !== right.sharedTagCount) {
        return right.sharedTagCount - left.sharedTagCount;
      }

      if (left.post.data.date !== right.post.data.date) {
        return right.post.data.date.localeCompare(left.post.data.date);
      }

      return compareSlug(left.post, right.post);
    })
    .slice(0, limit);
};
