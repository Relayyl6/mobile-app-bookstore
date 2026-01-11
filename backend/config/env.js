import { config } from 'dotenv'
import process from 'process'

config({path: '.env.local'})

export const {
    PORT,
    DB_URL,
    JWT_SECRET,
    JWT_EXPIRES_IN,
    NODE_ENV,
    CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET
} = process.env;