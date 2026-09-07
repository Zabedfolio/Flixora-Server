import { Request, Response } from "express";
import axios from "axios";
import Config from "../config/config";
import { ChatHistory, IChatMessage } from "../models/chatHistory.model";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";

// Helper to fetch TMDB API
const fetchTMDB = async (endpoint: string, params: Record<string, any> = {}) => {
  try {
    const res = await axios.get(`${TMDB_BASE_URL}${endpoint}`, {
      params: {
        api_key: Config.TMDB_API_KEY,
        language: "en-US",
        include_adult: false,
        ...params,
      },
    });
    return res.data;
  } catch (err) {
    return null;
  }
};

const getPosterUrl = (path?: string) => {
  return path ? `https://image.tmdb.org/t/p/w500${path}` : "https://via.placeholder.com/500x750?text=No+Poster";
};

// Helper to extract TMDB movies
const extractTMDBMovies = (results: any[], count: number = 6) => {
  return (results || [])
    .filter((m: any) => m.media_type !== "person")
    .slice(0, count)
    .map((m: any) => {
      const itemTitle = m.title || m.name || "Featured Title";
      const itemDate = m.release_date || m.first_air_date;
      return {
        id: m.id.toString(),
        title: itemTitle,
        original_title: m.original_title || m.original_name,
        year: itemDate ? new Date(itemDate).getFullYear() : 2026,
        rating: m.vote_average ? Number(m.vote_average.toFixed(1)) : 8.0,
        genres: m.genre_ids || ["Featured"],
        posterUrl: getPosterUrl(m.poster_path),
        poster_path: m.poster_path ? getPosterUrl(m.poster_path) : null,
        backdrop_path: m.backdrop_path ? `https://image.tmdb.org/t/p/w1280${m.backdrop_path}` : null,
        overview: m.overview || "",
        vote_average: m.vote_average,
        vote_count: m.vote_count,
        release_date: m.release_date || m.first_air_date,
        media_type: m.media_type || "movie",
      };
    });
};

