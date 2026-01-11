import cloudinary from "../lib/cloudinary";
import bookModel from "../models/book.model";

export const createBook = async (req, res, next) => {
    try {

        const { title, subTitle, caption, rating, image, price } = req.params;

        if (!title || !subTitle || !caption || !rating || !price ) {
            const missing = [
                !title && "title",
                !subTitle && "subTitle",
                !caption && "caption",
                !rating && "rating",
                !price && "price",
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

        const existingBook = await bookModel.findOne({
            $or: [
                { title: title },
                { caption: caption }
            ]
        })

        if (existingBook) {
            if (existingBook.title === title) {
                const error = new Error("Title already exists");
                error.statusCode = 400
                return next(error)
            }

            if (existingBook.caption === caption) {
                const error = new Error("Caption already exists");
                error.statusCode = 400
                return next(error)
            }
        }

        // upload the image to cloudinary
        const uploadResponse = await cloudinary.uploader.upload(image)
        const imageUrl = uploadRespone.secure_url

        const book = bookModel.create({
            title,
            subTitle,
            caption,
            rating,
            image: imageUrl,
            price,
            user: req.user._id
        })

        await book.save()

        res.status(201).json({
            message: "Book created successfully",
            book
        })
    } catch(error){
        console.error("an error occured", error.message)
        return next(error)
    }
}

export const getBook = async (req, res) => {
    try {

    } catch (error) {
        console.error("an error occured", error.message)
        return next(error)
    }
}