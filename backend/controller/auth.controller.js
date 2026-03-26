import mongoose from "mongoose";
import { generateToken } from "../lib/utils.js";
import userModel from "../models/auth.model.js";
import { NODE_ENV } from "../config/env.js";
import { format } from "date-fns";
import bookModel from "../models/book.model.js";

const formatUserPayload = (user) => ({
    id: user._id,
    username: user.username,
    email: user.email,
    profileImage: user.profileImage,
    preferredGenres: user.preferredGenres || [],
    favoriteAuthors: user.favoriteAuthors || [],
    bio: user.bio || "",
    readingGoalPerYear: user.readingGoalPerYear || 12,
    onboardingCompleted: Boolean(user.onboardingCompleted),
    createdAt: format(new Date(user.createdAt), 'MMM d, yyyy')
});

export const register = async (req, res, next) => {
    // const session = await mongoose.startSession();
    // session.startTransaction()
    // console.log("HIT /register", req.body);

    console.log("Registration started")

    try {
        const { email, username, password, preferredGenres, favoriteAuthors } = req.body;

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
                error.statusCode = 409
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
            profileImage,
            preferredGenres: preferredGenres || [],
            favoriteAuthors: favoriteAuthors || []
        })

        await user.save()

        const token = generateToken(user._id)

        res.cookie("token", token, {
            httpOnly: true,
            sameSite: "strict",
            secure: NODE_ENV,
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        
        // await session.commitTransaction()
        // session.endSession();
        console.log(JSON.stringify(user))

        res.status(201).json({
            message: "User successfully registered",
            data: {
                token,
                user: formatUserPayload(user)
            }
        })
    } catch (error) {
        // await session.abortTransaction();
        // session.endSession();
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


export const logIn = async (req, res, next) => {
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
        const isMatch = await user.comparePassword(password);

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
                user: formatUserPayload(user)
            }
        })
    } catch (error) {
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

export const getMyProfile = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    if (!userId) return next({ statusCode: 401, message: "Unauthorized" });

    const user = await userModel.findById(userId).select("-password").lean();
    if (!user) return next({ statusCode: 404, message: "User not found" });

    const uploadedBooks = await bookModel
      .find({ user: userId })
      .select("_id title author image visibility createdAt totalViews totalPurchases averageRating")
      .sort({ createdAt: -1 })
      .lean();

    const publicCount = uploadedBooks.filter((book) => book.visibility === "public").length;
    const privateCount = uploadedBooks.length - publicCount;

    return res.status(200).json({
      success: true,
      profile: formatUserPayload(user),
      stats: {
        uploadedBooks: uploadedBooks.length,
        publicBooks: publicCount,
        privateBooks: privateCount,
      },
      uploadedBooks: uploadedBooks.map((book) => ({
        id: book._id,
        title: book.title,
        author: book.author,
        image: book.image || "",
        visibility: book.visibility || "public",
        createdAt: book.createdAt,
        averageRating: book.averageRating || 0,
        totalViews: book.totalViews || 0,
        totalPurchases: book.totalPurchases || 0,
      })),
    });
  } catch (error) {
    next(error);
  }
};

export const updateMyProfile = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    if (!userId) return next({ statusCode: 401, message: "Unauthorized" });

    const allowedFields = [
      "username",
      "bio",
      "preferredGenres",
      "favoriteAuthors",
      "readingGoalPerYear",
      "onboardingCompleted",
      "profileImage",
    ];

    const update = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        update[field] = req.body[field];
      }
    }

    const user = await userModel
      .findByIdAndUpdate(userId, { $set: update }, { new: true, runValidators: true })
      .select("-password");

    if (!user) return next({ statusCode: 404, message: "User not found" });

    return res.status(200).json({
      success: true,
      message: "Profile updated",
      user: formatUserPayload(user),
    });
  } catch (error) {
    next(error);
  }
};
