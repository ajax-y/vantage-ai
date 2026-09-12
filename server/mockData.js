// Dynamic engine for Weather, Hotels, and Restaurants tailored to ANY requested destination

function getDestinationKey(dest) {
  if (!dest) return 'default';
  const clean = dest.toLowerCase().trim();
  if (clean.includes('paris') || clean.includes('france')) return 'paris';
  if (clean.includes('tokyo') || clean.includes('japan')) return 'tokyo';
  if (clean.includes('new york') || clean.includes('nyc') || clean.includes('america')) return 'new_york';
  if (clean.includes('london') || clean.includes('uk') || clean.includes('england')) return 'london';
  if (clean.includes('bali') || clean.includes('indonesia')) return 'bali';
  if (clean.includes('rome') || clean.includes('italy')) return 'rome';
  if (clean.includes('goa') || clean.includes('india') || clean.includes('delhi') || clean.includes('mumbai')) return 'india';
  return 'custom';
}

// Generate hash code for deterministic values per destination
function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function capitalizeWords(str) {
  if (!str) return 'City Center';
  return str.replace(/\b\w/g, l => l.toUpperCase());
}

function getMockWeather(destination) {
  const destName = capitalizeWords(destination || 'Paris');
  const hash = hashCode(destName);
  const baseTemp = 18 + (hash % 15); // temperature between 18C and 32C
  const conditions = ['Sunny', 'Partly Cloudy', 'Clear', 'Light Breeze', 'Pleasant'];
  const mainCondition = conditions[hash % conditions.length];

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const forecast = days.map((day, idx) => {
    const dayTemp = baseTemp + ((hash + idx * 3) % 5) - 2;
    const dayCond = conditions[(hash + idx) % conditions.length];
    return { day, temp: dayTemp, condition: dayCond };
  });

  return {
    destination: destName,
    temp: baseTemp,
    condition: mainCondition,
    humidity: 45 + (hash % 35),
    windSpeed: 5 + (hash % 15),
    forecast
  };
}

function getMockHotels(destination, budgetVal) {
  const destName = capitalizeWords(destination || 'Destination');
  const hash = hashCode(destName);

  const rawList = [
    {
      id: `h_${hash}_1`,
      name: `${destName} Grand Heritage & Spa`,
      rating: 4.9,
      price: 'Premium Luxury',
      pricePerNight: 28000,
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500',
      description: `Luxury resort located in prime central ${destName} featuring panoramic city views, fine dining, and full infinity pool.`
    },
    {
      id: `h_${hash}_2`,
      name: `${destName} Royal Horizon Hotel`,
      rating: 4.7,
      price: 'Luxury',
      pricePerNight: 16000,
      image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=500',
      description: `Elegant business and leisure suites in ${destName} with rooftop cocktail lounge and complimentary breakfast.`
    },
    {
      id: `h_${hash}_3`,
      name: `The Urban Vista Suites ${destName}`,
      rating: 4.4,
      price: 'Moderate',
      pricePerNight: 8500,
      image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=500',
      description: `Modern boutique stay located close to top shopping areas and local transport hubs in ${destName}.`
    },
    {
      id: `h_${hash}_4`,
      name: `${destName} Central Comfort Inn`,
      rating: 4.2,
      price: 'Budget Friendly',
      pricePerNight: 4200,
      image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=500',
      description: `Cozy, well-kept hotel with clean rooms, high-speed WiFi, and friendly 24/7 concierge.`
    },
    {
      id: `h_${hash}_5`,
      name: `Backpackers & Travelers Hub ${destName}`,
      rating: 4.0,
      price: 'Super Budget',
      pricePerNight: 1800,
      image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=500',
      description: `Vibrant social stay with comfortable private rooms & shared lounges for budget-conscious travelers.`
    }
  ];

  if (budgetVal) {
    const numericBudget = parseFloat(budgetVal);
    if (!isNaN(numericBudget) && numericBudget > 0) {
      const filtered = rawList.filter(h => h.pricePerNight <= numericBudget);
      return filtered.length > 0 ? filtered : [rawList[rawList.length - 1]];
    }
  }

  return rawList;
}

function getMockRestaurants(destination) {
  const destName = capitalizeWords(destination || 'Destination');
  const hash = hashCode(destName);

  return [
    {
      id: `r_${hash}_1`,
      name: `Le Bistro De ${destName}`,
      cuisine: 'Fine Dining & Global Fusion',
      rating: 4.9,
      price: '₹₹₹₹',
      description: `Premier gourmet restaurant in ${destName} renowned for master chef specials and curated wine pairings.`
    },
    {
      id: `r_${hash}_2`,
      name: `Authentic ${destName} Spice & Grill`,
      cuisine: 'Traditional & Local Specialties',
      rating: 4.7,
      price: '₹₹₹',
      description: `Top-rated dining spot loved by locals for traditional signature recipes and vibrant atmosphere.`
    },
    {
      id: `r_${hash}_3`,
      name: `The Garden Terrace Cafe`,
      cuisine: 'Artisanal Coffee & Italian',
      rating: 4.5,
      price: '₹₹',
      description: `Relaxed open-air garden cafe serving fresh oven-baked pizzas, hand-crafted pastas, and organic coffee.`
    },
    {
      id: `r_${hash}_4`,
      name: `${destName} Street Food Market Corner`,
      cuisine: 'Authentic Street Food',
      rating: 4.6,
      price: '₹',
      description: `Popular bustling street stall market offering authentic regional delicacies and fast bites.`
    }
  ];
}

module.exports = {
  getMockWeather,
  getMockHotels,
  getMockRestaurants
};
