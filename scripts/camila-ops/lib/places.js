#!/usr/bin/env node
/**
 * Google Places Text → business leads (website / phone / name)
 * Key: GOOGLE_PLACES_API_KEY from Hermes GCP project
 *
 * Paginates Text Search (up to 3 pages ≈ 60 results/query) so we can
 * pull hundreds of tow/crane/concrete candidates and skim ~20 MX-ok emails.
 */

import https from 'https';

const KEY = process.env.GOOGLE_PLACES_API_KEY || '';

function getJson(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { 'User-Agent': 'NorCalCamilaOps/1.0' } }, (res) => {
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(e);
          }
        });
      })
      .on('error', reject);
  });
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Paginated text search. Google caps at 60 results (3×20) per query.
 */
export async function searchPlaces({ query, metro, industry, city, max = 60 }) {
  if (!KEY) {
    throw new Error(
      'GOOGLE_PLACES_API_KEY not set. Get it from Hermes GCP → Places API → paste GitHub secret.'
    );
  }

  const raw = [];
  let pageToken = null;
  let pages = 0;

  while (raw.length < max && pages < 3) {
    pages++;
    let url =
      `https://maps.googleapis.com/maps/api/place/textsearch/json` +
      `?query=${encodeURIComponent(query)}` +
      `&key=${KEY}`;
    if (pageToken) url += `&pagetoken=${pageToken}`;

    // next_page_token needs a short delay before it becomes valid
    if (pageToken) await sleep(2000);

    const search = await getJson(url);
    if (search.status === 'ZERO_RESULTS') break;
    if (search.status === 'INVALID_REQUEST' && pageToken) {
      await sleep(2000);
      continue;
    }
    if (search.status !== 'OK') {
      throw new Error(`Places TextSearch ${search.status}: ${search.error_message || ''}`);
    }

    for (const r of search.results || []) {
      raw.push(r);
      if (raw.length >= max) break;
    }

    pageToken = search.next_page_token || null;
    if (!pageToken) break;
  }

  const results = [];
  for (const r of raw.slice(0, max)) {
    let website = null;
    let domain = null;
    let phone = r.formatted_phone_number || null;

    if (r.place_id) {
      const detUrl =
        `https://maps.googleapis.com/maps/api/place/details/json` +
        `?place_id=${r.place_id}` +
        `&fields=name,website,formatted_phone_number,formatted_address` +
        `&key=${KEY}`;
      try {
        const det = await getJson(detUrl);
        if (det.result?.website) {
          website = det.result.website;
          try {
            domain = new URL(website).hostname.replace(/^www\./, '');
          } catch {
            domain = null;
          }
        }
        phone = det.result?.formatted_phone_number || phone;
      } catch {
        /* keep textsearch fields */
      }
    }

    results.push({
      name: r.name,
      phone,
      website,
      domain,
      city: city || metro,
      address: r.formatted_address || '',
      place_id: r.place_id,
      metro,
      industry,
      query,
      rating: r.rating || null,
    });
  }

  return results;
}

export function hasPlacesKey() {
  return Boolean(KEY);
}
