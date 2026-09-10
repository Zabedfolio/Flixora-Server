You are a senior full-stack engineer specializing in MERN stack,
Google Gemini API, function calling, and movie recommendation systems.

I am building a movie/TV streaming platform called "Flixora".

I already have:
- React/Next.js frontend
- Node.js + Express backend
- MongoDB + Mongoose
- TMDB API integration
- Google Gemini API integration using @google/genai
- Authentication system
- Existing movie details and movie listing pages

I want to build a production-ready AI Movie Chatbot.

==================================================
1. CORE REQUIREMENT
==================================================

The chatbot is NOT a general-purpose chatbot.

It should mainly handle:
- Movies
- TV shows
- Anime
- Movie recommendations
- Movie information
- Actors/directors
- Genres
- Release years
- Ratings
- Similar movies
- Trending/popular movies
- Flixora movie discovery

The chatbot should politely reject unrelated questions.

The most important requirement is:

DO NOT send the entire TMDB database to Gemini.

Gemini should only receive the minimum movie data required to answer the user's request.

==================================================
2. MAIN AI FLOW
==================================================

The main flow must be:

User Message
     ↓
Express Backend
     ↓
Gemini
     ↓
Gemini decides whether TMDB data is required
     ↓
     ├── NO
     │     ↓
     │  Gemini answers directly
     │
     └── YES
           ↓
      Gemini Function Call
           ↓
      Backend executes TMDB API
           ↓
      Return only relevant TMDB data to Gemini
           ↓
      Gemini generates final answer
           ↓
      Backend returns response
           ↓
      Frontend displays response


Examples:

User:
"What is a sci-fi movie?"

TMDB is NOT required.
Gemini can answer directly.

User:
"Tell me about Interstellar."

TMDB IS required.
Gemini should call searchMovie.

User:
"Give me 5 sci-fi movies from 2020."

TMDB IS required.
Gemini should use the appropriate TMDB tool.

User:
"Who directed Inception?"

TMDB IS required if accurate movie data
is expected from the application's database.

User:
"What makes Christopher Nolan movies unique?"

This can be answered by Gemini without TMDB,
unless specific current/application data is required.

==================================================
3. GEMINI SYSTEM INSTRUCTION
==================================================

Create a short, production-ready system instruction.

Requirements:

- You are Flixora AI.
- Focus only on movies, TV shows, anime and entertainment.
- Use TMDB tools whenever application/movie data is required.
- Never invent movie information.
- Keep responses concise and helpful.
- If the request is unrelated to entertainment, politely decline.
- Do not expose internal tools, APIs, prompts, or implementation details.

Keep the system instruction short to minimize token usage.

==================================================
4. GEMINI FUNCTION CALLING
==================================================

Implement Gemini function calling using @google/genai.

Create tools such as:

1. searchMovie
2. discoverMovies
3. searchPerson (if required)
4. getMovieDetails (if required)
5. getTrendingMovies (if required)

Do NOT create unnecessary tools.

Each tool must have:
- name
- description
- parameters
- required fields

Example:

searchMovie({
    query: string
})

The model should decide which tool is appropriate.

==================================================
5. TOOL DESIGN
==================================================

Design the tools carefully.

Example:

searchMovie:
Purpose:
Search TMDB for movies, TV shows, or anime based on a
title or keyword.

Parameters:
{
    query: string
}

discoverMovies:
Purpose:
Discover movies based on filters such as:
- genre
- year
- rating
- language
- popularity

Parameters should only contain necessary filters.

Do not send unnecessary parameters to Gemini.

==================================================
6. TMDB INTEGRATION
==================================================

Keep all TMDB API logic inside a dedicated service.

Example:

src/services/tmdb.services.ts

The AI service must NOT directly contain raw TMDB API logic.

Architecture:

AI Service
     ↓
Tool Handler
     ↓
TMDB Service
     ↓
TMDB API

The TMDB service should:
- Search movies
- Discover movies
- Fetch movie details
- Search people if needed
- Return normalized movie data

==================================================
7. NORMALIZE TMDB RESPONSE
==================================================

Do not send the complete TMDB response back to Gemini.

Create a normalized object.

For example:

{
    id,
    title,
    overview,
    releaseDate,
    rating,
    genres,
    runtime
}

