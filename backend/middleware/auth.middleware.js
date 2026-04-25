import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env.js"
import userModel from "../models/auth.model.js";
import mongoose from "mongoose";

export const authMiddleware = async (req, res, next) => {
  console.log("📨 Raw Authorization header:", req.headers.authorization?.substring(0, 50));
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
        console.log("🔑 Decoded token:", decoded);
        console.log("🆔 userId from token:", decoded.userId, typeof decoded.userId);
      } catch (error) {
        // return res.status(401).json({ message: "Invalid token" });
        const errorMsg = new Error(`Invalid token : ${error}`);
        errorMsg.statusCode = 401
        return next(errorMsg)
      }

      if (!decoded || !decoded.userId) {
          return res.status(401).json({
            message: "Inavlid or expired token"
          })
        }

      let user;
      try {
          user = await userModel.findById(decoded.userId).select('-password');
      } catch (dbError) {
          console.error("❌ findById failed:", dbError.message, "| userId was:", decoded.userId);
          return res.status(401).json({ message: "Invalid token payload" });
      }
      
      if (!user) {
        const error = new Error("User not found, Invalid Token");
        error.statusCode = 401
        return next(error)
      }
      req.user = user;
      console.log("✅ req.user set:", req.user._id);
      next();
    } catch (error) {
      console.error("Authentication Error:", error.message, error.stack);
      error.statusCode = error.statusCode || 400;
      return next(error);
    }
};
