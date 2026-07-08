import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, 'data');
const dataFile = path.join(dataDir, 'db.json');

const seedDb = {
  writers: [],
  novels: [],
  reviews: []
};

async function ensureDbFile() {
  try {
    await fs.mkdir(dataDir, { recursive: true });
    await fs.access(dataFile);
  } catch {
    await fs.writeFile(dataFile, JSON.stringify(seedDb, null, 2), 'utf8');
  }
}

export async function readDb() {
  await ensureDbFile();
  const raw = await fs.readFile(dataFile, 'utf8');
  const data = JSON.parse(raw);
  return {
    writers: Array.isArray(data.writers) ? data.writers : [],
    novels: Array.isArray(data.novels) ? data.novels : [],
    reviews: Array.isArray(data.reviews) ? data.reviews : []
  };
}

export async function writeDb(db) {
  await ensureDbFile();
  await fs.writeFile(dataFile, JSON.stringify({
    writers: db.writers || [],
    novels: db.novels || [],
    reviews: db.reviews || []
  }, null, 2), 'utf8');
}

export function publicWriter(writer) {
  return writer;
}

export function publicNovel(novel) {
  return novel;
}

export function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'writer';
}