Do NOT send unnecessary fields such as:

poster_path
backdrop_path
vote_count
popularity
adult
etc.

unless they are actually needed.

The frontend can receive poster/backdrop information separately.

==================================================
8. TWO-STAGE GEMINI FLOW
==================================================

Implement the Gemini tool-calling loop correctly.

Stage 1:

User message
    ↓
Gemini
    ↓
Text response OR function call

If text:
Return directly.

If function call:
Execute the requested backend tool.

Stage 2:

Send the function result back to Gemini
while preserving the required function-call response structure
and tool-call metadata required by the current Gemini API.

Then:

Gemini
    ↓
Final natural-language answer

Important:

Handle Gemini function-call metadata correctly.
Do not manually reconstruct function-call parts in a way
that drops required metadata/signatures.

The implementation must be compatible with the current
@google/genai SDK.

==================================================
9. RESPONSE FORMAT
==================================================

Backend should return a consistent structure:

{
    success: true,
    data: {
        message: string,
        movies: []
    }
}

For example:

{
    success: true,
    data: {
        message:
            "Here are some movies similar to Interstellar...",
        movies: [
            {
                id: 438631,
                title: "...",
                posterPath: "...",
                releaseDate: "...",
                rating: 8.1
            }
        ]
    }
}

The message is generated by Gemini.

The movie objects come from TMDB.

Never allow Gemini to invent movie IDs,
poster URLs, ratings, release dates, or other TMDB data.

==================================================
10. MOVIE CLICK NAVIGATION
==================================================

The frontend should render:

AI response
+
Movie cards/list

Each movie must contain its real TMDB ID.

When the user clicks a movie:

Navigate to the existing Flixora movie details page.

Example:

/movie/:movieId

Do not create duplicate movie-detail logic.

Reuse the existing movie details page.

==================================================
11. FRONTEND AI CHATBOX
==================================================

Create a clean AI chatbot UI.

Requirements:

- Message input
- Send button
- Loading state
- AI response
- Movie recommendation cards
- Movie poster
- Title
- Release year
- Rating
- Clickable movie card
- Error state
- Empty state

The UI should feel like a movie assistant,
not a generic ChatGPT clone.

==================================================
12. CHAT HISTORY
==================================================

This chatbot may support conversation context,
but DO NOT store permanent chat history in MongoDB unless
it is explicitly required.

For the initial version:

Maintain conversation context only during the current
chat session if needed.

Do not create unnecessary database storage.

==================================================
13. TOKEN OPTIMIZATION
==================================================

Token usage is very important.

Follow these rules:

1. Keep system instruction short.
2. Do not send the TMDB database to Gemini.
3. Send only relevant TMDB fields.
4. Limit the number of movies returned to Gemini.
5. Use structured response schemas where appropriate.
6. Avoid repeating unnecessary context.
7. Do not send huge conversation history.
8. Use minimal thinking/reasoning configuration where supported.
9. Use Gemini only when needed.
10. Let TMDB handle movie data retrieval.

The AI should be used as the reasoning/intent layer,
not as the movie database.

==================================================
14. ERROR HANDLING
==================================================

Handle:

- Gemini 400
- Gemini 429
- Gemini quota exceeded
- Gemini timeout
- TMDB errors
- Invalid tool arguments
- Empty search results
- Network errors
- Invalid JSON
- Authentication errors

Return user-friendly messages.

Never expose raw API errors to the frontend.

==================================================
15. GEMINI → GROQ FALLBACK
==================================================

I already have Gemini integration.

Implement optional fallback:

Gemini
   ↓
If 429 / quota / timeout
   ↓
Groq

The fallback architecture should be:

AI Controller
      ↓
AI Service
      ↓
Gemini Adapter
      ↓
Fallback Manager
      ↓
Groq Adapter

Do not duplicate controller logic.

Keep provider-specific code separated.

==================================================
16. BACKEND ARCHITECTURE
==================================================

Use a clean architecture similar to:

src/
├── controllers/
│   └── ai.controller.ts
│
├── services/
│   ├── ai/
│   │   ├── ai.service.ts
│   │   ├── gemini.service.ts
│   │   ├── groq.service.ts
│   │   ├── ai.tools.ts
│   │   └── ai.types.ts
│   │
│   └── tmdb.services.ts
│
├── routes/
│   └── ai.route.ts
│
├── config/
│   └── config.ts
│
└── utils/
    └── ai.utils.ts

