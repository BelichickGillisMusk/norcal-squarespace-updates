#!/usr/bin/env node
/**
 * Google Places Text → business leads (website / phone / name)
 * Key: GOOGLE_PLACES_API_KEY from Hermes GCP project
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

/**
 * Text Text + details for website.
 * Returns array of { name, phone, website, domain, city, address, place_id, metro, industry, query }
 */
export async function searchPlaces({ query, metro, industry, city, max = 8 }) {
  if (!KEY) {
    throw new Error(
      'GOOGLE_PLACES_API_KEY not set. Get it from Hermes GCP → Places API → paste GitHub secret.'
    );
  }

  const textUrl =
    `https://maps.googleapis.com/maps/api/place/textsearch/json` +
    `?query=${encodeURIComponent(query)}` +
    `&key=${KEY}`;

  const search = await getJson(textUrl);
  if (search.status !== 'OK' && search.status !== 'ZERO_RESULTS') {
    throw new Error(`Places TextSearch ${search.status}: ${search.error_message || ''}`);
  }

  const results = [];
  for (const r of (search.results || []).slice(0, max)) {
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
