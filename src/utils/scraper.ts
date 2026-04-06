import { config } from '../config';

export const scrapeJobDescription = async (url: string): Promise<string> => {
  const jinaKey = config.get('jinaApiKey');
  const headers: Record<string, string> = {};
  if (jinaKey) {
    headers['Authorization'] = `Bearer ${jinaKey}`;
  }

  const jinaUrl = `https://r.jina.ai/${url}`;
  const response = await fetch(jinaUrl, { headers });

  if (!response.ok) {
    throw new Error(`Jina Reader error (${response.status}): ${response.statusText} for URL: ${url}`);
  }

  return response.text();
};