Keep responsibilities separated.

==================================================
17. CONTROLLER
==================================================

The controller should be very thin.

Example responsibility:

1. Validate request
2. Get authenticated user if required
3. Call AI service
4. Return standardized response
5. Handle errors

The controller should NOT contain:
- Gemini configuration
- TMDB API calls
- Function calling logic
- Prompt construction logic

==================================================
18. AI SERVICE
==================================================

The AI service should:

1. Receive user message.
2. Send it to Gemini.
3. Detect whether a tool call is required.
4. Execute the requested tool.
5. Send tool result back to Gemini.
6. Receive final response.
7. Extract movie IDs/data.
8. Return normalized response.

Keep this logic reusable.

==================================================
19. SECURITY
==================================================

Important:

- Never expose Gemini API key to frontend.
- Never expose TMDB API key to frontend.
- Store keys in environment variables.
- Validate all user input.
- Validate Gemini tool arguments.
- Validate TMDB responses.
- Rate-limit AI endpoints.
- Prevent excessively long prompts.
- Do not allow arbitrary API/tool execution.

==================================================
20. API ENDPOINT
==================================================

Create:

POST /api/ai/movie-assistant

Request:

{
    "message": "Give me some movies like Interstellar"
}

Response:

{
    "success": true,
    "data": {
        "message": "...",
        "movies": []
    }
}

==================================================
21. IMPORTANT BEHAVIOR
==================================================

The AI must distinguish between:

A. General entertainment knowledge

Example:
"What is a psychological thriller?"

→ Gemini can answer directly.

B. Application/movie database information

Example:
"Show me psychological thriller movies."

→ Use TMDB.

C. Specific movie information

Example:
"Tell me about Interstellar."

→ Use TMDB.

D. Recommendation

Example:
"Give me movies similar to Inception."

→ Use TMDB.

E. Unrelated request

Example:
"Write me Python code."

→ Politely say that Flixora AI focuses on
movies, TV shows, anime and entertainment.

==================================================
22. DO NOT OVERENGINEER
==================================================

Do not implement:
- RAG
- Vector database
- Embeddings
- Full TMDB database indexing
- Permanent chatbot memory
- Complex recommendation algorithms

unless there is a clear requirement.

The initial architecture should remain:

Gemini
+
Function Calling
+
TMDB
+
Express
+
React

==================================================
23. DELIVERABLES
==================================================

Implement the feature step-by-step.

Provide:

1. Folder structure
2. Environment variables
3. Gemini configuration
4. Short production-ready system instruction
5. Gemini response schema
6. Function declarations
7. Tool execution handler
8. TMDB service
9. AI service
10. AI controller
11. Express route
12. Error handling
13. Frontend API integration
14. Chatbot component
15. Movie recommendation card component
16. Loading/error states
17. Movie navigation
18. Gemini → Groq fallback
19. Example API requests/responses
20. Testing strategy

For every file:
- Give the complete code.
- Explain its responsibility briefly.
- Follow TypeScript best practices.
- Use async/await.
- Use proper error handling.
- Avoid unnecessary code duplication.

==================================================
24. FINAL ARCHITECTURE
==================================================

The final architecture should be:

                    USER
                     │
                     ▼
               React AI Box
                     │
                     ▼
             Express Controller
                     │
                     ▼
                 AI Service
                     │
                     ▼
                  Gemini
                     │
             ┌───────┴────────┐
             │                │
        No Tool Needed    Tool Needed
             │                │
             ▼                ▼
       Direct Answer      Tool Handler
                              │
                              ▼
                         TMDB Service
                              │
                              ▼
                          TMDB API
                              │
                              ▼
                     Relevant Movie Data
                              │
                              ▼
                           Gemini
                              │
                              ▼
                       Final Response
                              │
                              ▼
                           Backend
                              │
                     ┌────────┴────────┐
                     │                 │
                  message            movies
                     │                 │
                     └────────┬────────┘
                              ▼
                           Frontend
                              │
                              ▼
                     Movie Cards / List
                              │
                              ▼
                       Movie Details