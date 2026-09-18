import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import {
  executePlateVisionWaterfall,
  executeRecipeWaterfall,
  getWaterfallProvidersStatus,
  FoodAnalysisResponse,
} from './server/aiWaterfallRouter';

dotenv.config();

const PORT = 3000;

// Smart In-Memory Optical Plate & Nutrition Cache
// Provides instant sub-20ms responses for repeated foods/plates with 0 API token cost
interface CachedVisionEntry {
  result: FoodAnalysisResponse;
  timestamp: number;
}

const foodVisionCache = new Map<string, CachedVisionEntry>();

function computeImageSignature(base64: string, note?: string): string {
  const cleanNote = (note || '').trim().toLowerCase();
  const len = base64.length;
  // Sample 4 distinct slices across the image payload
  const s1 = base64.slice(0, 100);
  const s2 = base64.slice(Math.floor(len * 0.33), Math.floor(len * 0.33) + 100);
  const s3 = base64.slice(Math.floor(len * 0.66), Math.floor(len * 0.66) + 100);
  const s4 = base64.slice(Math.max(0, len - 100));
  return `${len}_${cleanNote}_${s1}_${s2}_${s3}_${s4}`;
}

async function startServer() {
  const app = express();

  // CORS support for mobile APK / Capacitor WebViews and cross-origin clients
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // Support large base64 image uploads from camera or device storage
  app.use(express.json({ limit: '30mb' }));
  app.use(express.urlencoded({ extended: true, limit: '30mb' }));

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'Vision & Nutrition Intelligence Engine',
      cachedItemsCount: foodVisionCache.size,
      ready: true,
    });
  });

  // Multi-Provider Waterfall Status & Telemetry
  app.get('/api/ai-providers-status', (_req, res) => {
    res.json({
      status: 'ok',
      executionOrder: 'Waterfall from Priority 9 down to Priority 1 (Open Source / Free Tier first, then Gemini), with Tier 0 Local Deterministic Engine',
      providers: getWaterfallProvidersStatus(),
    });
  });

  // Food Vision Analysis Endpoint with Reverse Waterfall Routing (9 -> 8 -> 7 -> 6 -> 5 -> 4 -> 3 -> 2 -> 1 -> 0)
  app.post('/api/analyze-food', async (req, res) => {
    try {
      const { image, note, language } = req.body;

      if (!image) {
        return res.status(400).json({ error: 'Image data is required' });
      }

      // 1. Check Smart In-Memory Optical Cache (Zero AI Cost for repeated foods)
      const cacheKey = computeImageSignature(image, note);
      const cached = foodVisionCache.get(cacheKey);
      if (cached) {
        console.log(`[Smart Optical Cache Hit] Serving instant 0-cost nutrition for "${cached.result.mealName}"`);
        return res.json({
          ...cached.result,
          cached: true,
        });
      }

      // Parse base64 and mime type
      let mimeType = 'image/jpeg';
      let base64Data = image;

      if (image.startsWith('data:')) {
        const matches = image.match(/^data:([^;]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
          mimeType = matches[1];
          base64Data = matches[2];
        }
      }

      // Execute AI Waterfall across providers (Priority 9 down to 1, then Tier 0 Local Fallback)
      const result = await executePlateVisionWaterfall(base64Data, mimeType, note, language);

      // Cache the result in memory for 0-cost instant repeated scans
      foodVisionCache.set(cacheKey, {
        result,
        timestamp: Date.now(),
      });

      return res.json(result);
    } catch (err: any) {
      console.error('Vision analysis error:', err);
      return res.status(500).json({
        error: 'Unable to analyze image. Please verify image format and click Retry Scan.',
        details: err.message,
      });
    }
  });

  // AI Ingredient-to-Recipe Generation Endpoint (Raw materials to finished dish & macros)
  // Executes reverse waterfall (9 down to 1, then Tier 0 Deterministic Culinary Chef)
  app.post('/api/generate-recipe-from-ingredients', async (req, res) => {
    try {
      const { ingredients, dietaryPreference = 'veg', mealType = 'lunch', targetKcal, notes, language = 'en' } = req.body;

      if (!ingredients || (typeof ingredients === 'string' && !ingredients.trim()) || (Array.isArray(ingredients) && ingredients.length === 0)) {
        return res.status(400).json({ error: 'Please provide at least one raw ingredient or food item' });
      }

      const rawIngredientsText = Array.isArray(ingredients) ? ingredients.join(', ') : String(ingredients);

      const recipe = await executeRecipeWaterfall({
        ingredients: rawIngredientsText,
        dietaryPreference,
        mealType,
        targetKcal,
        notes,
        language,
      });

      return res.json(recipe);
    } catch (err: any) {
      console.error('Recipe generation error:', err);
      return res.status(500).json({ error: 'Failed to generate recipe from ingredients', details: err.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CultPulse server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
