// Dynamic Image Search Engine via Wikimedia Commons API (No hardcoded URLs, 100% dynamic search for any place/landmark)
const fetch = require('node-fetch');

async function searchPlaceImage(placeName, destination) {
  const query = `${placeName || destination}`.replace(/[^a-zA-Z0-9\s]/g, '').trim();
  try {
    const searchUrl = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrlimit=1&prop=pageimages&piprop=thumbnail&pithumbsize=600&format=json`;
    const res = await fetch(searchUrl, { headers: { 'User-Agent': 'VantageAITravelApp/1.0' } });
    const data = await res.json();
    if (data.query && data.query.pages) {
      const pages = Object.values(data.query.pages);
      if (pages[0] && pages[0].thumbnail && pages[0].thumbnail.source) {
        return pages[0].thumbnail.source;
      }
    }
  } catch (err) {
    console.error('Wikimedia image search error:', err.message);
  }
  // Fallback to dynamic topic search URL if network timeout
  return `https://source.unsplash.com/featured/600x400/?${encodeURIComponent(query)}`;
}

function getGoogleMapsUrl(placeName, destination) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${placeName}, ${destination}`)}`;
}

async function generateSmartItinerary(destination, budget, duration, preferences) {
  const numericBudget = parseFloat(budget) || 2500;
  const daysNum = parseInt(duration) || 3;
  const destClean = (destination || 'Marina Beach').trim();
  const lowerDest = destClean.toLowerCase();

  let neighborhood = 'Central District';
  let transit = 'Public bus/train or auto';
  let morningLandmarks = [];
  let afternoonLandmarks = [];
  let eveningLandmarks = [];
  let foodNotes = [];

  if (lowerDest.includes('marina') || lowerDest.includes('chennai')) {
    neighborhood = 'Triplicane & Mylapore (near Marina Beach)';
    transit = 'MTC buses & Suburban/MRTS trains';
    morningLandmarks = [
      { name: 'Marina Beach Promenade', place: 'Marina Beach Promenade', desc: 'Stroll along the world\'s 2nd longest natural urban beach and enjoy traditional filter coffee.' },
      { name: 'Parthasarathy Temple', place: 'Arulmigu Sri Parthasarathyswamy Temple Triplicane', desc: 'Historic 8th-century Vaishnavite temple featuring ancient Dravidian architecture.' },
      { name: 'Fort St. George Museum', place: 'Fort St George Chennai', desc: 'First English fortress in India built in 1644 along the Bay of Bengal.' }
    ];
    afternoonLandmarks = [
      { name: 'Vivekananda House Illam', place: 'Vivekananda House Chennai', desc: 'Historic ice-house museum dedicated to Swami Vivekananda\'s stay in 1897.' },
      { name: 'Kapaleeshwarar Temple', place: 'Kapaleeshwarar Temple Mylapore', desc: '7th-century Dravidian Shiva temple in the cultural heart of Mylapore.' },
      { name: 'Santhome Cathedral Basilica', place: 'Santhome Cathedral Basilica', desc: 'Neo-Gothic Roman Catholic minor basilica built over the tomb of St. Thomas.' }
    ];
    eveningLandmarks = [
      { name: 'Chennai Lighthouse Marina Beach', place: 'Chennai Lighthouse Marina Beach', desc: 'Panoramas of the Coromandel Coast from the historic Chennai lighthouse tower.' },
      { name: 'Mylapore Tank', place: 'Mylapore Tank Chennai', desc: 'Traditional evening cultural walk around Mylapore tank and silk sari markets.' },
      { name: 'Marina Beach Shore', place: 'Marina Beach Lighthouse Chennai', desc: 'Sunset ocean breeze with hot sundal, molaga bajji, and tea from local shore stalls.' }
    ];
    foodNotes = ['Triplicane Tiffin Messes', 'Mylapore South Indian Thalis', 'Marina Bajji Stalls'];
  } else if (lowerDest.includes('goa')) {
    neighborhood = 'North Goa (Calangute / Panjim)';
    transit = 'Rental scooter or local bus';
    morningLandmarks = [
      { name: 'Calangute Beach', place: 'Calangute Beach Goa', desc: 'Morning shore walk along golden sands with fresh Goan poi bread & tea.' },
      { name: 'Fontainhas Panjim', place: 'Fontainhas Panjim Goa', desc: 'Quaint Portuguese-style colorful heritage neighborhood in Panjim.' },
      { name: 'Fort Aguada', place: 'Fort Aguada Goa', desc: '17th-century Portuguese lighthouse & fort standing on Sinquerim Beach.' }
    ];
    afternoonLandmarks = [
      { name: 'Anjuna Beach Market', place: 'Anjuna Beach Goa', desc: 'Vibrant local beachside market with handmade crafts, spices, and clothing.' },
      { name: 'Basilica of Bom Jesus', place: 'Basilica of Bom Jesus Old Goa', desc: 'UNESCO World Heritage monument containing the sacred relics of St. Francis Xavier.' },
      { name: 'Baga Beach Shacks', place: 'Baga Beach Goa', desc: 'Authentic Goan fish thali lunch at beachside shacks.' }
    ];
    eveningLandmarks = [
      { name: 'Mandovi River Panjim', place: 'Panjim Jetty Mandovi River Goa', desc: 'Scenic evening riverboat cruise with Goan folk music & dancing.' },
      { name: 'Chapora Fort', place: 'Chapora Fort Goa', desc: 'Panoramic sunset views overlooking Vagator Beach and the Chapora river mouth.' },
      { name: 'Titos Lane Baga', place: 'Titos Lane Baga Goa', desc: 'Lively evening street markets and seaside dining.' }
    ];
    foodNotes = ['Goan Fish Thali', 'Poi & Bhaji Stalls', 'Beach Shack Seafood'];
  } else {
    neighborhood = `Central District of ${destClean}`;
    transit = 'Local metro, buses & walking tours';
    morningLandmarks = [
      { name: `${destClean} City Center`, place: `Historic Downtown ${destClean}`, desc: `Morning exploration of famous heritage landmarks and central plazas in ${destClean}.` },
      { name: `${destClean} Central Park`, place: `Central Park ${destClean}`, desc: `Refreshing morning walk through premier botanical gardens and civic monuments.` },
      { name: `${destClean} Main Square`, place: `Main Square ${destClean}`, desc: `Iconic morning architectural tour of grand plazas in ${destClean}.` }
    ];
    afternoonLandmarks = [
      { name: `Museum of ${destClean}`, place: `National Museum ${destClean}`, desc: `Discover world-class art, history, and cultural exhibits.` },
      { name: `${destClean} Central Market`, place: `Central Market ${destClean}`, desc: `Explore local artisan handicraft shops matching: "${preferences || 'cultural treasures'}".` },
      { name: `Old Town ${destClean}`, place: `Old Town ${destClean}`, desc: `Atmospheric afternoon stroll through historic cobblestone alleyways and cafes.` }
    ];
    eveningLandmarks = [
      { name: `${destClean} Waterfront`, place: `Promenade ${destClean}`, desc: `Golden hour sunset stroll along scenic waterfront views.` },
      { name: `${destClean} Night Market`, place: `Night Market ${destClean}`, desc: `Sample delicious authentic street food, tea, and desserts from local vendors.` },
      { name: `${destClean} Downtown`, place: `Downtown Lights ${destClean}`, desc: `Evening city lights walk & traditional musical performances.` }
    ];
    foodNotes = ['Regional Specialties', 'Street Food Stalls', 'Traditional Bistros'];
  }

  const perDayBudget = Math.round(numericBudget / daysNum);
  const stayCostPerNight = Math.round((numericBudget * 0.45) / Math.max(1, daysNum - 1));
  const foodDailyCost = Math.round((numericBudget * 0.35) / daysNum);
  const transportDailyCost = Math.round((numericBudget * 0.12) / daysNum);
  const bufferDailyCost = Math.round((numericBudget * 0.08) / daysNum);

  const days = [];
  for (let i = 1; i <= daysNum; i++) {
    const mItem = morningLandmarks[(i - 1) % morningLandmarks.length];
    const aItem = afternoonLandmarks[(i - 1) % afternoonLandmarks.length];
    const eItem = eveningLandmarks[(i - 1) % eveningLandmarks.length];

    const mCost = Math.round(foodDailyCost * 0.3 + transportDailyCost * 0.4);
    const aCost = Math.round(foodDailyCost * 0.4 + transportDailyCost * 0.6 + bufferDailyCost * 0.5);
    const eCost = Math.round(foodDailyCost * 0.3 + bufferDailyCost * 0.5);

    // Dynamic AI Image Fetching
    const [mImg, aImg, eImg] = await Promise.all([
      searchPlaceImage(mItem.name, destClean),
      searchPlaceImage(aItem.name, destClean),
      searchPlaceImage(eItem.name, destClean)
    ]);

    days.push({
      day: i,
      title: `Day ${i}: ${getThemeTitle(i, destClean)}`,
      morning: {
        activity: mItem.desc,
        placeName: mItem.name,
        mapsUrl: getGoogleMapsUrl(mItem.place, destClean),
        image: mImg,
        cost: mCost
      },
      afternoon: {
        activity: aItem.desc,
        placeName: aItem.name,
        mapsUrl: getGoogleMapsUrl(aItem.place, destClean),
        image: aImg,
        cost: aCost
      },
      evening: {
        activity: eItem.desc,
        placeName: eItem.name,
        mapsUrl: getGoogleMapsUrl(eItem.place, destClean),
        image: eImg,
        cost: eCost
      }
    });
  }

  const accommodationTotal = stayCostPerNight * Math.max(1, daysNum - 1);
  const foodTotal = foodDailyCost * daysNum;
  const transportTotal = transportDailyCost * daysNum;
  const activitiesTotal = bufferDailyCost * daysNum;
  const totalEstimate = accommodationTotal + foodTotal + transportTotal + activitiesTotal;

  return {
    destination: destClean,
    budget: `₹${numericBudget}`,
    duration: daysNum,
    preferences: preferences || 'Local culture & sights',
    summary: `A realistic ${daysNum}-day budget trip to ${destClean} based in ${neighborhood}. Tailored for a total budget of ₹${numericBudget} (approx ₹${perDayBudget}/day) using ${transit} and authentic local dining (${foodNotes.join(', ')}).`,
    itinerary: days,
    budgetBreakdown: {
      accommodation: accommodationTotal,
      foodAndDrinks: foodTotal,
      activities: activitiesTotal,
      transport: transportTotal,
      totalEstimate
    },
    packingTips: [
      `Stay in budget rooms/dorms in ${neighborhood} for ~₹${stayCostPerNight}/night.`,
      `Use ${transit} to keep daily transportation costs under ~₹${transportDailyCost}/day.`,
      `Sample local dining (${foodNotes[0]}) to keep daily meal costs under ~₹${foodDailyCost}/day.`
    ]
  };
}

function getThemeTitle(dayNum, destination) {
  const themes = [
    `Exploring ${destination} & Local Promenade`,
    `Heritage, Culture & Historic Neighborhoods`,
    `City Icons, Markets & Departure`,
    `Coastal Scenery & Hidden Gems`,
    `Culinary Discoveries & Night Markets`
  ];
  return themes[(dayNum - 1) % themes.length];
}

module.exports = { generateSmartItinerary, getGoogleMapsUrl, searchPlaceImage };
