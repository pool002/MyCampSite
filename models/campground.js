const mongoose = require('mongoose');
const Review = require('./review');
const { Schema } = mongoose;

const CampgroundSchema = new Schema({
    title: String,
    image: String,
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
});

CampgroundSchema.post('findOneAndDelete', async function (thisCamp) {  //Mongoose middleware to delete all reviews when a camp is deleted
    if (thisCamp) {
        await Review.deleteMany({
            _id: {
                $in: thisCamp.reviews
            }
        })
    }
});

module.exports = mongoose.model('Campground', CampgroundSchema);