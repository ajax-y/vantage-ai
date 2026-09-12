// Pure Gemini AI Generator - Zero Hardcoded Data & Clean JSON Prompting
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
  const userPref = preferences || 'General exploration';
  const promptText = `Generate a JSON travel plan for ${destination} with a budget of INR ${budget} for ${duration} days. User preferences: ${userPref}. Respond ONLY with raw valid JSON (no markdown formatting, no codeblocks). Format: {"destination":"string","budget":"string","duration":number,"preferences":"string","summary":"string","itinerary":[{"day":number,"title":"string","morning":{"placeName":"string","activity":"string","cost":number},"afternoon":{"placeName":"string","activity":"string","cost":number},"evening":{"placeName":"string","activity":"string","cost":number}}],"budgetBreakdown":{"accommodation":number,"foodAndDrinks":number,"activities":number,"transport":number,"totalEstimate":number},"packingTips":["string"]}`;

  let planData;
  if (aiModel) {
    const result = await aiModel.generateContent(promptText);
    const text = result.response.text();
    const cleanJson = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    planData = JSON.parse(cleanJson);
  } else {
    throw new Error('AI Model required to generate trip.');
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
