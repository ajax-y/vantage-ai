const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const db = require('./db');
const { generatePureAIItinerary, fetchRealPlaceImage } = require('./smartItinerary');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize Gemini API
const geminiApiKey = process.env.GEMINI_API_KEY;
let aiModel = null;
if (geminiApiKey) {
  try {
    const genAI = new GoogleGenerativeAI(geminiApiKey);
    aiModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    console.log('Gemini AI Model initialized successfully.');
  } catch (err) {
    console.error('Error initializing Gemini model:', err.message);
  }
}

// --- Endpoints ---

// Auth Endpoints
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    const result = await db.run(
      'INSERT INTO users (username, password) VALUES (?, ?)',
      [username, password]
    );
    res.json({ success: true, userId: result.id });
  } catch (err) {
    if (err.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: 'Username already exists' });
    }
    res.status(500).json({ error: 'Database error: ' + err.message });
  }
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await db.get('SELECT * FROM users WHERE username = ?', [username]);
    if (!user || user.password !== password) {
      return res.status(400).json({ error: 'Invalid username or password' });
    }
    res.json({ success: true, username: user.username, preferences: user.preferences });
  } catch (err) {
    res.status(500).json({ error: 'Database error: ' + err.message });
  }
});

app.post('/api/profile/preferences', async (req, res) => {
  const { username, preferences } = req.body;
  try {
    await db.run('UPDATE users SET preferences = ? WHERE username = ?', [preferences, username]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Database error: ' + err.message });
  }
});

// AI Planner Endpoint (100% Pure Gemini AI + Dynamic Wikimedia Image Fetching)
app.post('/api/generate-trip', async (req, res) => {
  const { destination, budget, duration, preferences } = req.body;

  if (!destination || !budget || !duration) {
    return res.status(400).json({ error: 'Missing required parameters (destination, budget, duration)' });
  }

  try {
    const plan = await generatePureAIItinerary(aiModel, destination, budget, duration, preferences);
    res.json(plan);
  } catch (err) {
    console.error('AI trip generation error:', err.message);
    res.status(500).json({ error: 'AI trip generation failed: ' + err.message });
  }
});

// AI Chat Endpoint
app.post('/api/chat', async (req, res) => {
  const { message, context } = req.body;
  
  if (aiModel) {
    try {
      const chatPrompt = `
        You are Vantage AI, an expert travel concierge. The user is planning a trip to ${context?.destination || 'their destination'} (Budget: ${context?.budget || 'budget'} INR).
        Planned Itinerary Context: ${JSON.stringify(context?.itinerary || [])}
        
        User Query: ${message}
        
        Provide an insightful, polite, and practical travel advisory response. Keep currency in INR (₹).
      `;
      const result = await aiModel.generateContent(chatPrompt);
      return res.json({ reply: result.response.text() });
    } catch (err) {
      console.error('Gemini chat error:', err.message);
    }
  }

  res.json({ reply: `For your trip to ${context?.destination || 'this location'}, adjusting schedules and activities is simple! Let me know what you would like to customize.` });
});

// AI Stays & Accommodations Endpoint
app.get('/api/hotels', async (req, res) => {
  const { destination, budget } = req.query;
  const targetDest = destination || 'Goa';
  const targetBudget = budget || '3000';

  if (!aiModel) {
    return res.status(500).json({ error: 'AI Model not configured' });
  }

  try {
    const promptText = `
      List 4 REAL, highly-rated hotels or budget stays in ${targetDest} suitable for a daily stay budget of INR ${targetBudget}.
      Respond ONLY with a valid JSON array of objects (no markdown, no backticks).

      Schema:
      [
        {
          "id": "h1",
          "name": "Exact Real Hotel Name",
          "rating": 4.5,
          "price": "Budget / Moderate / Luxury",
          "pricePerNight": 1500,
          "description": "Brief description of location and highlights..."
        }
      ]
    `;
    const result = await aiModel.generateContent(promptText);
    const text = result.response.text();
    const cleanJson = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    const hotels = JSON.parse(cleanJson);

    // Dynamic AI Image and Booking URL Attachment
    for (const h of hotels) {
      h.image = await fetchRealPlaceImage(`${h.name} ${targetDest}`);
      h.bookingUrl = `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(`${h.name} ${targetDest}`)}`;
    }

    return res.json(hotels);
  } catch (err) {
    console.error('AI hotels error:', err.message);
    res.status(500).json({ error: 'AI hotels generation failed: ' + err.message });
  }
});

// AI Dining & Restaurants Endpoint
app.get('/api/restaurants', async (req, res) => {
  const { destination } = req.query;
  const targetDest = destination || 'Goa';

  if (!aiModel) {
    return res.status(500).json({ error: 'AI Model not configured' });
  }

  try {
    const promptText = `
      List 4 REAL, famous restaurants or local dining spots in ${targetDest}.
      Respond ONLY with a valid JSON array of objects (no markdown, no backticks).

      Schema:
      [
        {
          "id": "r1",
          "name": "Exact Real Restaurant Name",
          "cuisine": "Cuisine type",
          "rating": 4.7,
          "price": "₹₹",
          "description": "Must-try dish and atmosphere..."
        }
      ]
    `;
    const result = await aiModel.generateContent(promptText);
    const text = result.response.text();
    const cleanJson = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    const restaurants = JSON.parse(cleanJson);

    // Dynamic AI Image and Google Maps URL Attachment
    for (const r of restaurants) {
      r.image = await fetchRealPlaceImage(`${r.name} ${targetDest}`);
      r.mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${r.name}, ${targetDest}`)}`;
    }

    return res.json(restaurants);
  } catch (err) {
    console.error('AI restaurants error:', err.message);
    res.status(500).json({ error: 'AI restaurants generation failed: ' + err.message });
  }
});

// AI Weather API Endpoint
app.get('/api/weather', async (req, res) => {
  const { destination } = req.query;
  const targetDest = destination || 'Paris';

  if (!aiModel) {
    return res.status(500).json({ error: 'AI Model not configured' });
  }

  try {
    const promptText = `
      Provide accurate current weather and 7-day forecast for ${targetDest}.
      Respond ONLY with a valid JSON object (no markdown, no backticks).

      Schema:
      {
        "destination": "${targetDest}",
        "temp": 28,
        "condition": "Sunny",
        "humidity": 60,
        "windSpeed": 12,
        "forecast": [
          { "day": "Mon", "temp": 28, "condition": "Sunny" },
          { "day": "Tue", "temp": 29, "condition": "Clear" },
          { "day": "Wed", "temp": 27, "condition": "Partly Cloudy" },
          { "day": "Thu", "temp": 26, "condition": "Light Rain" },
          { "day": "Fri", "temp": 28, "condition": "Sunny" },
          { "day": "Sat", "temp": 30, "condition": "Clear" },
          { "day": "Sun", "temp": 29, "condition": "Sunny" }
        ]
      }
    `;
    const result = await aiModel.generateContent(promptText);
    const text = result.response.text();
    const cleanJson = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    const weather = JSON.parse(cleanJson);
    return res.json(weather);
  } catch (err) {
    console.error('AI weather error:', err.message);
    res.status(500).json({ error: 'AI weather generation failed: ' + err.message });
  }
});

// Saved Trips Endpoints
app.get('/api/trips', async (req, res) => {
  const { username } = req.query;
  if (!username) return res.status(400).json({ error: 'Username is required' });

  try {
    const rows = await db.all('SELECT * FROM trips WHERE username = ? ORDER BY created_at DESC', [username]);
    const trips = rows.map(r => ({
      id: r.id,
      username: r.username,
      destination: r.destination,
      budget: r.budget,
      duration: r.duration,
      itinerary: JSON.parse(r.itinerary),
      created_at: r.created_at
    }));
    res.json(trips);
  } catch (err) {
    res.status(500).json({ error: 'Database error: ' + err.message });
  }
});

app.post('/api/trips', async (req, res) => {
  const { id, username, destination, budget, duration, itinerary } = req.body;
  if (!id || !username || !destination || !itinerary) {
    return res.status(400).json({ error: 'Missing required parameters to save trip' });
  }

  try {
    await db.run(
      'INSERT OR REPLACE INTO trips (id, username, destination, budget, duration, itinerary) VALUES (?, ?, ?, ?, ?, ?)',
      [id, username, destination, budget, duration, JSON.stringify(itinerary)]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Database error: ' + err.message });
  }
});

app.delete('/api/trips/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.run('DELETE FROM trips WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Database error: ' + err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Vantage AI server is running on http://localhost:${PORT}`);
});
