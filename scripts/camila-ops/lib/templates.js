#!/usr/bin/env node
/** Cold templates — pricing + 33 reviews */

import fs from 'fs';
import path from 'path';

const reviewsPath = path.resolve(import.meta.dirname, '../../../config/reviews.json');
const coldPath = path.resolve(import.meta.dirname, '../../../config/cold-email-manifest.json');

const reviews = JSON.parse(fs.readFileSync(reviewsPath, 'utf8'));
const cold = JSON.parse(fs.readFileSync(coldPath, 'utf8'));

const REVIEWS_URL = cold.reviews?.google_reviews_url_short || reviews.google_reviews_url_short;
const REVIEWS_LINE = reviews.email_copy_line || '★ 5 stars · 33 Google reviews';
const BOOKING = cold.urls?.booking || 'https://norcalcarbmobile.com/contact';

export function renderCraneEmail({ company, city, industry_hook }) {
  const first = 'there';
  const hook = industry_hook || 'diesel equipment';
  const subject = `$75 mobile CTC for ${company} — ${city}`;
  const body = `Hi ${first},

Saw ${company} serving ${city} — if your ${hook} runs diesel 14k+ GVWR, CARB Clean Truck Check windows sneak up fast.

NorCal CARB Mobile comes to your yard:
• OBD $75 · OVI $199
• Motorhome OBD $99 · Motorhome OVI $229
• Switch: 50% off first test, or send your quote — we'll try to beat it

${REVIEWS_LINE}: ${REVIEWS_URL}

Book: ${BOOKING} · 916-890-4427

Camila · NorCal CARB Mobile
camila@norcalcarbmobile.com

Reply "remove" to opt out.`;

  return { subject, body };
}
