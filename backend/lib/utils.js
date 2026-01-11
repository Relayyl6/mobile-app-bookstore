import jwt from "jsonwebtoken"
import { JWT_EXPIRES_IN, JWT_SECRET } from "../config/env.js"

export const  generateToken = (userId) => {
    return jwt.sign(
        {userId: userId},
        JWT_SECRET,
        {expiresIn: JWT_EXPIRES_IN}
    )
}