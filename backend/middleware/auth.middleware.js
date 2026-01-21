import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env.js"
import userModel from "../models/auth.model.js";

export const authMiddleware = async (req, res, next) => {
    try {
      let token;

      let header = req.headers.authorization;

      if (header && header.startsWith("Bearer")) {
        token = header.split(' ')[1]
      }

      if (!token && req.cookies) {
          token = req.cookies.token
      }

      if (!token) {
        return res.status(401).json({
          message: "Not authenticated"
        });
      }

      let decoded;

      try {
        decoded = jwt.verify(token, JWT_SECRET);
        // req.userId = decoded.id;
      } catch (error) {
        // return res.status(401).json({ message: "Invalid token" });
        const errorMsg = new Error(`Invalid token : ${error}`);
        errorMsg.statusCode = 401
        return next(errorMsg)
      }

      if (!decoded | !decoded.userId) {
          res.status(401).json({
            message: "Inavlid or expired token"
          })
        }

      let user = await userModel.findById(decoded.userId).select('-password') 

      if (!user) {
        const error = new Error("User not found, Invalid Token");
        error.statusCode = 401
        return next(error)
      }
      req.user = user;
      next();
    } catch (error) {
      console.error("Authentication Error", error.message)
      const errorMsg = new Error(`Token is not valid ${error}`)
      errorMsg.statusCode = 400;
      return next(errorMsg)
    }
};
