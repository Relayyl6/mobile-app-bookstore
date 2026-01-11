import { Schema, Types, model } from 'mongoose'

const bookSchema = new  Schema({
    title: {
        type: String,
        required: true,
        unique: [
            true,
            "Title already in use"
        ]
    },
    subTitle: {
        type: String,
        required: false,
        unique: [
            true,
            "Subtitle already in use"
        ]
    },
    caption: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    image: {
        type: String,
        required: true
    },
    price: {
        type: Types.Decimal128,
        required: true,
        // Getter: convert Decimal128 to a formatted string when accessed
        get: (value: Types.Decimal128): string => {
            if (value) {
              // value.toString() gets the full decimal string
              // The `+` prefix converts it to a number for methods like .toFixed()
                return (+value.toString()).toFixed(2); 
            }
            return "";
        },
        // Setter (optional): ensure input string is correctly cast to Decimal128 if needed
        set: (value: string | number): Types.Decimal128 => {
          // You can implement custom logic here if you need to enforce format on save
            return new Types.Decimal128(value.toString());
    },
  },
  user : {
    type : Types.ObjectId,
    ref : 'User',
    required : true
  }
}, {
    timestamps: true
})

bookSchema.set('toJSON', { getters: true });
bookSchema.set('toObject', { getters: true });

const bookModel = model('Book', bookSchema);

export default bookModel;