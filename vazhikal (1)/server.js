import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// API endpoint for AI-curated discovery using Gemini
app.post('/api/gemini/inspire', async (req, res) => {
  const { vibe } = req.body;
  if (!vibe) {
    return res.status(400).json({ error: 'vibe parameter is required' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY environment variable is not defined - returning premium mock fallback data.');
    return res.json({
      id: 'ai-gen-' + Date.now(),
      title: 'Echoes of the Mist: Custom ' + vibe + ' Journey',
      location: 'Ubud Highlands, Bali',
      cost: '$620 USD',
      duration: '4 Days, 3 Nights',
      difficulty: 'Easy',
      description: `This custom itinerary has been curated to resonate perfectly with your mood of: "${vibe}". In the serene mountain mist of central Bali, discover private organic gardens, quiet riversides, and tiny artisan cafes where time stays completely still.`,
      highlights: ['Morning Meditation Ridge', 'Stone Carver Workspace Tour', 'Sunset Herbal Brews'],
      dayByDay: [
        {
          day: 1,
          title: 'Arrival in the Highland Ridge',
          description: 'Transfer smoothly to a secluded eco-cottage. Unpack and take a grounding walking trail next to rushing bamboo channels, ending at an organic open-air cafe.',
          badges: ['Eco Lodge', 'Artisanal Tea', 'Grounding Hikes']
        },
        {
          day: 2,
          title: 'Forgotten Temples & Mountain Streams',
          description: 'Hike uphill past centuries-old shrines. Encounter skilled stone carvers working on fresh moss statues and plunge into a crystal-clear wild freshwater basin.',
          badges: ['Hidden Springs', 'Ancient Carvings']
        },
        {
          day: 3,
          title: 'Weaving Shrines & Sunset Ridge Walk',
          description: 'Participate in a peaceful hands-on basketry circle guided by local village elders, then ascend Campuhan ridge for a stunning mist-dappled sunset.',
          badges: ['Local Craft', 'Panoramic Sights']
        }
      ],
      mocked: true
    });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `You are an expert travel coordinator for the modern travel matching site "Vazhikal".
The user wants an incredible curated journey matching this vibe description: "${vibe}".
Identify a breathtaking spot on Earth (real destination) matching this feeling and return a fully detailed professional itinerary.
CRITICAL: You must return a valid, parsable JSON block matching the structure below. Do NOT write any conversational intro or wrap the response in markdown blocks or backticks.

{
  "title": "A highly creative, elegant title matching this vibe.",
  "location": "A vivid real-world city and country destination.",
  "cost": "Estimated Cost estimate (e.g. $850 USD)",
  "duration": "E.g. 3 Days, 2 Nights",
  "difficulty": "Easy" or "Moderate" or "Challenging",
  "description": "An engaging, romantic, highly detailed 3-4 sentence narrative detailing key architectural styles, culinary wonders, local people, and overall visual environment.",
  "highlights": ["Highlight 1", "Highlight 2", "Highlight 3"],
  "dayByDay": [
    {
      "day": 1,
      "title": "Detailed Day 1 Theme title",
      "description": "Explain in 2-3 sentences the walking path, meals, resting spots, and evening mood.",
      "badges": ["Culture", "Food", "Hustle"]
    },
    {
      "day": 2,
      "title": "Detailed Day 2 Theme title",
      "description": "Give a 2-3 sentence breakdown of the main hidden highlights, moss parks, local guides, or sunset vista views.",
      "badges": ["Nature", "Art"]
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
    });

    const responseText = response.text || '';
    let cleanText = responseText.trim();
    if (cleanText.startsWith('```')) {
      cleanText = cleanText.replace(/^```json?\s*/i, '').replace(/```\s*$/, '');
    }

    const parsedData = JSON.parse(cleanText.trim());
    return res.json({
      id: 'ai-gen-' + Date.now(),
      ...parsedData
    });

  } catch (err) {
    console.error('Error in /api/gemini/inspire endpoint:', err);
    return res.status(500).json({ error: err.message || 'Internal AI generation failure' });
  }
});

// Setup Vite Development or Production Server
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Vazhikal custom server listening on port ${PORT}`);
  });
}

startServer();
