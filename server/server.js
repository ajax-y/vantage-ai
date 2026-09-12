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

// AI Planner Endpoint
app.post('/api/generate-trip', async (req, res) => {
  const { destination, budget, duration, preferences } = req.body;

  if (!destination || !budget || !duration) {
    return res.status(400).json({ error: 'Missing required parameters' });
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
      const chatPrompt = `You are Vantage AI concierge. User trip context: ${JSON.stringify(context)}. User query: ${message}. Answer helpfully in INR (₹).`;
      const result = await aiModel.generateContent(chatPrompt);
      return res.json({ reply: result.response.text() });
    } catch (err) {
      console.error('Gemini chat error:', err.message);
    }
  }

  res.json({ reply: `How would you like to customize your trip to ${context?.destination}?` });
});

// AI Stays & Accommodations Endpoint
app.get('/api/hotels', async (req, res) => {
  const { destination, budget } = req.query;

  if (!aiModel) {
    return res.status(500).json({ error: 'AI Model not configured' });
  }

  try {
    const promptText = `List 4 real hotels in ${destination} for daily budget INR ${budget}. Respond ONLY with raw valid JSON array: [{"id":"string","name":"string","rating":number,"price":"string","pricePerNight":number,"description":"string"}]`;
    const result = await aiModel.generateContent(promptText);
    const text = result.response.text();
    const cleanJson = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    const hotels = JSON.parse(cleanJson);

    for (const h of hotels) {
      h.image = await fetchRealPlaceImage(`${h.name} ${destination}`);
      h.bookingUrl = `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(`${h.name} ${destination}`)}`;
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

  if (!aiModel) {
    return res.status(500).json({ error: 'AI Model not configured' });
  }

  try {
    const promptText = `List 4 real famous dining spots in ${destination}. Respond ONLY with raw valid JSON array: [{"id":"string","name":"string","cuisine":"string","rating":number,"price":"string","description":"string"}]`;
    const result = await aiModel.generateContent(promptText);
    const text = result.response.text();
    const cleanJson = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    const restaurants = JSON.parse(cleanJson);

    for (const r of restaurants) {
      r.image = await fetchRealPlaceImage(`${r.name} ${destination}`);
      r.mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${r.name}, ${destination}`)}`;
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

  if (!aiModel) {
    return res.status(500).json({ error: 'AI Model not configured' });
  }

  try {
    const promptText = `Weather and 7-day forecast for ${destination}. Respond ONLY with raw valid JSON: {"destination":"string","temp":number,"condition":"string","humidity":number,"windSpeed":number,"forecast":[{"day":"string","temp":number,"condition":"string"}]}`;
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