export const movieAssistant = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { prompt, query, sessionId = "default_session", userId, messages = [] } = req.body;
    const userMessage = (prompt || query || "").trim();
    if (!userMessage) {
      res.status(400).json({ success: false, message: "Prompt is required." });
      return;
    }

    const qLower = userMessage.toLowerCase();
    const countMatch = qLower.match(/\b([1-9]|10)\b/);
    const requestedCount = countMatch ? Math.min(Math.max(parseInt(countMatch[1], 10), 1), 10) : 6;

    let replyText = "";
    let movies: any[] | undefined = undefined;
    let source = "ai_engine";

    // 1. Check Greetings
    const isGreeting = /^(hi|hello|hey|hy|hola|sup|yo|good\s*(morning|afternoon|evening|night)|howdy|heyy+)\b/i.test(qLower);
    const isIdentity = /(who are you|what is your name|what can you do|who made you|help|capabilities|what is flix)\b/i.test(qLower);
    const isGratitude = /(thanks|thank\s*you|thx|awesome|cool|great|sweet|perfect|appreciate)\b/i.test(qLower);
    const isFarewell = /(bye|goodbye|cya|see\s*ya|night|gn)\b/i.test(qLower);

    if (isGreeting) {
      replyText = "Hey there! 👋 I'm Flix, your AI cinema guide on Flixora. 🎬\n\nWhat kind of movie or mood are you in today? Tell me a genre like Sci-Fi, Action, Horror, or Comedy — or ask me what's trending!";
    } else if (isIdentity) {
      replyText = "I'm **Flix**, Flixora's AI streaming assistant! 🍿\n\nHere is how I can help you today:\n• 🎬 Discover personalized movie & TV recommendations\n• 🔥 Explore trending blockbusters worldwide\n• 🔍 Search for titles, actors, or genres\n• 🔖 Learn how to manage your Watchlist & account";
    } else if (isGratitude) {
      replyText = "You're very welcome! 🍿 Let me know whenever you're ready for your next movie night. Enjoy streaming on Flixora!";
    } else if (isFarewell) {
      replyText = "Goodbye! Have an awesome movie night! 🎬✨ Come back anytime you need great recommendations!";
    }

    // 2. Summary Intent
    if (!replyText) {
      const isSummary = /(?:summary|synopsis|overview|plot|details?|info|explain|tell\s+me\s+about|what\s+is\s+.+\s+about)\b/i.test(qLower);
      if (isSummary) {
        let summaryTarget = "";
        const p1 = qLower.match(/(?:summary|synopsis|overview|plot|details?|info|explain|tell\s+me)\s+(?:about|of|for|on)?\s+([^,.?!]+)/i);
        if (p1 && p1[1]) {
          summaryTarget = p1[1].replace(/\b(please|can\s+you|could\s+you|movie|anime|show|series)\b/gi, "").trim();
        }
        if (!summaryTarget) {
          const p2 = qLower.match(/what\s+is\s+([^,.?!]+?)\s+about/i);
          if (p2 && p2[1]) summaryTarget = p2[1].replace(/\b(movie|anime|show|series)\b/gi, "").trim();
        }

        if (summaryTarget) {
          const multiRes = await fetchTMDB("/search/multi", { query: summaryTarget });
          const target = (multiRes?.results || []).find((r: any) => r.media_type === "movie" || r.media_type === "tv");

          if (target) {
            const title = target.title || target.name;
            const dateStr = target.release_date || target.first_air_date;
            const yearStr = dateStr ? ` (${new Date(dateStr).getFullYear()})` : "";
            const ratingStr = target.vote_average ? `${Number(target.vote_average.toFixed(1))}/10` : "8.0/10";
            const isAnime = (target.origin_country || []).includes("JP") || (target.genre_ids || []).includes(16);
            const mediaType = target.media_type === "tv" ? (isAnime ? "Anime / TV Series" : "TV Series") : "Movie";

            replyText = `📖 **Summary & Overview: "${title}"${yearStr}**\n\n🎬 **Type**: ${mediaType} | ⭐ **Rating**: ${ratingStr}\n\n**Synopsis**:\n${target.overview || "No detailed synopsis available."}\n\n🍿 *Would you like recommendations similar to ${title}?*`;
            movies = [{
              id: target.id.toString(),
              title: title,
              year: dateStr ? new Date(dateStr).getFullYear() : 2026,
              rating: target.vote_average ? Number(target.vote_average.toFixed(1)) : 8.0,
              genres: [mediaType],
              posterUrl: getPosterUrl(target.poster_path),
              overview: target.overview || "",
            }];
            source = "tmdb_summary";
          }
        }
      }
    }

    // 3. Similarity Intent ("movies like Inception")
    if (!replyText) {
      const isSimilarIntent = /(?:like|similar\s+to|resembling|related\s+to|same\s+as|liked|loved|enjoyed)\b/i.test(qLower);
      if (isSimilarIntent) {
        let simTarget = "";
        const m1 = qLower.match(/(?:movies|films|shows|something|anything|suggest|recommend|give\s+me|find)?\s*(?:like|similar\s+to|resembling|related\s+to|same\s+as)\s+([^,.?!]+)/i);
        if (m1 && m1[1]) {
          let candidate = m1[1].split(/\b(what|how|where|suggest|give|show|recommend)\b/i)[0];
          simTarget = candidate.replace(/\b(movies|films|shows|please|suggest|recommend|top|[0-9]+|this|that|like\s+that)\b/gi, "").trim();
        }
        if (!simTarget) {
          const m2 = qLower.match(/(?:if\s+i\s+|i\s+)(?:liked|loved|enjoyed|watched)\s+([^,.?!]+)/i);
          if (m2 && m2[1]) {
            let candidate = m2[1].split(/\b(what|how|where|suggest|give|show|recommend)\b/i)[0];
            simTarget = candidate.replace(/\b(give|suggest|show|recommend|movies|films|like|that|this|more)\b/gi, "").trim();
          }
        }

        if (simTarget && simTarget.length >= 2) {
          const searchData = await fetchTMDB("/search/movie", { query: simTarget });
          const targetMovie = searchData?.results?.[0];

          if (targetMovie) {
            let recData = await fetchTMDB(`/movie/${targetMovie.id}/recommendations`);
            if (!recData?.results?.length) recData = await fetchTMDB(`/movie/${targetMovie.id}/similar`);

            if (recData?.results?.length > 0) {
              const extracted = extractTMDBMovies(recData.results, requestedCount);
              const yearStr = targetMovie.release_date ? ` (${new Date(targetMovie.release_date).getFullYear()})` : "";
              const lines = [`🎬 **Movies Similar to "${targetMovie.title}"${yearStr}:**\n*Based on genre tags, storyline themes, and recommendations related to ${targetMovie.title}:*\n`];
              extracted.forEach((m, idx) => {
                const mYear = m.year ? ` (${m.year})` : "";
                const mRating = m.rating ? ` ⭐ ${m.rating}` : "";
                const mDesc = m.overview ? ` — *${m.overview.slice(0, 70)}...*` : "";
                lines.push(`${idx + 1}. **${m.title}**${mYear}${mRating}${mDesc}`);
              });
              replyText = lines.join("\n");
              movies = extracted;
              source = "tmdb_similarity";
            }
          }
        }
      }
    }

    // 4. Genre / Search Intent with dynamic TMDB with_genres tag matching
    if (!replyText) {
      let endpoint = "/trending/movie/day";
      let categoryName = "Popular";
      let emojiHeader = "🍿";
      const params: Record<string, any> = { page: 1, sort_by: "popularity.desc" };

      if (/sci[- ]?fi|science\s*fiction|scifi|space|alien|futuristic|cyberpunk/i.test(qLower)) {
        endpoint = "/discover/movie";
        params.with_genres = "878";
        categoryName = "Sci-Fi";
        emojiHeader = "🚀";
      } else if (/action|fight|superhero|explosive|martial\s*arts/i.test(qLower)) {
        endpoint = "/discover/movie";
        params.with_genres = "28";
        categoryName = "Action";
        emojiHeader = "⚡️";
      } else if (/adventure|journey|expedition/i.test(qLower)) {
        endpoint = "/discover/movie";
        params.with_genres = "12";
        categoryName = "Adventure";
        emojiHeader = "🗺️";
      } else if (/horror|scary|spooky|creepy|ghost|zombie|vampire|slasher/i.test(qLower)) {
        endpoint = "/discover/movie";
        params.with_genres = "27";
        categoryName = "Horror";
        emojiHeader = "👻";
      } else if (/comedy|funny|hilarious|laugh|humor/i.test(qLower)) {
        endpoint = "/discover/movie";
        params.with_genres = "35";
        categoryName = "Hilarious Comedy";
        emojiHeader = "🍿";
      } else if (/anime|animation|animated|cartoon/i.test(qLower)) {
        endpoint = "/discover/movie";
        params.with_genres = "16";
        categoryName = "Animation & Anime";
        emojiHeader = "✨";
      } else if (/thriller|suspense|mystery|detective/i.test(qLower)) {
        endpoint = "/discover/movie";
        params.with_genres = "53";
        categoryName = "Suspenseful Thriller";
        emojiHeader = "🔍";
      } else if (/crime|gangster|mafia|heist/i.test(qLower)) {
        endpoint = "/discover/movie";
        params.with_genres = "80";
        categoryName = "Crime";
        emojiHeader = "🕵️";
      } else if (/romance|romantic|love\s*movie|date\s*night/i.test(qLower)) {
        endpoint = "/discover/movie";
        params.with_genres = "10749";
        categoryName = "Romantic";
        emojiHeader = "❤️";
      } else if (/drama|emotional/i.test(qLower)) {
        endpoint = "/discover/movie";
        params.with_genres = "18";
        categoryName = "Drama";
        emojiHeader = "🎭";
      } else if (/fantasy|magic|mythical/i.test(qLower)) {
        endpoint = "/discover/movie";
        params.with_genres = "14";
        categoryName = "Fantasy";
        emojiHeader = "⚔️";
      } else if (/family|kids|children/i.test(qLower)) {
        endpoint = "/discover/movie";
        params.with_genres = "10751";
        categoryName = "Family & Kids";
        emojiHeader = "👨‍👩‍👧‍👦";
      } else if (/trending|popular|hits|top\s*rated|blockbuster/i.test(qLower)) {
        endpoint = "/trending/movie/day";
        categoryName = "Trending Blockbuster";
        emojiHeader = "🔥";
      } else if (userMessage) {
        endpoint = "/search/multi";
        params.query = userMessage;
        categoryName = `"${userMessage}" Search`;
        emojiHeader = "🎬";
      }

      let tmdbData = await fetchTMDB(endpoint, params);
      if (!tmdbData?.results?.length && userMessage) {
        tmdbData = await fetchTMDB("/trending/movie/day");
        categoryName = "Trending Movie";
      }

      const extracted = extractTMDBMovies(tmdbData?.results, requestedCount);
      const lines = [`${emojiHeader} Here are ${extracted.length} top ${categoryName} recommendations for your movie night:\n`];
      extracted.forEach((m, idx) => {
        const mYear = m.year ? ` (${m.year})` : "";
        const mRating = m.rating ? ` ⭐ ${m.rating}` : "";
        const mDesc = m.overview ? ` — *${m.overview.slice(0, 70)}...*` : "";
        lines.push(`${idx + 1}. **${m.title}**${mYear}${mRating}${mDesc}`);
      });
      replyText = lines.join("\n");
      movies = extracted.length > 0 ? extracted : undefined;
      source = "tmdb";
    }

    const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const userMsg: IChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: userMessage,
      timestamp,
    };
    const botMsg: IChatMessage = {
      id: (Date.now() + 1).toString(),
      sender: "bot",
      text: replyText,
      timestamp,
      movies,
    };

    // Save to MongoDB ChatHistory collection
    try {
      await ChatHistory.findOneAndUpdate(
        { sessionId },
        {
          $set: { userId: userId || undefined },
          $push: { messages: { $each: [userMsg, botMsg] } },
        },
        { upsert: true, new: true }
      );
    } catch (dbErr) {
      console.warn("MongoDB ChatHistory save warning:", dbErr);
    }

    res.status(200).json({
      success: true,
      reply: replyText,
      movies,
      source,
      userMsg,
      botMsg,
    });
  } catch (error: any) {
    console.error("AI Controller Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate AI chat response.",
    });
  }
};

export const getChatHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sessionId, userId } = req.query;
    if (!sessionId && !userId) {
      res.status(400).json({ success: false, message: "sessionId or userId is required." });
      return;
    }

    const filter = userId ? { userId: String(userId) } : { sessionId: String(sessionId) };
    const history = await ChatHistory.findOne(filter);

    res.status(200).json({
      success: true,
      messages: history?.messages || [],
    });
  } catch (err) {
    console.error("Get Chat History Error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch chat history." });
  }
};

export const clearChatHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sessionId, userId } = req.body || req.query;
    if (!sessionId && !userId) {
      res.status(400).json({ success: false, message: "sessionId or userId is required." });
      return;
    }

    const filter = userId ? { userId: String(userId) } : { sessionId: String(sessionId) };
    await ChatHistory.deleteOne(filter);

    res.status(200).json({
      success: true,
      message: "Chat history cleared successfully.",
    });
  } catch (err) {
    console.error("Clear Chat History Error:", err);
    res.status(500).json({ success: false, message: "Failed to clear chat history." });
  }
};
