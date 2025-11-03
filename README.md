# Rightmove Smart Search

A smart property search webapp for Rightmove that solves the frustrations of traditional property searching with flexible, weighted filtering and relevance scoring.

## The Problem

When searching for properties on Rightmove:
1. **Too many listings** - Even with filters, you get thousands of results
2. **Hard to distinguish** - Student vs. non-student properties are mixed together
3. **Rigid filters** - Traditional filters are all-or-nothing; if you want a garden, close proximity to locations, specific budget, bedrooms, bathrooms, you can't check all at once or you'll filter everything out

## The Solution

This webapp provides:
- **Smart Scraping** - Fetches properties from Rightmove and stores them locally
- **Weighted Filtering** - Each filter has an importance "weight" (0-10)
- **Relevance Scoring** - Properties are scored by how well they match your weighted criteria (0-100% match)
- **Flexible Matching** - See all properties ranked by relevance, not just perfect matches
- **Student Detection** - Automatically identifies student properties
- **Garden Detection** - Identifies properties with gardens/outdoor space
- **Room Sizing Detection** - Detects double bedrooms, ensuite rooms, master bedrooms, and similarly-sized rooms
- **Multiple Location Support** - Score properties based on proximity to multiple locations (e.g., university, work, city centre)

## Features

### Backend (Node.js + Express + TypeScript)
- RESTful API for property management
- SQLite database for local storage
- Rightmove web scraper (cheerio-based)
- Intelligent scoring algorithm
- Caching for performance

### Frontend (React + TypeScript)
- Beautiful, responsive property cards
- Interactive filter panel with sliders
- Relevance score visualization
- Match details breakdown
- Statistics dashboard

### Smart Scoring System (0-100% Match)

Each property gets a relevance score (0-100%) based on:
- **Price** - Lower is better, partial credit for slightly over budget
- **Bedrooms** - Bonus for extra bedrooms
- **Bathrooms** - Bonus for extra bathrooms
- **Garden** - Binary match
- **Student Property** - Match your preference
- **Room Criteria** - Min double bedrooms, min ensuite rooms, similarly-sized rooms, master bedroom
- **Multiple Locations** - Proximity to each location (e.g., university 2km away, work 5km away)

**The Key Innovation**: Properties don't need to match all criteria perfectly. Instead:
- Each criterion has a **weight** (how important it is to you)
- Properties are **scored** based on how well they match each weighted criterion
- You see **all** properties sorted by relevance score, not just perfect matches
- This means you won't miss great properties that are "close enough"

**Example**: You want 2 double bedrooms (weight 10), garden (weight 8), close to uni (weight 9), under £1200 (weight 7)
- Property A: 2 doubles, garden, 1km from uni, £1250 → **92% match** (slightly over budget but perfect otherwise)
- Property B: 1 double + 1 single, no garden, 0.5km from uni, £1100 → **68% match** (close to uni and cheap, but missing room criteria)
- Property C: 3 doubles, garden, 5km from uni, £1150 → **85% match** (extra bedroom, but further from uni)

All three show up in your results, ranked by relevance!

## Getting Started

### Prerequisites
- Node.js 16+ and npm/yarn
- Git

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd gmail_clone_test
```

2. Install dependencies:
```bash
yarn install
```

3. Start the development servers:
```bash
# Start both frontend and backend
yarn dev

