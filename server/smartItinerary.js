// Smart Travel Intelligence Generator for authentic, realistic, & highly detailed itineraries

function generateSmartItinerary(destination, budget, duration, preferences) {
  const numericBudget = parseFloat(budget) || 2500;
  const daysNum = parseInt(duration) || 3;
  const destClean = (destination || 'Marina Beach').trim();
  const lowerDest = destClean.toLowerCase();

  // Determine neighborhood and theme knowledge base
  let neighborhood = 'central neighborhood';
  let transit = 'public bus/train or local auto';
  let morningLandmarks = [];
  let afternoonLandmarks = [];
  let eveningLandmarks = [];
  let foodNotes = [];

  if (lowerDest.includes('marina') || lowerDest.includes('chennai')) {
    neighborhood = 'Triplicane / Mylapore (near Marina Beach)';
    transit = 'MTC buses & Suburban/MRTS trains';
    morningLandmarks = [
      'Morning beach stroll along Marina Promenade & traditional South Indian breakfast (idli/dosa/filter coffee)',
      'Visit 8th-century Arulmigu Sri Parthasarathyswamy Temple in Triplicane',
      'Walk to Fort St. George & view historic heritage buildings along Kamarajar Salai'
    ];
    afternoonLandmarks = [
      'Visit Vivekananda House (Illam) museum & enjoy traditional full South Indian meals',
      'Take local train to Kapaleeshwarar Temple in Mylapore & explore tiffin centers',
      'Explore Santhome Cathedral Basilica & local spice/flower markets'
    ];
    eveningLandmarks = [
      'Sunset on Marina shore, sample local beach stalls (sundal, molaga bajji, & fresh tea)',
      'Relax near southern stretch of Marina Beach & explore street food counters',
      'Scenic evening breeze at Lighthouse beach view point'
    ];
    foodNotes = ['Local Tiffin Centers', 'South Indian Thali Meals', 'Sundal & Bajji Stalls'];
  } else if (lowerDest.includes('goa')) {
    neighborhood = 'Calangute / Panjim area';
    transit = 'rental scooter or local passenger bus';
    morningLandmarks = [
      'Early morning walk on golden sands followed by fresh poi bread & tea',
      'Visit historic Latin Quarter of Fontainhas in Panjim',
      'Explore Aguada Fort overlooking the Arabian Sea'
    ];
    afternoonLandmarks = [
      'Traditional Goan fish thali lunch & relaxing at Anjuna market',
      'Visit Basilica of Bom Jesus & Se Cathedral in Old Goa',
      'Shack lunch by the beach & tropical smoothie sampling'
    ];
    eveningLandmarks = [
      'Sunset views at Baga Beach with local music and seafood stalls',
      'Evening Mandovi River cruise or promenade walk',
      'Night market shopping and evening sea breeze'
    ];
    foodNotes = ['Goan Fish Thali', 'Poi & Bhaji Stalls', 'Beach Shacks'];
  } else if (lowerDest.includes('paris')) {
    neighborhood = 'Le Marais / Latin Quarter';
    transit = 'Metro & RER city trains';
    morningLandmarks = [
      'Stroll along the Seine River & fresh croissant/espresso at a corner bakery',
      'Morning walk through Jardin du Luxembourg',
      'Explore Montmartre & Sacré-Cœur basilica'
    ];
    afternoonLandmarks = [
      'Louvre Museum courtyard view & classic French bistro lunch',
      'Explore boutique shops & historic alleyways in Le Marais',
      'Musée d\'Orsay art gallery exploration'
    ];
    eveningLandmarks = [
      'Eiffel Tower light show view from Champ de Mars & evening walk',
      'Latin Quarter nightlife & authentic crepe sampling',
      'Seine River night promenade stroll'
    ];
    foodNotes = ['French Boulangerie', 'Bistro Meals', 'Crepe Counters'];
  } else {
    // Dynamic universal generator for any custom destination
    neighborhood = `central district of ${destClean}`;
    transit = 'local transit & walking tours';
    morningLandmarks = [
      `Morning city walking tour of historic downtown ${destClean} & breakfast`,
      `Visit famous cultural heritage landmarks & local parks in ${destClean}`,
      `Explore central square & iconic morning architectural sites in ${destClean}`
    ];
    afternoonLandmarks = [
      `Authentic regional lunch at top-rated local dining hall in ${destClean}`,
      `Visit top museums & shopping markets in ${destClean}`,
      `Scenic afternoon excursion matching user interests: "${preferences || 'local sight-seeing'}"`
    ];
    eveningLandmarks = [
      `Golden hour sunset views & stroll along prime promenade in ${destClean}`,
      `Sample famous local night market street foods & traditional tea/beverages`,
      `Evening city lights walk & dinner experience`
    ];
    foodNotes = ['Local Tiffin & Thali', 'Street Food Markets', 'Regional Cafe'];
  }

  // Budget calculations tailored realistically
  const perDayBudget = Math.round(numericBudget / daysNum);
  let stayCostPerNight = Math.round(numericBudget * 0.45 / Math.max(1, daysNum - 1));
  let foodDailyCost = Math.round(numericBudget * 0.35 / daysNum);
  let transportDailyCost = Math.round(numericBudget * 0.12 / daysNum);
  let bufferDailyCost = Math.round(numericBudget * 0.08 / daysNum);

  if (numericBudget <= 3000) {
    stayCostPerNight = Math.round((numericBudget * 0.48) / Math.max(1, daysNum - 1));
    foodDailyCost = Math.round((numericBudget * 0.36) / daysNum);
    transportDailyCost = Math.round((numericBudget * 0.08) / daysNum);
    bufferDailyCost = Math.round((numericBudget * 0.08) / daysNum);
  }

  const days = [];
  for (let i = 1; i <= daysNum; i++) {
    const morningIndex = (i - 1) % morningLandmarks.length;
    const afternoonIndex = (i - 1) % afternoonLandmarks.length;
    const eveningIndex = (i - 1) % eveningLandmarks.length;

    const mCost = Math.round(foodDailyCost * 0.3 + transportDailyCost * 0.4);
    const aCost = Math.round(foodDailyCost * 0.4 + transportDailyCost * 0.6 + bufferDailyCost * 0.5);
    const eCost = Math.round(foodDailyCost * 0.3 + bufferDailyCost * 0.5);

    days.push({
      day: i,
      title: `Day ${i}: ${getThemeTitle(i, destClean)}`,
      morning: {
        activity: morningLandmarks[morningIndex],
        cost: mCost
      },
      afternoon: {
        activity: afternoonLandmarks[afternoonIndex],
        cost: aCost
      },
      evening: {
        activity: eveningLandmarks[eveningIndex],
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
    summary: `A realistic ${daysNum}-day budget trip to ${destClean} based in ${neighborhood}. Tailored for a budget of ₹${numericBudget} (approx ₹${perDayBudget}/day) using ${transit} and authentic local dining (${foodNotes.join(', ')}).`,
    itinerary: days,
    budgetBreakdown: {
      accommodation: accommodationTotal,
      foodAndDrinks: foodTotal,
      activities: activitiesTotal,
      transport: transportTotal,
      totalEstimate
    },
    packingTips: [
      `Stay in budget rooms/dorm beds around ${neighborhood} for ~₹${stayCostPerNight}/night.`,
      `Use ${transit} to keep travel costs under ~₹${transportDailyCost}/day.`,
      `Enjoy local meals (${foodNotes[0]}) for delicious dining under ~₹${foodDailyCost}/day.`
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

module.exports = { generateSmartItinerary };
