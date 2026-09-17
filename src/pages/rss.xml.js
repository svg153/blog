import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { SITE } from '@config';

const withTrailingSlash = (value) => (value.endsWith('/') ? value : `${value}/`);

export async function GET(context) {
  const posts = (await getCollection('blog')).sort(
    (a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime(),
  );
  const base = withTrailingSlash(import.meta.env.BASE_URL);

  return rss({
    title: `${SITE.title} — Blog`,
    description: SITE.description,
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: new Date(`${post.data.date}T00:00:00Z`),
      link: `${base}posts/${post.id}/`,
    })),
    customData: '<language>es-es</language>',
  });
}
