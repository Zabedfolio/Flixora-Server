import dotenv from 'dotenv'
dotenv.config()

if (!process.env.MONGODB_URI)
{
    throw new Error ('Mongodb URI not define...')
}
if (!process.env.TMDB_ACCESS_TOKEN)
{
    throw new Error ('TMDB_ACCESS_TOKEN not define')
}
if (!process.env.GOOGLE_GEMINI_KEY)
{
    console.warn('⚠️ WARNING: GOOGLE_GEMINI_KEY not defined in environment. AI features will be unavailable.');
}
if (!process.env.TMDB_API_KEY)
{
    throw new Error ('TMDB_API_KEY not define')
}

interface config {
    MONGODB_URI: string,
    TMDB_ACCESS_TOKEN: string,
    GOOGLE_GEMINI_KEY:string,
    TMDB_API_KEY:string,
}


const Config:config = {
    MONGODB_URI: process.env.MONGODB_URI,
    TMDB_ACCESS_TOKEN: process.env.TMDB_ACCESS_TOKEN,
    GOOGLE_GEMINI_KEY: process.env.GOOGLE_GEMINI_KEY || '',
    TMDB_API_KEY : process.env.TMDB_API_KEY
}

export default Config
