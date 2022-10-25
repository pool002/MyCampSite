const mongoose = require('mongoose');
const Review = require('./review');
const { Schema } = mongoose;

const imageSchema = new Schema({
    url:String,
    filename:String
});

imageSchema.virtual('thumbnail').get(function (){           //To display thumbnails while editing camp
    return this.url.replace('/upload','/upload/w_200');
});

const opts = {toJSON: { virtuals: true }};      //To use with MapBox

const CampgroundSchema = new Schema({
    title: String,
    images: [imageSchema],
    price: Number,
    description: String,
    location: String,
    geometry:{
        type:{
            type:String,
            enum:['Point'],
            required: true
        },
        coordinates:{
            type:[Number],
            required: true
        }
    },
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
},opts);


CampgroundSchema.virtual('properties.popUpMarkup').get(function (){
    return `
    <strong><a href="/campgrounds/${this._id}">${this.title}</a></strong>
    <p>${this.description.substring(0,20)}...</p>`
})

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