const mongoose = require('mongoose');
const Campground = require('../models/campground');


mongoose.connect('mongodb://localhost:27017/camp', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const sample = array => array[Math.floor(Math.random() * array.length)];

const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            author: '6274addcba5b7a3d9083aa08',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            geometry:{
                type:'Point',
                coordinates:[
                    cities[random1000].longitude,
                    cities[random1000].latitude
                ]
            },
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam dolores vero perferendis laudantium, consequuntur voluptatibus nulla architecto, sit soluta esse iure sed labore ipsam a cum nihil atque molestiae deserunt!',
            price,
            images:[
                {
                url:'https://res.cloudinary.com/dtfz6vdx1/image/upload/v1651586515/Camp/akwddjwad8obkylijtuf.jpg',
                filename:'1'
                }
        ]
        });
        await camp.save();
    }
}

seedDB().then(() => {       //Closing the connection from mongoose
    mongoose.connection.close();
});