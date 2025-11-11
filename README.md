# Ferrovias Web

Real-time train tracking applications for the Belgrano Norte railway line in Buenos Aires, Argentina.

## Projects

This repository contains two web applications for tracking trains:

### 1. Legacy HTML/JS Application (Root Directory)

A simple, standalone train tracking application using vanilla JavaScript.

**Files:**
- `index.html` - Main HTML page
- `app.js` - Application entry point
- `mapLogic.js` - Core train tracking logic
- `config.js` - Station and route configuration
- `style.css` - Styling

**Features:**
- Real-time train position estimation
- Visual track representation
- Live API integration with fallback to mock data
- Responsive design with Tailwind CSS

### 2. Modern Next.js Application (`ferrovias-website/`)

A modern, feature-rich React application built with Next.js 16.

**Key Features:**
- 🚂 **Live Train Map** - Real-time train position tracking
- 📊 **Station Departures** - Detailed departure information per station
- 📈 **Railway Analytics** - Performance metrics and punctuality statistics
- 📱 **Responsive Design** - Mobile-friendly interface
- 🎨 **Modern UI** - Built with Tailwind CSS and Lucide icons
- 💾 **Data Import** - CSV import for historical timetable analysis

**Technologies:**
- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4
- Lucide React Icons

## Getting Started

### Legacy Application

Simply open `index.html` in a web browser. No build step required.

### Next.js Application

```bash
cd ferrovias-website
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## API

Both applications connect to the Belgrano Norte railway API:

```
https://ferrovias.fdiaznem.com.ar/stations/all/status
```

When the API is unavailable, the applications automatically fall back to mock data.

## Development

### Linting

```bash
cd ferrovias-website
npm run lint
```

### Building

```bash
cd ferrovias-website
npm run build
```

## Project Structure

```
ferrovias-web/
├── index.html          # Legacy app HTML
├── app.js              # Legacy app entry point
├── mapLogic.js         # Core tracking logic
├── config.js           # Configuration
├── style.css           # Legacy app styles
└── ferrovias-website/  # Next.js application
    ├── src/
    │   ├── app/        # Next.js app router pages
    │   ├── components/ # React components
    │   └── lib/        # Utilities and logic
    └── public/         # Static assets
```

## License

MIT

## Author

Defeeeee
