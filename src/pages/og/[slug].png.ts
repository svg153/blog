import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import { renderSocialCard } from '../../lib/social-card.mjs';
import { getPublishedPosts } from '../../lib/content-lifecycle.mjs';

export const prerender = true;

export const getStaticPaths = (async () => {
  const posts = getPublishedPosts(await getCollection('blog'));

  return posts.map((post) => ({
    params: { slug: post.id },
    props: {
      title: post.data.title,
      tags: post.data.tags ?? [],
      date: post.data.date,
    },
  }));
}) satisfies GetStaticPaths;

export const GET: APIRoute = ({ props }) => {
  const png = renderSocialCard({
    title: props.title,
    tags: props.tags,
    date: props.date,
    variant: 'article',
  });

  return new Response(new Uint8Array(png), {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
