import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import Settings from '../models/Settings.js';
const router = Router();
const VALID_CATEGORIES = ['printing', 'design', 'photography', 'events', 'studio', 'others'];
const GALLERY_DIR = path.join(process.cwd(), 'uploads', 'gallery');
// Fallback: when the DB has no galleryImages but files exist on disk, scan the
// uploads/gallery folder and build the list from disk. This keeps the public
// gallery working even if the DB references were lost/reset.
function galleryItemsFromDisk() {
    try {
        if (!fs.existsSync(GALLERY_DIR))
            return [];
        return fs
            .readdirSync(GALLERY_DIR)
            .filter((f) => /\.(jpe?g|png|webp|gif)$/i.test(f))
            .sort()
            .map((f) => ({ url: `/uploads/gallery/${f}`, category: 'others' }));
    }
    catch {
        return [];
    }
}
function normalizeCategory(cat) {
    const c = (cat || 'others').toLowerCase().trim();
    return VALID_CATEGORIES.includes(c) ? c : 'others';
}
/**
 * Normalize galleryImages (which may be legacy plain strings or objects with
 * url+category) into a canonical array of { url, category } objects.
 */
function normalizeGalleryItems(raw) {
    if (!Array.isArray(raw))
        return [];
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
        .filter((i) => i !== null);
}
// Public gallery endpoint - no auth required so visitors/customers can view images
router.get('/', async (_req, res) => {
    try {
        const existing = await Settings.findOne({ where: { key: 'general' } });
        let galleryItems = [];
        if (existing?.value) {
            try {
                const settings = JSON.parse(existing.value);
                galleryItems = normalizeGalleryItems(settings.galleryImages);
            }
            catch {
                galleryItems = [];
            }
        }
        // If the DB has no gallery images, fall back to scanning the uploads folder
        // so the public gallery (guest/navbar) still shows the images on disk.
        if (galleryItems.length === 0) {
            galleryItems = galleryItemsFromDisk();
        }
        res.json({ galleryImages: galleryItems });
    }
    catch (error) {
        console.error('Failed to fetch gallery:', error);
        res.status(500).json({ error: 'Failed to fetch gallery' });
    }
});
export default router;
//# sourceMappingURL=gallery.js.map