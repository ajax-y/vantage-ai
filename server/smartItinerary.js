// Pure Gemini AI Generator - Zero Hardcoded Data
const fetch = require('node-fetch');

// Helper to query Wikimedia Commons API dynamically for real images
async function fetchRealPlaceImage(queryStr) {
  const cleanQuery = (queryStr || 'travel landmark').replace(/[^a-zA-Z0-9\s]/g, '').trim();
  try {
    const wikiUrl = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(cleanQuery)}&gsrlimit=1&prop=pageimages&piprop=thumbnail&pithumbsize=600&format=json`;
    const res = await fetch(wikiUrl, { headers: { 'User-Agent': 'VantageAI/1.0' } });
    const data = await res.json();
    if (data.query && data.query.pages) {
      const pageObj = Object.values(data.query.pages)[0];
      if (pageObj && pageObj.thumbnail && pageObj.thumbnail.source) {
        return pageObj.thumbnail.source;
      }
    }
  } catch (err) {
    console.error('Image search error:', err.message);
  }
  return `https://source.unsplash.com/featured/600x400/?${encodeURIComponent(cleanQuery)}`;
}

// 100% Dynamic Gemini AI Itinerary Generator
async function generatePureAIItinerary(aiModel, destination, budget, duration, preferences) {
  const promptText = `
    You are an expert global travel AI concierge. Generate a 100% custom, hyper-realistic, day-by-day travel plan for:
    Destination: ${destination}
    Total Budget: INR ${budget}
    Duration: ${duration} Days
    Preferences: ${preferences || 'General exploration'}

    Strict Requirements:
    1. Identify exact real-world landmarks, authentic food spots, and neighborhoods in ${destination}.
    2. Provide accurate INR (₹) costs for every single item strictly fitting into the total budget of ₹${budget}.
    3. For every morning, afternoon, and evening activity, return:
       - "placeName": Exact real-world landmark or place name
       - "activity": Detailed advisory description
       - "cost": Estimated cost in INR
    4. Respond ONLY with a valid JSON object matching the schema (no markdown, no backticks).

    Schema:
    {
      "destination": "${destination}",
      "budget": "₹${budget}",
      "duration": ${duration},
      "preferences": "${preferences || 'General exploration'}",
      "summary": "Full overview of the trip in ${destination}...",
      "itinerary": [
        {
          "day": 1,
          "title": "Day 1 theme...",
          "morning": { "placeName": "Real Landmark", "activity": "Activity description...", "cost": 100 },
          "afternoon": { "placeName": "Real Landmark", "activity": "Activity description...", "cost": 150 },
          "evening": { "placeName": "Real Landmark", "activity": "Activity description...", "cost": 200 }
        }
      ],
      "budgetBreakdown": {
        "accommodation": 1000,
        "foodAndDrinks": 800,
        "activities": 400,
        "transport": 300,
        "totalEstimate": ${budget}
      },
      "packingTips": ["Tip 1", "Tip 2", "Tip 3"]
    }
  `;

  let planData;
  if (aiModel) {
    const result = await aiModel.generateContent(promptText);
    const text = result.response.text();
    const cleanJson = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    planData = JSON.parse(cleanJson);
  } else {
    throw new Error('AI Model required');
  }

  // Populate dynamic real images and Google Maps links for every generated activity
  for (const d of planData.itinerary) {
    if (d.morning) {
      d.morning.mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${d.morning.placeName}, ${destination}`)}`;
      d.morning.image = await fetchRealPlaceImage(`${d.morning.placeName} ${destination}`);
    }
    if (d.afternoon) {
      d.afternoon.mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${d.afternoon.placeName}, ${destination}`)}`;
      d.afternoon.image = await fetchRealPlaceImage(`${d.afternoon.placeName} ${destination}`);
    }
    if (d.evening) {
      d.evening.mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${d.evening.placeName}, ${destination}`)}`;
      d.evening.image = await fetchRealPlaceImage(`${d.evening.placeName} ${destination}`);
    }
  }

  return planData;
}

module.exports = { generatePureAIItinerary, fetchRealPlaceImage };
