# Weather App ☀️🌧️

A beautiful, modern weather app built with React Native and Expo. Get current weather, 5-day and 24-hour forecasts, smart activity suggestions, weather insights dashboard, and more!

## Features

- **Current Weather:** See temperature, precipitation, wind, UV index, and more for your location.
- **5-Day & 24-Hour Forecasts:** Visual, emoji-based forecasts for the next 5 days and 24 hours.
- **Smart Features:**
  - **Smart Alerts:** Get notified about rain, high UV, strong wind, and extreme temperatures.
  - **Activity Suggestions:** Personalized, emoji-rich suggestions based on the weather.
  - **Weather Insights Dashboard:** Visual dashboard with average temp, rainy days, and a bar chart for the month.
- **Weather Maps:** Switch between temperature, precipitation, wind, air quality, and radar maps.
- **Modern UI:** Clean, mobile-friendly design with beautiful gradients and cards.

## Screenshots

> _Add your screenshots here!_

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)

### Installation
```sh
git clone https://github.com/muskxn25/weather-app.git
cd weather-app
npm install
```

### Running the App
```sh
npx expo start
```
- Scan the QR code with Expo Go (iOS/Android) or run on a simulator.

## Project Structure
- `src/screens/` — All main screens (Home, Forecast, Smart Features, Weather Maps)
- `src/services/` — Weather data fetching and utilities
- `src/context/` — Weather context provider
- `assets/` — App images and icons

## Customization
- **Weather Maps:** Uses static images for each map type (no API key needed). You can swap these for your own images or integrate a real map API.
- **Activity Suggestions:** Easily extend the logic in `SmartFeaturesScreen.tsx` for more personalized tips.

## Credits
- Weather data from [Open-Meteo](https://open-meteo.com/)
- Map images from NASA, NOAA, Windy, WAQI, and others
- UI inspired by modern weather and analytics apps

## License
[MIT](LICENSE) 