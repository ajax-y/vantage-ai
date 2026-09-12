// Dynamic image provider based on destination topic & landmark query
const landmarkImageMap = {
  marina: [
    'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600&auto=format&fit=crop&q=80', // Marina beach promenade
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&auto=format&fit=crop&q=80', // Temple architecture
    'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=600&auto=format&fit=crop&q=80', // Fort & Heritage
    'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600&auto=format&fit=crop&q=80', // Sunset shore
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80'  // Lighthouse view
  ],
  goa: [
    'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=600&auto=format&fit=crop&q=80'
  ],
  paris: [
    'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1509299349698-dd22323b5963?w=600&auto=format&fit=crop&q=80'
  ],
  default: [
    'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1476514525535-ce74f45814d9?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1503220317375-aaad61436b1b?w=600&auto=format&fit=crop&q=80'
  ]
};

function getLandmarkImage(destination, placeName, index = 0) {
  const destClean = (destination || '').toLowerCase();
  let list = landmarkImageMap.default;
  if (destClean.includes('marina') || destClean.includes('chennai')) {
    list = landmarkImageMap.marina;
  } else if (destClean.includes('goa')) {
    list = landmarkImageMap.goa;
  } else if (destClean.includes('paris')) {
    list = landmarkImageMap.paris;
  }
  return list[index % list.length];
}

function getGoogleMapsUrl(placeName, destination) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${placeName}, ${destination}`)}`;
}

function generateSmartItinerary(destination, budget, duration, preferences) {
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
      { name: 'Fort St. George & Museum', place: 'Fort St George Chennai', desc: 'First English fortress in India built in 1644 along the Bay of Bengal.' }
    ];
    afternoonLandmarks = [
      { name: 'Vivekananda House (Illam)', place: 'Vivekananda House Chennai', desc: 'Historic ice-house museum dedicated to Swami Vivekananda\'s stay in 1897.' },
      { name: 'Kapaleeshwarar Temple', place: 'Kapaleeshwarar Temple Mylapore', desc: '7th-century Dravidian Shiva temple in the cultural heart of Mylapore.' },
      { name: 'Santhome Cathedral Basilica', place: 'Santhome Cathedral Basilica', desc: 'Neo-Gothic Roman Catholic minor basilica built over the tomb of St. Thomas.' }
    ];
    eveningLandmarks = [
      { name: 'Marina Food Stalls', place: 'Marina Beach Lighthouse Chennai', desc: 'Sunset ocean breeze with hot sundal, molaga bajji, and tea from local shore stalls.' },
      { name: 'Mylapore Fine Arts Street', place: 'Mylapore Tank Chennai', desc: 'Traditional evening cultural walk around Mylapore tank and silk sari markets.' },
      { name: 'Lighthouse Beach View Point', place: 'Chennai Lighthouse Marina Beach', desc: 'Panoramas of the Coromandel Coast from the historic Chennai lighthouse tower.' }
    ];
    foodNotes = ['Triplicane Tiffin Messes', 'Mylapore South Indian Thalis', 'Marina Bajji Stalls'];
  } else if (lowerDest.includes('goa')) {
    neighborhood = 'North Goa (Calangute / Panjim)';
    transit = 'Rental scooter or local bus';
    morningLandmarks = [
      { name: 'Calangute Beach Promenade', place: 'Calangute Beach Goa', desc: 'Morning shore walk along golden sands with fresh Goan poi bread & tea.' },
      { name: 'Fontainhas Latin Quarter', place: 'Fontainhas Panjim Goa', desc: 'Quaint Portuguese-style colorful heritage neighborhood in Panjim.' },
      { name: 'Fort Aguada', place: 'Fort Aguada Goa', desc: '17th-century Portuguese lighthouse & fort standing on Sinquerim Beach.' }
    ];
    afternoonLandmarks = [
      { name: 'Anjuna Flea Market', place: 'Anjuna Beach Goa', desc: 'Vibrant local beachside market with handmade crafts, spices, and clothing.' },
      { name: 'Basilica of Bom Jesus', place: 'Basilica of Bom Jesus Old Goa', desc: 'UNESCO World Heritage monument containing the sacred relics of St. Francis Xavier.' },
      { name: 'Baga Beach Shacks', place: 'Baga Beach Goa', desc: 'Authentic Goan fish thali lunch at beachside shacks.' }
    ];
    eveningLandmarks = [
      { name: 'Mandovi River Sunset Cruise', place: 'Panjim Jetty Mandovi River Goa', desc: 'Scenic evening riverboat cruise with Goan folk music & dancing.' },
      { name: 'Chapora Fort Sunset', place: 'Chapora Fort Goa', desc: 'Panoramic sunset views overlooking Vagator Beach and the Chapora river mouth.' },
      { name: 'Tito\'s Lane Night Market', place: 'Titos Lane Baga Goa', desc: 'Lively evening street markets and seaside dining.' }
    ];
    foodNotes = ['Goan Fish Thali', 'Poi & Bhaji Stalls', 'Beach Shack Seafood'];
  } else {
    neighborhood = `Central District of ${destClean}`;
    transit = 'Local metro, buses & walking tours';
    morningLandmarks = [
      { name: `Historic Downtown ${destClean}`, place: `Historic Downtown ${destClean}`, desc: `Morning exploration of famous heritage landmarks and central plazas in ${destClean}.` },
      { name: `Central Gardens & Park`, place: `Central Park ${destClean}`, desc: `Refreshing morning walk through premier botanical gardens and civic monuments.` },
      { name: `Heritage Grand Square`, place: `Main Square ${destClean}`, desc: `Iconic morning architectural tour of grand plazas in ${destClean}.` }
    ];
    afternoonLandmarks = [
      { name: `National Museum of ${destClean}`, place: `National Museum ${destClean}`, desc: `Discover world-class art, history, and cultural exhibits.` },
      { name: `Boutique Arts Market`, place: `Central Market ${destClean}`, desc: `Explore local artisan handicraft shops matching: "${preferences || 'cultural treasures'}".` },
      { name: `Old Town District`, place: `Old Town ${destClean}`, desc: `Atmospheric afternoon stroll through historic cobblestone alleyways and cafes.` }
    ];
    eveningLandmarks = [
      { name: `Sunset Promenade ${destClean}`, place: `Promenade ${destClean}`, desc: `Golden hour sunset stroll along scenic waterfront views.` },
      { name: `Night Food Market`, place: `Night Market ${destClean}`, desc: `Sample delicious authentic street food, tea, and desserts from local vendors.` },
      { name: `Cultural Theater & Lights`, place: `Downtown Lights ${destClean}`, desc: `Evening city lights walk & traditional musical performances.` }
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

    days.push({
      day: i,
      title: `Day ${i}: ${getThemeTitle(i, destClean)}`,
      morning: {
        activity: mItem.desc,
        placeName: mItem.name,
        mapsUrl: getGoogleMapsUrl(mItem.place, destClean),
        image: getLandmarkImage(destClean, mItem.name, i * 3 - 2),
        cost: mCost
      },
      afternoon: {
        activity: aItem.desc,
        placeName: aItem.name,
        mapsUrl: getGoogleMapsUrl(aItem.place, destClean),
        image: getLandmarkImage(destClean, aItem.name, i * 3 - 1),
        cost: aCost
      },
      evening: {
        activity: eItem.desc,
        placeName: eItem.name,
        mapsUrl: getGoogleMapsUrl(eItem.place, destClean),
        image: getLandmarkImage(destClean, eItem.name, i * 3),
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

module.exports = { generateSmartItinerary, getGoogleMapsUrl, getLandmarkImage };
