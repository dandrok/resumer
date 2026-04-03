import axios from 'axios';
import { config } from '../config';

export const scrapeJobDescription = async (url: string): Promise<string> => {
  const jinaKey = config.get('jinaApiKey');
  const headers: Record<string, string> = {};
  if (jinaKey) {
    headers['Authorization'] = `Bearer ${jinaKey}`;
  }

  const jinaUrl = `https://r.jina.ai/${url}`;
  try {
    const response = await axios.get(jinaUrl, { headers });
    return response.data;
  } catch (err: any) {
    if (err.response) {
      throw new Error(`Jina Reader error (${err.response.status}): ${err.response.statusText} for URL: ${url}`);
    }
    throw err;
  }
};
