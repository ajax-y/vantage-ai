// Mock Data generator for weather, hotels, and restaurants based on destination name

function getDestinationKey(dest) {
  if (!dest) return 'default';
  const clean = dest.toLowerCase().trim();
  if (clean.includes('paris') || clean.includes('france')) return 'paris';
  if (clean.includes('tokyo') || clean.includes('japan')) return 'tokyo';
  if (clean.includes('new york') || clean.includes('nyc') || clean.includes('america')) return 'new_york';
  if (clean.includes('london') || clean.includes('uk') || clean.includes('england')) return 'london';
  if (clean.includes('bali') || clean.includes('indonesia')) return 'bali';
  if (clean.includes('rome') || clean.includes('italy')) return 'rome';
  return 'default';
}

const mockData = {
  paris: {
    weather: {
      temp: 21,
      condition: 'Partly Cloudy',
      humidity: 65,
      windSpeed: 12,
      forecast: [
        { day: 'Mon', temp: 22, condition: 'Sunny' },
        { day: 'Tue', temp: 20, condition: 'Partly Cloudy' },
        { day: 'Wed', temp: 18, condition: 'Light Rain' },
        { day: 'Thu', temp: 21, condition: 'Sunny' },
        { day: 'Fri', temp: 23, condition: 'Sunny' },
        { day: 'Sat', temp: 24, condition: 'Clear' },
        { day: 'Sun', temp: 22, condition: 'Partly Cloudy' }
      ]
    },
    hotels: [
      { id: 'p1', name: 'Le Bristol Paris', rating: 4.9, price: 'Premium Luxury', pricePerNight: 75000, image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500', description: 'Historic palace hotel known for outstanding service and Michelin-starred dining.' },
      { id: 'p2', name: 'Hotel Regina Louvre', rating: 4.6, price: 'Moderate', pricePerNight: 32000, image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=500', description: 'Classic Parisian style overlooking the Louvre Museum and Tuileries Gardens.' },
      { id: 'p3', name: 'Les Piaules Nation Hostel', rating: 4.2, price: 'Budget Friendly', pricePerNight: 4000, image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=500', description: 'Trendy modern hostel with a beautiful rooftop terrace and social atmosphere.' }
    ],
    restaurants: [
      { id: 'pr1', name: 'L\'Ambroisie', cuisine: 'French Fine Dining', rating: 4.8, price: '₹₹₹₹', description: 'Three Michelin-starred culinary masterpiece located in the historic Place des Vosges.' },
      { id: 'pr2', name: 'Le Comptoir du Relais', cuisine: 'Bistro / French', rating: 4.5, price: '₹₹₹', description: 'Famous, bustling bistro in Saint-Germain-des-Prés offering classic fare.' },
      { id: 'pr3', name: 'L\'As du Fallafel', cuisine: 'Middle Eastern', rating: 4.7, price: '₹', description: 'Legendary falafel spot in the heart of Le Marais district.' }
    ]
  },
  tokyo: {
    weather: {
      temp: 26,
      condition: 'Sunny',
      humidity: 55,
      windSpeed: 8,
      forecast: [
        { day: 'Mon', temp: 26, condition: 'Sunny' },
        { day: 'Tue', temp: 27, condition: 'Sunny' },
        { day: 'Wed', temp: 25, condition: 'Cloudy' },
        { day: 'Thu', temp: 24, condition: 'Windy' },
        { day: 'Fri', temp: 26, condition: 'Clear' },
        { day: 'Sat', temp: 28, condition: 'Clear' },
        { day: 'Sun', temp: 25, condition: 'Partly Cloudy' }
      ]
    },
    hotels: [
      { id: 't1', name: 'Aman Tokyo', rating: 4.9, price: 'Premium Luxury', pricePerNight: 85000, image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=500', description: 'Luxury sanctuary at the top of Otemachi Tower, blending modern and traditional design.' },
      { id: 't2', name: 'Park Hyatt Tokyo', rating: 4.7, price: 'Moderate', pricePerNight: 40000, image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=500', description: 'Iconic high-rise hotel featuring stunning panoramic views of Mt. Fuji and Tokyo.' },
      { id: 't3', name: 'Nine Hours Capsule Hotel', rating: 4.0, price: 'Budget Friendly', pricePerNight: 3000, image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=500', description: 'Futuristic, ultra-minimalist capsule experience located in Shinjuku.' }
    ],
    restaurants: [
      { id: 'tr1', name: 'Sukiyabashi Jiro', cuisine: 'Sushi', rating: 4.9, price: '₹₹₹₹', description: 'World-famous exclusive sushi establishment offering masterfully prepared edomae sushi.' },
      { id: 'tr2', name: 'Ichiran Ramen Shinjuku', cuisine: 'Ramen / Japanese', rating: 4.6, price: '₹', description: 'Classic solo-booth tonkotsu ramen counter, ideal for focus on authentic flavors.' },
      { id: 'tr3', name: 'Kagurazaka Ishikawa', cuisine: 'Kaiseki', rating: 4.8, price: '₹₹₹₹', description: 'Exquisite multi-course traditional Japanese dining experience reflecting seasonal themes.' }
    ]
  },
  new_york: {
    weather: {
      temp: 18,
      condition: 'Clear',
      humidity: 48,
      windSpeed: 15,
      forecast: [
        { day: 'Mon', temp: 18, condition: 'Clear' },
        { day: 'Tue', temp: 19, condition: 'Sunny' },
        { day: 'Wed', temp: 17, condition: 'Partly Cloudy' },
        { day: 'Thu', temp: 15, condition: 'Rainy' },
        { day: 'Fri', temp: 16, condition: 'Cloudy' },
        { day: 'Sat', temp: 20, condition: 'Clear' },
        { day: 'Sun', temp: 21, condition: 'Sunny' }
      ]
    },
    hotels: [
      { id: 'ny1', name: 'The Plaza Hotel', rating: 4.8, price: 'Premium Luxury', pricePerNight: 70000, image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=500', description: 'World-famous historic luxury hotel situated right next to Central Park South.' },
      { id: 'ny2', name: 'The Standard High Line', rating: 4.5, price: 'Moderate', pricePerNight: 25000, image: 'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=500', description: 'Trendy boutique hotel hovering above the High Line park in Meatpacking District.' },
      { id: 'ny3', name: 'Freehand New York', rating: 4.1, price: 'Budget Friendly', pricePerNight: 10000, image: 'https://images.unsplash.com/photo-1517840901100-8179e982acb7?w=500', description: 'Artistic hotel in Flatiron with cozy private rooms and creative bunk rooms.' }
    ],
    restaurants: [
      { id: 'nyr1', name: 'Eleven Madison Park', cuisine: 'Modern American', rating: 4.9, price: '₹₹₹₹', description: 'Acclaimed plant-based fine dining institution overlooking Madison Square Park.' },
      { id: 'nyr2', name: 'Katz\'s Delicatessen', cuisine: 'Jewish Deli', rating: 4.7, price: '₹₹', description: 'Legendary NYC eatery serving colossal pastrami sandwiches since 1888.' },
      { id: 'nyr3', name: 'Joe\'s Pizza', cuisine: 'Pizza / Italian', rating: 4.6, price: '₹', description: 'Iconic Greenwich Village corner joint serving classic, thin-crust New York slices.' }
    ]
  },
  default: {
    weather: {
      temp: 22,
      condition: 'Sunny',
      humidity: 50,
      windSpeed: 10,
      forecast: [
        { day: 'Mon', temp: 22, condition: 'Sunny' },
        { day: 'Tue', temp: 23, condition: 'Sunny' },
        { day: 'Wed', temp: 21, condition: 'Partly Cloudy' },
        { day: 'Thu', temp: 22, condition: 'Clear' },
        { day: 'Fri', temp: 24, condition: 'Clear' },
        { day: 'Sat', temp: 25, condition: 'Sunny' },
        { day: 'Sun', temp: 23, condition: 'Partly Cloudy' }
      ]
    },
    hotels: [
      { id: 'd1', name: 'Grand Horizon Resort', rating: 4.6, price: 'Premium Luxury', pricePerNight: 20000, image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500', description: 'A gorgeous resort featuring full-service spa facilities and infinity pools.' },
      { id: 'd2', name: 'Urban Vista Hotel', rating: 4.3, price: 'Moderate', pricePerNight: 12000, image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=500', description: 'Modern, well-appointed city-center hotel close to local transportation and shopping.' },
      { id: 'd3', name: 'Backpackers Cozy Nest', rating: 4.0, price: 'Budget Friendly', pricePerNight: 2800, image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=500', description: 'Friendly and cost-effective lodging with shared kitchen and social lounge.' }
    ],
    restaurants: [
      { id: 'dr1', name: 'The Golden Fork', cuisine: 'Continental Fusion', rating: 4.5, price: '₹₹₹', description: 'Elegant fusion dining highlighting local ingredients and creative cooking styles.' },
      { id: 'dr2', name: 'Sunny Street Cafe', cuisine: 'Breakfast & Bistro', rating: 4.3, price: '₹₹', description: 'Cozy neighborhood spot serving delicious brunch favorites all day long.' },
      { id: 'dr3', name: 'Downtown Express Bites', cuisine: 'Street Food', rating: 4.2, price: '₹', description: 'Fast, fresh, and budget-friendly meals popular among locals.' }
    ]
  }
};

function getMockWeather(destination) {
  const key = getDestinationKey(destination);
  return mockData[key].weather;
}

function getMockHotels(destination, budgetVal) {
  const key = getDestinationKey(destination);
  let list = mockData[key].hotels;
  if (budgetVal) {
    const numericBudget = parseFloat(budgetVal);
    if (!isNaN(numericBudget)) {
      // Filter hotels that are within reasonable range of daily budget (e.g. up to 60% of daily total budget)
      return list.filter(h => h.pricePerNight <= numericBudget);
    }
  }
  return list;
}

function getMockRestaurants(destination) {
  const key = getDestinationKey(destination);
  return mockData[key].restaurants;
}

module.exports = {
  getMockWeather,
  getMockHotels,
  getMockRestaurants
};
