export const DEV_ENDPOINT = 'https://dev.to/api/articles';
export const LINKEDIN_ENDPOINT = 'https://api.linkedin.com/rest/posts';
export const LINKEDIN_CURRENT_VERSION = '202609';

const requireValue = (value, name) => {
  if (!value) throw new Error(`Missing runtime credential/configuration: ${name}`);
  return value;
};

export const describeDevRequest = (channelPlan) => ({
  transport: 'forem-api-v1',
  method: 'POST',
  url: DEV_ENDPOINT,
  headers: {
    Accept: 'application/vnd.forem.api-v1+json',
    'Content-Type': 'application/json',
    'User-Agent': 'svg153-blog-publisher/1',
    'api-key': '[runtime:DEV_API_KEY]',
  },
  body: channelPlan.payload,
});

export const publishDev = async (
  channelPlan,
  { env = process.env, fetchImpl = fetch } = {},
) => {
  const apiKey = requireValue(env.DEV_API_KEY, 'DEV_API_KEY');
  const request = describeDevRequest(channelPlan);
  const response = await fetchImpl(request.url, {
    method: request.method,
    headers: {
      ...request.headers,
      'api-key': apiKey,
    },
    body: JSON.stringify(request.body),
  });

  const text = await response.text();
  let parsed;
  try {
    parsed = text ? JSON.parse(text) : {};
  } catch {
    parsed = { message: text };
  }

  if (!response.ok) {
    throw new Error(`DEV API returned HTTP ${response.status}: ${parsed.error ?? parsed.message ?? 'request failed'}`);
  }

  return {
    status: response.status,
    externalId: parsed.id ? String(parsed.id) : undefined,
    externalUrl: parsed.url ?? parsed.canonical_url,
  };
};

export const linkedInManualPayload = (channelPlan) => ({
  mode: 'manual-ready',
  commentary: channelPlan.payload.commentary,
  canonicalUrl: channelPlan.payload.canonicalUrl,
});

export const describeLinkedInRequest = (
  channelPlan,
  {
    author = '[runtime:LINKEDIN_AUTHOR_URN]',
    version = '[runtime:LINKEDIN_VERSION]',
  } = {},
) => ({
  transport: 'linkedin-posts-api',
  method: 'POST',
  url: LINKEDIN_ENDPOINT,
  headers: {
    Authorization: 'Bearer [runtime:LINKEDIN_ACCESS_TOKEN]',
    'Content-Type': 'application/json',
    'Linkedin-Version': version,
    'X-Restli-Protocol-Version': '2.0.0',
  },
  body: {
    author,
    commentary: channelPlan.payload.commentary,
    visibility: 'PUBLIC',
    distribution: {
      feedDistribution: 'MAIN_FEED',
      targetEntities: [],
      thirdPartyDistributionChannels: [],
    },
    lifecycleState: 'PUBLISHED',
    isReshareDisabledByAuthor: false,
  },
});

export const publishLinkedIn = async (
  channelPlan,
  { env = process.env, fetchImpl = fetch } = {},
) => {
  const token = requireValue(env.LINKEDIN_ACCESS_TOKEN, 'LINKEDIN_ACCESS_TOKEN');
  const author = requireValue(env.LINKEDIN_AUTHOR_URN, 'LINKEDIN_AUTHOR_URN');
  const version = requireValue(env.LINKEDIN_VERSION, 'LINKEDIN_VERSION');

  if (!/^urn:li:(?:person|organization):/u.test(author)) {
    throw new Error('LINKEDIN_AUTHOR_URN must be a person or organization URN');
  }
  if (!/^\d{6}$/u.test(version)) {
    throw new Error('LINKEDIN_VERSION must use YYYYMM format (current documented version: 202609)');
  }

  const request = describeLinkedInRequest(channelPlan, { author, version });
  const response = await fetchImpl(request.url, {
    method: request.method,
    headers: {
      ...request.headers,
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(request.body),
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(`LinkedIn Posts API returned HTTP ${response.status}: ${text || 'request failed'}`);
  }

  return {
    status: response.status,
    externalId: response.headers.get('x-restli-id') ?? undefined,
  };
};

export const describeNewsletterExport = (channelPlan) => ({
  transport: 'provider-neutral-export',
  mode: 'export-only',
  payload: channelPlan.payload,
});
