export const normalizeTagLabel = (value) =>
  String(value ?? '')
    .normalize('NFC')
    .trim()
    .replace(/\s+/gu, ' ');

export const tagSlug = (value) => {
  const label = normalizeTagLabel(value);
  if (!label) throw new Error('Tag labels must not be empty');

  const slug = label
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .toLocaleLowerCase('es')
    .replace(/&/gu, ' and ')
    .replace(/\+/gu, ' plus ')
    .replace(/[^a-z0-9]+/gu, '-')
    .replace(/^-+|-+$/gu, '')
    .replace(/-{2,}/gu, '-');

  if (!slug) throw new Error(`Tag "${label}" does not produce a stable URL slug`);
  return slug;
};

export const postSlug = (id) => String(id).replace(/\.md$/u, '');

export const sortPostsNewestFirst = (posts) =>
  [...posts].sort((left, right) => {
    const byDate = new Date(right.data.date).getTime() - new Date(left.data.date).getTime();
    return byDate || postSlug(left.id).localeCompare(postSlug(right.id), 'es');
  });

export const buildTaxonomy = (posts) => {
  const bySlug = new Map();

  for (const post of posts) {
    const seenForPost = new Set();

    for (const rawTag of post.data.tags ?? []) {
      const label = normalizeTagLabel(rawTag);
      const slug = tagSlug(label);
      if (seenForPost.has(slug)) continue;
      seenForPost.add(slug);

      const existing = bySlug.get(slug);
      if (existing) {
        existing.posts.push(post);
        existing.aliases.add(label);
      } else {
        bySlug.set(slug, {
          slug,
          label,
          aliases: new Set([label]),
          posts: [post],
        });
      }
    }
  }

  return [...bySlug.values()]
    .map((entry) => ({
      ...entry,
      posts: sortPostsNewestFirst(entry.posts),
      aliases: [...entry.aliases].sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' })),
    }))
    .sort((a, b) => a.label.localeCompare(b.label, 'es', { sensitivity: 'base' }));
};
