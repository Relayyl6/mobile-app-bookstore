import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: [true, "username already exists"]
    },
    email: {
        type: String,
        required: true,
        unique: [true, "email already in use"]
    },
    password: {
        type: String,
        minLength: [
            6, "Password length must exceed 6 characters"
        ],
        required: true,
        unique: true
    },
    profileImage: {
        type: String,
        default: ""
    },
    preferredGenres: {
      type: [String],
      default: [],
      index: true
    },
    favoriteAuthors: {
      type: [String],
      default: [],
      index: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    deletedAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
})

// hash password before saving user to db
userSchema.pre("save", async function () {
    if (!this.isModified("password")) return next()

    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt)
})

//compare password
userSchema.methods.comparePassword = async function (userPassword) {
    return await bcrypt.compare(userPassword, this.password);
}

const userModel = mongoose.model('User', userSchema);

export default userModel