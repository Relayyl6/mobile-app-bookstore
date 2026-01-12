import { Schema, Types, model } from "mongoose"

const interactionSchema = new Schema({
    userId: {
        type: Types.ObjectId,
        ref: "User",
        required: true
    },
    bookId: {
        type: Types.ObjectId,
        ref: "Book",
        required: true
    },
    type: {
        type: String,
        enum: ['view', 'purchase', 'rating', 'favorite', 'cart'],
        required: true
    },
    rating: {
        type: Number,
        min: 1,
        max: 5
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
})

interactionSchema.index({ userId: 1, bookId: 1, type: 1 });

const interactionModel = model("Interaction", interactionSchema)

export default interactionModel