import mongoose from "mongoose";
import { generateToken } from "../lib/utils.js";
import userModel from "../models/auth.model.js";
import { NODE_ENV } from "../config/env.js";

export const register = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction()

    try {
        const { email, username, password } = req.body;

        if (!email || !username || !password) {
            const missing = [
                !email && "email",
                !username && "username",
                !password && "password",
            ].filter(Boolean)
            // .filter(Boolean).join(', ');
            const formatter = new Intl.ListFormat("en", {
                style: "long",
                type: "conjunction",
            });
            
            const result = formatter.format(missing);

            const error = new Error(`${result} ${missing.length > 1 ? "are" : "is"} missing from teh request body`);
            error.statusCode = 400


            return next(error)
        }

        if (password.length < 6) {
            const error = new Error("Password should be at least 6 characters long");
            error.statusCode = 400
            return next(error)
        }

        if (username.length < 3) {
            const error = new Error("Username should be at least 3 characters long");
            error.statusCode = 400
            return next(error)
        }

        const existingUser = await userModel.findOne({
            $or: [
                { email: email },
                { username: username }
            ]
        })

        if (existingUser) {
            if (existingUser.email === email) {
                const error = new Error("Email already exists");
                error.statusCode = 400
                return next(error)
            }

            if (existingUser.username === username) {
                const error = new Error("Username already exists");
                error.statusCode = 400
                return next(error)
            }
        }

        const profileImage = `https://api.dicebear.com/9.x/avataaars/svg?seed=${username}`

        const user = new userModel({
            email,
            password,
            username,
            profileImage
        })

        await user.save()

        const token = generateToken(user._id)

        res.cookie("token", token, {
            httpOnly: true,
            sameSite: "strict",
            secure: NODE_ENV,
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        
        await session.commitTransaction()
        session.endSession();

        res.status(201).json({
            message: "User successfully registered",
            data: {
                token,
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    profileImage: user.profileImage
                }
            }
        })
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error("Error in regsitering route", error)
        res.status(500).json({
            message: "Internal Server Error"
        })
        return next(error)
    }
}


// FE login request 
// await fetch("/api/v1/auth/login", {
//   method: "POST",
//   headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
//   credentials: "include", // ⭐ REQUIRED
//   body: JSON.stringify({ email, password }),
// });


// then

// await fetch(url, {
//   method: "POST",
//   headers: {
//     Authorization: `Bearer ${token}`,
//     "Content-Type": "application/json",
//   },
//   credentials: "include",
//   body: JSON.stringify({ email, password })
// });



// in mobile 
// import * as SecureStore from "expo-secure-store";

// await SecureStore.setItemAsync("token", token);


export const logIn = async (req, res) => {
    // res.send("login")
    try {   
        const { email, password } = req.body;

        if (!email || !password) {
            const missing = [
                !email && "email",
                !password && "password",
            ].filter(Boolean)

            // .filter(Boolean).join(', ');
            const formatter = new Intl.ListFormat("en", {
                style: "long",
                type: "conjunction",
            });
            
            const result = formatter.format(missing);

            const error = new Error(`${result} ${missing.length > 1 ? "are" : "is"} missing from teh request body`);
            error.statusCode = 400

            return next(error)
        }

        const user = await userModel.findOne({email, isDeleted: false});

        if (!user) {
            res.status(400).json({
                message: "Invalid credetials",
            })
        }

        // check if password is correct
        const isMatch = user.comparePassword(password);

        if (!isMatch) {
            res.status(400).json({
                message: "Invaid credentials",
            })
        }

        // generate tokens
        const token = generateToken(user._id);

        // set response cookie
        res.cookie("token", token, {
            httpOnly: true,
            sameSite: "strict",
            secure: NODE_ENV,
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
    
        res.status(201).json({
            message: "User successfully logged in",
            data: {
                token,
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    profileImage: user.profileImage
                }
            }
        })
    } catch {
        console.error("Error in logging route", error)
        res.status(500).json({
            message: "Internal Server Error"
        })
        return next(error)
    }
}

// await fetch("/api/v1/auth/logout", {
//   method: "POST",
//   credentials: "include",
// });

// in mobile 
// await SecureStore.deleteItemAsync("token");


export const logout = async (req, res, next) => {
  try {
    res.cookie("token", "", {
      httpOnly: true,
      expires: new Date(0),
      sameSite: "strict",
      secure: NODE_ENV,
    });

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res) => {
    try {
        const {id: userId} = req.params;
    
        const result = await userModel.deleteOne({ _id: userId }); // Or findByIdAndDelete(userId)
        if (result.deletedCount === 1) {
            res.status(200).json({ message: 'User deleted successfully' });
        } else  {
            res.status(404).json({ message: 'User not found' });
        }
    } catch(error) {
        console.error("An error occured", error)
    }
}

export const softDeleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await userModel.findByIdAndUpdate(
      id,
      {
        isDeleted: true,
        deletedAt: new Date(),
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      message: "User soft-deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
