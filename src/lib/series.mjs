import { postSlug } from './taxonomy.mjs';

const normalizedName = (value) => String(value ?? '').trim().replace(/\s+/gu, ' ');

export const buildSeries = (posts) => {
  const groups = new Map();

  for (const post of posts) {
    const metadata = post.data.series;
    if (!metadata) continue;

    const id = metadata.id;
    const name = normalizedName(metadata.name);
    const order = metadata.order;

    if (!id || !name || !Number.isInteger(order) || order <= 0) {
      throw new Error(`Invalid series metadata on ${postSlug(post.id)}`);
    }

    const existing = groups.get(id);
    if (existing && existing.name !== name) {
      throw new Error(
        `Series "${id}" uses inconsistent names: "${existing.name}" and "${name}"`,
      );
    }

    const group = existing ?? {
      id,
      name,
      posts: [],
      orders: new Set(),
    };

    if (group.orders.has(order)) {
      throw new Error(`Series "${id}" has duplicate order ${order}`);
    }

    group.orders.add(order);
    group.posts.push(post);
    groups.set(id, group);
  }

  return [...groups.values()]
    .map((group) => ({
      id: group.id,
      name: group.name,
      posts: [...group.posts].sort((left, right) => {
        const byOrder = left.data.series.order - right.data.series.order;
        return byOrder || postSlug(left.id).localeCompare(postSlug(right.id), 'es');
      }),
    }))
    .sort((left, right) => left.name.localeCompare(right.name, 'es', { sensitivity: 'base' }));
};

export const seriesContextForPost = (groups, post) => {
  const metadata = post.data.series;
  if (!metadata) return undefined;

  const group = groups.find((candidate) => candidate.id === metadata.id);
  if (!group) throw new Error(`Series "${metadata.id}" not found for ${postSlug(post.id)}`);

  const index = group.posts.findIndex((candidate) => candidate.id === post.id);
  if (index < 0) throw new Error(`Post ${postSlug(post.id)} missing from series "${group.id}"`);

  const toLink = (entry) =>
    entry
      ? {
          slug: postSlug(entry.id),
          title: entry.data.title,
        }
      : undefined;

  return {
    id: group.id,
    name: group.name,
    order: metadata.order,
    position: index + 1,
    total: group.posts.length,
    previous: toLink(group.posts[index - 1]),
    next: toLink(group.posts[index + 1]),
  };
};
