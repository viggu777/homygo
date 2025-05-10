const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Review = require("./reviews.js");


// const listingSchema = new Schema({
//     title: {
//         type: String,
//         required: true,
//     },
//     description: String,
//     image: {
//         type: String,
//         default: "https://www.google.com/url?sa=i&url=https%3A%2F%2Fpixabay.com%2Fphotos%2Ftree-sunset-clouds-sky-silhouette-736885%2F&psig=AOvVaw33RJXRWdIf0bO5KKSwkrQK&ust=1739599413515000&source=images&cd=vfe&opi=89978449&ved=0CBQQjRxqFwoTCLCn8vq-wosDFQAAAAAdAAAAABAE",
//         set: (v) => v == "" ? "https://www.google.com/url?sa=i&url=https%3A%2F%2Fpixabay.com%2Fphotos%2Ftree-sunset-clouds-sky-silhouette-736885%2F&psig=AOvVaw33RJXRWdIf0bO5KKSwkrQK&ust=1739599413515000&source=images&cd=vfe&opi=89978449&ved=0CBQQjRxqFwoTCLCn8vq-wosDFQAAAAAdAAAAABAE" : v,
//     },
//     price: Number,
//     location: String,
//     country: String,
// });
const listingSchema = new Schema({
    title: { type: String, required: true },
    description: String,
    image: {
        filename: String,  // Store filename separately
        url: {
            type: String,
            default: "https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fHRyYXZlbHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60",
            set: (v) => (!v || v.trim() === "")
                ? "https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fHRyYXZlbHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60"
                : v
        }
    },
    price: Number,
    location: String,
    country: String,
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review"
        },
    ],
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
});




listingSchema.post("findOneAndDelete", async (listing) => {
    if (listing) {
        await Review.deleteMany({ _id: { $in: listing.reviews } });
    }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;