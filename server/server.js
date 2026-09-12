const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const db = require('./db');
const { getMockWeather, getMockHotels, getMockRestaurants } = require('./mockData');
const { generateSmartItinerary } = require('./smartItinerary');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize Gemini API if key is present
const geminiApiKey = process.env.GEMINI_API_KEY;
let aiModel = null;
if (geminiApiKey) {
  try {
    const genAI = new GoogleGenerativeAI(geminiApiKey);
    // Use gemini-1.5-flash for speed and reliability
    aiModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    console.log('Gemini AI Model initialized successfully.');
  } catch (err) {
    console.error('Error initializing Gemini model:', err.message);
  }
} else {
  console.log('No GEMINI_API_KEY found. Falling back to the robust local AI Simulation Engine.');
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

// AI Planner Endpoints
app.post('/api/generate-trip', async (req, res) => {
  const { destination, budget, duration, preferences } = req.body;

  if (!destination || !budget || !duration) {
    return res.status(400).json({ error: 'Missing required parameters (destination, budget, duration)' });
  }

  if (aiModel) {
    try {
      const promptText = `
        You are a world-class travel planner. Generate a highly authentic, hyper-realistic day-by-day itinerary in JSON format.
        Destination: ${destination}
        Total Budget: INR ${budget}
        Duration: ${duration} Days
        User Preferences: ${preferences || 'General exploration'}

        Rules:
        - All currency numbers must be in INR (₹) and strictly realistic to the destination and total budget.
        - Mention REAL local landmarks, authentic food spots, and neighborhoods for ${destination}.
        - Respond ONLY with valid raw JSON (no markdown formatting, no backticks).

        Schema:
        {
          "destination": "${destination}",
          "budget": "₹${budget}",
          "duration": ${duration},
          "preferences": "${preferences || 'General exploration'}",
          "summary": "Detailed, engaging overall trip summary...",
          "itinerary": [
            {
              "day": 1,
              "title": "Day title...",
              "morning": { "activity": "Specific authentic morning activity...", "cost": 100 },
              "afternoon": { "activity": "Specific authentic afternoon activity & lunch...", "cost": 200 },
              "evening": { "activity": "Specific evening experience & dinner...", "cost": 150 }
            }
          ],
          "budgetBreakdown": {
            "accommodation": 1200,
            "foodAndDrinks": 800,
            "activities": 300,
            "transport": 200,
            "totalEstimate": 2500
          },
          "packingTips": ["Realistic tip 1", "Realistic tip 2", "Realistic tip 3"]
        }
      `;

      const result = await aiModel.generateContent(promptText);
      const text = result.response.text();
      const cleanJson = text.replace(/```json/gi, '').replace(/```/g, '').trim();
      const plan = JSON.parse(cleanJson);
      return res.json(plan);
    } catch (err) {
      console.error('Gemini AI generation error, utilizing smart engine fallback:', err.message);
    }
  }

  // Smart Engine fallback
  const smartPlan = generateSmartItinerary(destination, budget, duration, preferences);
  res.json(smartPlan);
});

// AI Chat Endpoint
app.post('/api/chat', async (req, res) => {
  const { message, history, context } = req.body;
  
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

  // Smart Fallback interactive chat
  const lowercase = message.toLowerCase();
  let reply = `For your trip to ${context?.destination || 'this destination'}, adjusting the itinerary to suit your preferences is easy! Tell me which days or activities you'd like to customize.`;
  
  if (lowercase.includes('hotel') || lowercase.includes('stay')) {
    reply = `For accommodation in ${context?.destination || 'your trip'}, staying near central transport hubs or local lodges is ideal for your budget. Check out our Stays tab to view live booking links!`;
  } else if (lowercase.includes('restaurant') || lowercase.includes('food') || lowercase.includes('eat')) {
    reply = `Local food is an amazing highlight of visiting ${context?.destination || 'this place'}! Browse our Dining tab for authentic restaurants with direct directions and reservation options.`;
  } else if (lowercase.includes('weather') || lowercase.includes('rain') || lowercase.includes('temp')) {
    reply = `Make sure to check the Weather tab above for 7-day temperature and condition forecasts before packing!`;
  }

  res.json({ reply });
});

// Stays & Accommodations with Booking URLs
app.get('/api/hotels', async (req, res) => {
  const { destination, budget } = req.query;

  if (aiModel) {
    try {
      const promptText = `
        List 4 REAL, highly-rated hotels or budget stays in ${destination || 'Goa'} suitable for a daily stay budget of INR ${budget || 5000}.
        Respond ONLY with a valid JSON array of objects (no markdown, no backticks).

        Schema:
        [
          {
            "id": "h1",
            "name": "Exact Real Hotel Name",
            "rating": 4.5,
            "price": "Budget / Moderate / Luxury",
            "pricePerNight": 1500,
            "image": "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500",
            "description": "Brief description of location and highlights...",
            "bookingUrl": "https://www.booking.com/searchresults.html?ss=${encodeURIComponent(destination || 'hotel')}"
          }
        ]
      `;
      const result = await aiModel.generateContent(promptText);
      const text = result.response.text();
      const cleanJson = text.replace(/```json/gi, '').replace(/```/g, '').trim();
      const hotels = JSON.parse(cleanJson);
      return res.json(hotels);
    } catch (err) {
      console.error('Gemini hotels error, using smart fallback:', err.message);
    }
  }

  res.json(getMockHotels(destination, budget));
});

// Dining & Restaurants with Directions & Booking URLs
app.get('/api/restaurants', async (req, res) => {
  const { destination } = req.query;

  if (aiModel) {
    try {
      const promptText = `
        List 4 REAL, famous restaurants or local dining spots in ${destination || 'Goa'}.
        Respond ONLY with a valid JSON array of objects (no markdown, no backticks).

        Schema:
        [
          {
            "id": "r1",
            "name": "Exact Real Restaurant Name",
            "cuisine": "Cuisine type",
            "rating": 4.7,
            "price": "₹₹",
            "description": "Must-try dish and atmosphere...",
            "mapsUrl": "https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destination + ' restaurants')}"
          }
        ]
      `;
      const result = await aiModel.generateContent(promptText);
      const text = result.response.text();
      const cleanJson = text.replace(/```json/gi, '').replace(/```/g, '').trim();
      const restaurants = JSON.parse(cleanJson);
      return res.json(restaurants);
    } catch (err) {
      console.error('Gemini restaurants error, using smart fallback:', err.message);
    }
  }

  res.json(getMockRestaurants(destination));
});

// Weather API
app.get('/api/weather', async (req, res) => {
  const { destination } = req.query;

  if (aiModel) {
    try {
      const promptText = `
        Provide accurate current weather and 7-day forecast for ${destination || 'Paris'}.
        Respond ONLY with a valid JSON object (no markdown, no backticks).

        Schema:
        {
          "destination": "${destination}",
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
      console.error('Gemini weather error, using smart fallback:', err.message);
    }
  }

  res.json(getMockWeather(destination));
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
