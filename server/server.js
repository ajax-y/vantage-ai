const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const db = require('./db');
const { getMockWeather, getMockHotels, getMockRestaurants } = require('./mockData');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize Gemini API if key is present
const geminiApiKey = process.env.GEMINI_API_KEY;
let aiModel = null;
if (geminiApiKey) {
  const genAI = new GoogleGenerativeAI(geminiApiKey);
  aiModel = genAI.getGenerativeModel({ model: 'gemini-pro' });
  console.log('Gemini AI Model initialized successfully.');
} else {
  console.log('No GEMINI_API_KEY found. Falling back to the robust local AI Simulation Engine.');
}

// Simple fallback itinerary generator using numeric budget
function generateMockItinerary(destination, budget, duration, preferences) {
  const numericBudget = parseFloat(budget) || 15000;
  
  // Calculate breakdown segments
  const accommodationTotal = Math.round(numericBudget * 0.45);
  const foodTotal = Math.round(numericBudget * 0.25);
  const activitiesTotal = Math.round(numericBudget * 0.20);
  const transportTotal = Math.round(numericBudget * 0.10);
  const totalCalculated = accommodationTotal + foodTotal + activitiesTotal + transportTotal;

  // Daily values
  const dailyFood = Math.round(foodTotal / duration);
  const dailyActivities = Math.round(activitiesTotal / duration);

  const days = [];
  for (let i = 1; i <= duration; i++) {
    days.push({
      day: i,
      title: `Exploring the Heart of ${destination} - Day ${i}`,
      morning: {
        activity: `Guided tour of popular historical sites in ${destination}.`,
        cost: Math.round(dailyActivities * 0.4)
      },
      afternoon: {
        activity: `Lunch at a traditional local bistro followed by exploring boutique shops matching: "${preferences || 'local landmarks'}".`,
        cost: Math.round(dailyFood * 0.4 + dailyActivities * 0.6)
      },
      evening: {
        activity: `Elegant dining experience and a scenic night walk around central attractions.`,
        cost: Math.round(dailyFood * 0.6)
      }
    });
  }

  // Determine budget style text for packing tips
  const avgDaily = numericBudget / duration;
  const budgetStyle = avgDaily > 15000 ? 'Luxury' : avgDaily > 5000 ? 'Mid-range' : 'Budget';

  return {
    destination,
    budget: `₹${numericBudget}`,
    duration,
    preferences,
    summary: `A personalized ${duration}-day travel experience in ${destination} tailored for a total budget of ₹${numericBudget} (approx ₹${Math.round(avgDaily)}/day), focusing on ${preferences || 'general exploration'}.`,
    itinerary: days,
    budgetBreakdown: {
      accommodation: accommodationTotal,
      foodAndDrinks: foodTotal,
      activities: activitiesTotal,
      transport: transportTotal,
      totalEstimate: totalCalculated
    },
    packingTips: [
      "Bring comfortable walking shoes for city sightseeing.",
      budgetStyle === 'Luxury' ? "Pack elegant evening wear for fine-dining reservations." : "Carry a local transit card and look for free attraction entry passes.",
      "Keep digital copies of all your travel documentation and reservations."
    ]
  };
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
        You are a premium travel planner. Generate a highly detailed, professional, and personalized travel itinerary in JSON format.
        Destination: ${destination}
        Total Budget: INR ${budget}
        Duration: ${duration} Days
        User Preferences: ${preferences}

        Respond ONLY with a valid JSON object matching this schema (do not wrap in markdown tags or backticks, all currency values must be in INR):
        {
          "destination": "${destination}",
          "budget": "₹${budget}",
          "duration": ${duration},
          "preferences": "${preferences}",
          "summary": "Detailed overall summary...",
          "itinerary": [
            {
              "day": 1,
              "title": "Day 1 theme...",
              "morning": { "activity": "...", "cost": 0 },
              "afternoon": { "activity": "...", "cost": 0 },
              "evening": { "activity": "...", "cost": 0 }
            }
          ],
          "budgetBreakdown": {
            "accommodation": 0,
            "foodAndDrinks": 0,
            "activities": 0,
            "transport": 0,
            "totalEstimate": 0
          },
          "packingTips": ["tip 1", "tip 2"]
        }
      `;

      const result = await aiModel.generateContent(promptText);
      const text = result.response.text();
      const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const plan = JSON.parse(cleanJson);
      return res.json(plan);
    } catch (err) {
      console.error('Gemini error, using fallback:', err);
      // Fallback
    }
  }

  // Fallback engine
  const mockPlan = generateMockItinerary(destination, budget, duration, preferences);
  res.json(mockPlan);
});

app.post('/api/chat', async (req, res) => {
  const { message, history, context } = req.body;
  
  if (aiModel) {
    try {
      const chatPrompt = `
        You are Vantage AI, a travel planning assistant. The user is planning a trip to ${context.destination} (Budget: ${context.budget} INR).
        Current planned itinerary: ${JSON.stringify(context.itinerary)}
        
        User's question/request: ${message}
        
        Provide a helpful, polite, and detailed travel advisory response. Keep currency references in INR (₹).
      `;
      const result = await aiModel.generateContent(chatPrompt);
      return res.json({ reply: result.response.text() });
    } catch (err) {
      console.error('Gemini chat error:', err);
    }
  }

  // Fallback interactive chat
  const lowercase = message.toLowerCase();
  let reply = `That sounds interesting! For your trip to ${context.destination}, adjusting that schedule is completely possible. Let me know if you would like me to swap out any activities!`;
  
  if (lowercase.includes('hotel') || lowercase.includes('stay')) {
    reply = `Regarding accommodation in ${context.destination}, within your budget of ${context.budget}, I recommend looking at options nearby the subway or tourist centers to minimize transport cost. Would you like me to fetch local hotel rates?`;
  } else if (lowercase.includes('restaurant') || lowercase.includes('food') || lowercase.includes('eat')) {
    reply = `Local cuisine is one of the best parts of visiting ${context.destination}! I recommend checking our Restaurants tab for authentic, top-rated local dining spots suited for your budget of ${context.budget}.`;
  } else if (lowercase.includes('weather') || lowercase.includes('rain') || lowercase.includes('temp')) {
    reply = `Checking weather forecasts is a smart move. Check out the Weather tab above to see real-time forecasts and pack accordingly!`;
  } else if (lowercase.includes('free') || lowercase.includes('cheap')) {
    reply = `To save money within your budget of ${context.budget}, you can visit local parks, walk around historic neighborhoods, and take advantage of free museum days.`;
  }

  res.json({ reply });
});

// External/Simulated APIs
app.get('/api/weather', (req, res) => {
  const { destination } = req.query;
  res.json(getMockWeather(destination));
});

app.get('/api/hotels', (req, res) => {
  const { destination, budget } = req.query;
  res.json(getMockHotels(destination, budget));
});

app.get('/api/restaurants', (req, res) => {
  const { destination } = req.query;
  res.json(getMockRestaurants(destination));
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