# Or start them separately:
yarn dev:server  # Backend on http://localhost:3001
yarn dev:client  # Frontend on http://localhost:3000
```

## Usage

### 1. Load Properties

Click **"Load Nottingham Properties"** to scrape properties from Rightmove's Nottingham area. This will:
- Fetch listings from Rightmove
- Parse property details (price, beds, baths, etc.)
- Detect student properties and gardens
- **Detect room sizing** (double bedrooms, ensuite rooms, master bedroom, similarly-sized rooms)
- Store everything in the local database

### 2. Set Your Preferences

Use the filter panel to set your preferences:

**Basic Filters:**
- **Max Price** - Set your budget and how important it is (weight)
- **Min Bedrooms** - Minimum bedrooms needed
- **Min Bathrooms** - Minimum bathrooms needed
- **Garden** - How important is having a garden?
- **Student Property** - Yes/No/Either, and how important is this?

**Advanced Filters (via API):**
- **Room Criteria** - Min double bedrooms, min ensuite rooms, similarly-sized rooms, master bedroom
- **Multiple Locations** - Add multiple locations with individual distance thresholds and weights
  - Example: University (2km, weight 10), City Centre (5km, weight 5), Work (3km, weight 8)

Each filter has a **weight slider** (0-10):
- 0 = Don't consider this criterion
- 5 = Moderately important
- 10 = Extremely important

**Note:** The UI currently supports basic filters. For advanced room and location filtering, use the API directly (see API Endpoints section).

### 3. View Results

Click **"Apply Filters"** to see properties ranked by relevance:
- Properties are sorted by **relevance score** (highest first)
- Each card shows:
  - Property details and images
  - Relevance score (0-100%)
  - Match details breakdown showing which criteria matched
  - Direct link to Rightmove listing

### 4. Interpret Scores

- **80%+** (Green) - Excellent match
- **60-79%** (Blue) - Good match
- **40-59%** (Orange) - Partial match
- **Below 40%** (Red) - Poor match

The beauty is that you see **all** properties, not just perfect matches, but sorted by how well they fit your needs.

## API Endpoints

### Properties

- `GET /api/properties` - Get all properties (optional `?filters={}` param)
- `POST /api/properties/scrape` - Scrape from custom URL
- `POST /api/properties/scrape-nottingham` - Quick scrape Nottingham area
- `DELETE /api/properties` - Clear all properties
- `GET /api/properties/stats` - Get statistics

### Health

- `GET /api/health` - Health check
- `GET /` - API documentation

## Project Structure

```
gmail_clone_test/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── PropertyCard.tsx
│   │   │   ├── PropertyCard.css
│   │   │   ├── FilterPanel.tsx
│   │   │   └── FilterPanel.css
│   │   ├── services/      # API client
│   │   │   └── api.ts
│   │   ├── types/         # TypeScript types
│   │   │   └── property.ts
│   │   ├── App.tsx
│   │   ├── App.css
│   │   └── index.tsx
│   └── package.json
├── server/                # Express backend
│   ├── src/
│   │   ├── database/      # SQLite database
│   │   │   └── db.ts
│   │   ├── routes/        # API routes
│   │   │   └── properties.ts
│   │   ├── services/      # Business logic
│   │   │   ├── rightmoveService.ts
│   │   │   └── scoringService.ts
│   │   ├── types/         # TypeScript types
│   │   │   └── property.ts
│   │   └── index.ts
│   ├── data/              # SQLite database file (auto-created)
│   └── package.json
└── package.json           # Root workspace config
```

## How It Works

### 1. Scraping

The `rightmoveService.ts` scrapes Rightmove search results:
- Parses HTML using cheerio
- Extracts property details (title, price, beds, baths, etc.)
- Detects student properties (keywords: "student", "university", "bills included", etc.)
- Detects gardens (keywords: "garden", "patio", "outdoor space", etc.)
- Stores in SQLite database

### 2. Scoring

The `scoringService.ts` implements the weighted scoring algorithm:
- Each filter criterion has a weight (importance)
- Properties are scored based on weighted matches
- Partial credit for near-misses (e.g., slightly over budget)
- Normalized to 0-100% scale
- Sorted by total score

### 3. Display

The React frontend displays:
- Property cards with images and details
- Relevance score badge (color-coded)
- Match details showing which criteria were met
- Interactive filters with weight sliders

## Important Notes

### Web Scraping Disclaimer

This app scrapes Rightmove's public search results. Please note:
- **Rate Limiting**: The app implements caching to avoid excessive requests
- **Terms of Service**: Check Rightmove's ToS before heavy usage
- **Changes**: Rightmove may change their HTML structure, breaking the scraper
- **IP Blocking**: Excessive scraping may result in IP blocks

**For production use, consider:**
- Using Rightmove's official API (if available)
- Implementing proper rate limiting
- Adding user agent rotation
- Using proxy services

### Data Privacy

All data is stored locally in an SQLite database. No data is sent to external services except when scraping Rightmove directly.

## Future Enhancements

- [ ] Location proximity calculation (distance from specific locations)
- [ ] Map view of properties
- [ ] Save favorite properties
- [ ] Email alerts for new matches
- [ ] More advanced filtering (property type, furnished status, etc.)
- [ ] Export results to CSV/PDF
- [ ] Multiple location support (beyond Nottingham)
- [ ] User accounts and saved searches

## Troubleshooting

### Server won't start
- Check if port 3001 is available
- Make sure all dependencies are installed: `yarn install`

### Client won't start
- Check if port 3000 is available
- Clear React cache: `cd client && rm -rf node_modules/.cache`

### Scraping fails
- Rightmove may have changed their HTML structure
- You may be rate-limited or IP-blocked
- Check your internet connection

### No properties showing
- Click "Load Nottingham Properties" first
- Check browser console for errors
- Verify backend is running on http://localhost:3001

## Contributing

Feel free to submit issues and enhancement requests!

## License

MIT

---

Built with ❤️ to make property hunting less painful
