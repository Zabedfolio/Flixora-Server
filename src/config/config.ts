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

interface config {
    MONGODB_URI: string,
    TMDB_ACCESS_TOKEN: string,
}


const Config:config = {
    MONGODB_URI: process.env.MONGODB_URI,
    TMDB_ACCESS_TOKEN: process.env.TMDB_ACCESS_TOKEN,
}

export default Config
