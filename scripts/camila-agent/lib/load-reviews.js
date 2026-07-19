import fs from 'fs';
import path from 'path';

const REVIEWS_PATH = path.resolve(
  import.meta.dirname,
  '../../../config/reviews.json'
);

/** @returns {import('../../../config/reviews.json')} */
export function loadReviews() {
  return JSON.parse(fs.readFileSync(REVIEWS_PATH, 'utf8'));
}

export function reviewLineWithUrl(reviews = loadReviews()) {
  const url =
    reviews.google_reviews_url_short || reviews.google_reviews_url;
  return `${reviews.email_copy_line}: ${url}`;
}

export function reviewLineFleetWithUrl(reviews = loadReviews()) {
  const url =
    reviews.google_reviews_url_short || reviews.google_reviews_url;
  return `${reviews.headline_fleet}: ${url}`;
}
