import fs from 'fs';
import path from 'path';
import { initDatabase } from './src/config/database.js';
import Settings from './src/models/Settings.js';

const GALLERY_DIR = path.join(process.cwd(), 'uploads', 'gallery');
const VALID_CATEGORIES = ['printing', 'design', 'photography', 'events', 'studio', 'others'];

function normalizeCategory(cat: string | undefined | null): string {
  const c = (cat || 'others').toLowerCase().trim();
  return VALID_CATEGORIES.includes(c) ? c : 'others';
}

function normalizeGalleryItems(raw: any): { url: string; category: string }[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (typeof item === 'string') {
        return { url: item, category: 'others' };
      }
      if (item && typeof item === 'object' && typeof item.url === 'string') {
        return { url: item.url, category: normalizeCategory(item.category) };
      }
      return null;
    })
    .filter((i): i is { url: string; category: string } => i !== null);
}

async function main() {
  await initDatabase();

  const existing = await Settings.findOne({ where: { key: 'general' } });
  let settings: any = {};
  if (existing?.value) {
    try {
      settings = JSON.parse(existing.value);
    } catch {
      settings = {};
    }
  }

  const current = normalizeGalleryItems(settings.galleryImages);
  const currentUrls = new Set(current.map((i) => i.url));

  // Scan the gallery uploads folder for image files
  let files: string[] = [];
  if (fs.existsSync(GALLERY_DIR)) {
    files = fs
      .readdirSync(GALLERY_DIR)
      .filter((f) => /\.(jpe?g|png|webp|gif)$/i.test(f))
      .sort();
  }

  const newItems: { url: string; category: string }[] = [];
  for (const f of files) {
    const url = `/uploads/gallery/${f}`;
    if (!currentUrls.has(url)) {
      newItems.push({ url, category: 'others' });
    }
  }

  if (newItems.length > 0) {
    const next = {
      ...settings,
      galleryImages: [...current, ...newItems],
    };
    if (existing) {
      await Settings.update({ value: JSON.stringify(next) }, { where: { key: 'general' } });
    } else {
      await Settings.create({ key: 'general', value: JSON.stringify(next) });
    }
    console.log(`Added ${newItems.length} gallery image(s) from disk.`);
  } else {
    console.log('No new gallery images to add.');
  }

  // Print final state
  const refreshed = await Settings.findOne({ where: { key: 'general' } });
  const finalSettings = refreshed?.value ? JSON.parse(refreshed.value) : {};
  const finalItems = normalizeGalleryItems(finalSettings.galleryImages);
  console.log(`Total gallery images in DB: ${finalItems.length}`);
  finalItems.forEach((i) => console.log(' -', i.url, `(${i.category})`));

  process.exit(0);
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
