import { Schema, Types, model } from "mongoose";

const ratingSchema = new Schema(
  {
    user: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    book: {
      type: Types.ObjectId,
      ref: "Book",
      required: true,
      index: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    review: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
  },
  {
    timestamps: true,
  }
);

/* -------- PREVENT DUPLICATE RATINGS -------- */
// One user can rate a book only once
ratingSchema.index({ user: 1, book: 1 }, { unique: true });

const RatingModel = model("Rating", ratingSchema);
export default RatingModel;


// Relationship overview
// User  ───< Rating >─── Book

// User has many Ratings

// Book has many Ratings

// Rating belongs to exactly one User and one Book

// 👉 This is a classic many-to-many relationship modeled correctly.