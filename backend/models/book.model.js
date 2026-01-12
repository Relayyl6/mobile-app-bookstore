import { Schema, Types, model } from "mongoose";

const bookSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      unique: [true, "Title already in use"],
      trim: true,
    },

    subTitle: {
      type: String,
      unique: [true, "Subtitle already in use"],
      trim: true,
    },

    author: {
      type: String,
      required: true,
      trim: true,
    },

    isbn: {
      type: String,
      unique: true,
      sparse: true, // allows multiple null values
    },

    caption: {
      type: String,
      required: true,
    },

    description: {
      type: String,
    },

    genres: {
      type: [String],
      index: true, // VERY important for genre-based recommendations
      validate: {
        validator: (v) => v.length > 0,
        message: "At least one genre is required",
      },
    },

    image: {
      type: String,
      required: true,
    },

    price: {
      type: Types.Decimal128,
      required: true,
      get: (value) => {
        if (value) {
          return (+value.toString()).toFixed(2);
        }
        return "";
      },
      set: (value) => {
        return new Types.Decimal128(value.toString());
      },
    },

    /* ------------------- RATING METRICS ------------------- */

    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
      /**
       * Calculated from:
       * sum(all user ratings) / totalRatings
       */
    },

    totalRatings: {
      type: Number,
      default: 0,
      min: 0,
      /**
       * Calculated from:
       * number of rating documents linked to this book
       */
    },

    /* ------------------- ENGAGEMENT METRICS ------------------- */

    totalViews: {
      type: Number,
      default: 0,
      min: 0,
      /**
       * Incremented whenever a user views the book details page
       */
    },

    totalPurchases: {
      type: Number,
      default: 0,
      min: 0,
      /**
       * Calculated from:
       * number of completed orders containing this book
       */
    },

    /* ------------------- TIME / DISCOVERY SIGNALS ------------------- */

    publishedYear: {
      type: Number,
      default: () => new Date().getFullYear(),
      /**
       * Can be overridden if the book is older
       * Useful for "new releases" & freshness ranking
       */
    },

    /* ------------------- OWNERSHIP ------------------- */

    user: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
      /**
       * Owner / uploader of the book
       */
    },
  },
  {
    timestamps: true, // createdAt + updatedAt
  }
);

/* ------------------- JSON TRANSFORMS ------------------- */

bookSchema.set("toJSON", { getters: true });
bookSchema.set("toObject", { getters: true });

const bookModel = model("Book", bookSchema);
export default bookModel;
