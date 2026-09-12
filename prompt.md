First I want to build the APP named "Vantage AI" 
Vantage AI is an AI-powered travel planning application that uses google gemini or open source ai to generate personilized travel itineraries. It tailors trips based on destination budget and user perferences for efficient, relevant plans.
Purpose: Provide end to end travel planning assistant that automates itinerary creation, centralies travel data and delivers personilized recommendations using AI.
Pain points: Manual trip planning is time consuming and error prone. Travel information is scatteres across many websites and apps. Budget management is difficult to compare and optimise. Lack of personalized recommandations leads to generic itineraries.
AI solution: Google Gemini or open source ai consolidates data understanding user preferemces optimises budgets and generates personalised context aware travel plane reducing effort and improving trip quality.
Life cycle: Login -> Destination -> AI process -> Save trips
Architecture: react+vite frontend, Express.js backend, Google gemini api or open source ai, ai processing, Personalized travel plan.
Account: Register/login logout to manage access.
Preferences: Enter Destination and select budget before planning.
AI Planing: Generate Ai travel plan and view itinerary.
Save: Save trip to preserve chosen itinerary.
POST: /gnerate-trip: Request travel inputs -> returns generated itinerary.
POST: /chat: Conversational assitant for clarification and refinements
GET: /weather: fetches destination weathers forecasts
GET: /hotels: Queries available hotels and price options
GET: /restaurants: Returns recommended dining options and rating.

The app contains HOME, AI planner, Hotesl, Restaurants, Weather, Saved Trips, Profile, 


