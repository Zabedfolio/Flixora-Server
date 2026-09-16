# AI Movie Assistant – Feature Plan

## Overview
Natural language movie recommendation system.  
User types a mood / request → AI extracts filters → TMDB returns 6 relevant movies.

## Flow
```
User Prompt → Gemini (extract filters) → TMDB API Call → Return 6 Movies
```

## API
- **Endpoint**: `POST /api/ai/chat`
- **Body**: `{ "prompt": "I feel lonely, something emotional" }`
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "message": "Found movies for mood: lonely",
      "filters": { "mood", "genres", "keywords", "year" },
      "movies": [ /* 6 movies */ ]
    }
  }
  ```

## Components
| Part              | Responsibility                          | File / Service              |
|-------------------|-----------------------------------------|-----------------------------|
| Controller        | Validate + orchestrate                  | `movieAssistant`            |
| Gemini Service    | Prompt → structured filters             | `generateMovieFilters`      |
| TMDB Service      | Filters → Discover API + shuffle        | `searchMoviesForAI`         |

## Key Logic
1. **Gemini** extracts: `mood`, `genres[]`, `keywords[]`, `year?`
2. **TMDB** maps genres → IDs, random page (1-3) + random sort, filters by year & vote_count ≥ 100
3. Shuffle results → return top 6 movies (id, title, overview, poster, rating, etc.)

## Current Status
- Core flow implemented
- Missing: conversation history (MongoDB), keywords usage, proper Gemini model name, caching

## Future Improvements
- Save chat history to MongoDB
- Multi-turn conversation
- Better keyword support
- Caching for popular prompts
- Frontend chat UI + movie cards
