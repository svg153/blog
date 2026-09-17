import type { APIRoute } from 'astro';
import { SITE } from '@config';
import { renderSocialCard } from '../../lib/social-card.mjs';

export const prerender = true;

export const GET: APIRoute = () => {
  const png = renderSocialCard({
    title: SITE.title,
    subtitle: SITE.description,
    variant: 'site',
  });

  return new Response(new Uint8Array(png), {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
