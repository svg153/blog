import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { Resvg } from '@resvg/resvg-js';

export const CARD_WIDTH = 1200;
export const CARD_HEIGHT = 630;

const require = createRequire(import.meta.url);
const fontRoot = dirname(require.resolve('@fontsource/inter/latin-400.css'));
const fontFiles = [
  join(fontRoot, 'files', 'inter-latin-400-normal.woff2'),
  join(fontRoot, 'files', 'inter-latin-700-normal.woff2'),
];

const xmlEntities = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&apos;',
};

export const escapeXml = (value = '') =>
  String(value).replace(/[&<>"']/gu, (char) => xmlEntities[char]);

const charLength = (value) => Array.from(value).length;

const clipChars = (value, maxChars) => {
  const chars = Array.from(value);
  return chars.length <= maxChars ? value : `${chars.slice(0, Math.max(1, maxChars - 1)).join('')}…`;
};

const splitLongToken = (token, maxChars) => {
  const chars = Array.from(token);
  if (chars.length <= maxChars) return [token];

  const parts = [];
  for (let index = 0; index < chars.length; index += maxChars) {
    parts.push(chars.slice(index, index + maxChars).join(''));
  }
  return parts;
};

const titleProfile = (title) => {
  const length = charLength(title);
  if (length <= 55) return { maxChars: 29, fontSize: 64, lineHeight: 72, maxLines: 4 };
  if (length <= 95) return { maxChars: 34, fontSize: 56, lineHeight: 64, maxLines: 4 };
  return { maxChars: 39, fontSize: 50, lineHeight: 58, maxLines: 4 };
};

export const layoutTitle = (rawTitle) => {
  const title = String(rawTitle ?? '').replace(/\s+/gu, ' ').trim() || 'Sergio Valverde';
  const profile = titleProfile(title);
  const tokens = title
    .split(' ')
    .flatMap((token) => splitLongToken(token, profile.maxChars));

  const lines = [];
  let current = '';
  let truncated = false;

  for (const token of tokens) {
    const candidate = current ? `${current} ${token}` : token;
    if (charLength(candidate) <= profile.maxChars) {
      current = candidate;
      continue;
    }

    if (current) lines.push(current);
    current = token;

    if (lines.length === profile.maxLines) {
      truncated = true;
      current = '';
      break;
    }
  }

  if (current && lines.length < profile.maxLines) {
    lines.push(current);
  } else if (current) {
    truncated = true;
  }

  if (tokens.length > 0 && lines.length === profile.maxLines) {
    const consumed = lines.reduce((sum, line) => sum + line.split(' ').length, 0);
    if (consumed < tokens.length) truncated = true;
  }

  if (truncated && lines.length > 0) {
    lines[lines.length - 1] = clipChars(lines[lines.length - 1], profile.maxChars - 1).replace(/…?$/u, '…');
  }

  return { ...profile, lines, truncated };
};

const formatDate = (value) => {
  if (!value) return '';
  const date = new Date(`${value}T12:00:00Z`);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
};

const compactTags = (tags = []) => {
  const unique = [...new Set(tags.map((tag) => String(tag).trim()).filter(Boolean))];
  return clipChars(unique.slice(0, 4).join(' · '), 58);
};

const titleTspans = ({ lines, lineHeight }) => {
  const startY = lines.length >= 4 ? 174 : lines.length === 3 ? 192 : 214;
  return lines
    .map((line, index) => `<tspan x="80" y="${startY + (index * lineHeight)}">${escapeXml(line)}</tspan>`)
    .join('');
};

export const renderSocialCard = ({
  title,
  tags = [],
  date,
  subtitle,
  variant = 'article',
} = {}) => {
  const titleLayout = layoutTitle(title);
  const dateText = formatDate(date);
  const tagsText = compactTags(tags);
  const footerLeft = variant === 'article' && dateText ? dateText : 'svg153.github.io/blog';
  const footerRight = variant === 'article' && tagsText ? tagsText : 'GitHub · IA · DevSecOps';

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${CARD_WIDTH}" height="${CARD_HEIGHT}" viewBox="0 0 ${CARD_WIDTH} ${CARD_HEIGHT}">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#0d1117"/>
        <stop offset="100%" stop-color="#161b22"/>
      </linearGradient>
      <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#58a6ff"/>
        <stop offset="100%" stop-color="#a371f7"/>
      </linearGradient>
    </defs>
    <rect width="1200" height="630" fill="url(#bg)"/>
    <circle cx="1110" cy="68" r="180" fill="#58a6ff" opacity="0.045"/>
    <circle cx="1150" cy="590" r="250" fill="#a371f7" opacity="0.035"/>
    <rect x="80" y="106" width="96" height="5" rx="2.5" fill="url(#accent)"/>

    <text x="80" y="82" fill="#8b949e" font-family="Inter" font-size="22" font-weight="700" letter-spacing="2.4">SERGIO VALVERDE · BLOG</text>

    <text fill="#f0f6fc" font-family="Inter" font-size="${titleLayout.fontSize}" font-weight="700">
      ${titleTspans(titleLayout)}
    </text>

    ${subtitle ? `<text x="80" y="402" fill="#8b949e" font-family="Inter" font-size="30" font-weight="400">${escapeXml(clipChars(subtitle, 68))}</text>` : ''}

    <line x1="80" y1="500" x2="1120" y2="500" stroke="#30363d" stroke-width="1"/>
    <text x="80" y="552" fill="#c9d1d9" font-family="Inter" font-size="24" font-weight="400">${escapeXml(footerLeft)}</text>
    <text x="1120" y="552" text-anchor="end" fill="#58a6ff" font-family="Inter" font-size="22" font-weight="700">${escapeXml(footerRight)}</text>
    <text x="80" y="594" fill="#6e7681" font-family="Inter" font-size="18" font-weight="400">Desarrollo · herramientas · opiniones</text>
  </svg>`;

  const resvg = new Resvg(svg, {
    fitTo: { mode: 'original' },
    background: '#0d1117',
    font: {
      fontFiles,
      loadSystemFonts: false,
      defaultFontFamily: 'Inter',
      sansSerifFamily: 'Inter',
    },
    textRendering: 2,
    shapeRendering: 2,
  });

  const rendered = resvg.render();
  if (rendered.width !== CARD_WIDTH || rendered.height !== CARD_HEIGHT) {
    throw new Error(`Unexpected social card dimensions: ${rendered.width}x${rendered.height}`);
  }

  return rendered.asPng();
};
