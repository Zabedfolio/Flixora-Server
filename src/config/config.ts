import dotenv from 'dotenv'
dotenv.config()

if (!process.env.MONGODB_URI)
{
    throw new Error ('Mongodb URI not define...')
}

interface config {
    MONGODB_URI: string,
}


const Config:config = {
    MONGODB_URI: process.env.MONGODB_URI
}

export default Config
