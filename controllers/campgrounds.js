const Campground = require('../models/campground');
const {cloudinary} = require('../cloudinary/index');                     //To delete files from cloud when edited
const mbxGeocode = require('@mapbox/mapbox-sdk/services/geocoding');     //Map
const mbxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocode({ accessToken: mbxToken });


module.exports.showAllCamps = async (req, res) => {     //Camps Index Page 
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
};

module.exports.showNewCampForm = (req, res) => {        //Renders the new Camp Form
    res.render('campgrounds/new');
};

module.exports.makeNewCamp = async (req, res, next) => {        //Post req makes a new camp
    const geoData = await geocoder.forwardGeocode({             //Saving the location 
        query: req.body.campground.location,
        limit: 1
    }).send();
    const campground = new Campground(req.body.campground);
    campground.geometry = (geoData.body.features[0].geometry);  //Taking the geometry value {type,coordinates} and saving that to particular camp
    campground.images = req.files.map(f=>({ url:f.path,filename:f.filename })); //Saving the url and filename in camp's images array
    campground.author = req.user._id;
    await campground.save();
    req.flash('success', 'Successfully made a new campground!');
    res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.showCampDetails = async (req, res,) => {         //Camp Details
    const campground = await Campground.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    res.render('campgrounds/show', { campground });
};

module.exports.editCampForm = async (req, res) => {     //Renders the camp edit form
    const { id } = req.params;
    const campground = await Campground.findById(id);
    res.render('campgrounds/edit', { campground });
};

module.exports.editCamp = async (req, res) => {     //Put req, edits the camp details
    const { id } = req.params;
    const geoData = await geocoder.forwardGeocode({     //Taking new location and saving in camp
        query: req.body.campground.location,
        limit: 1
    }).send();
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    campground.geometry = (geoData.body.features[0].geometry);  //Taking the geometry value {type,coordinates} and saving that to particular camp
    const img = req.files.map(f=>({ url:f.path,filename:f.filename })); //Taking the url and filename into an array from req.files
    campground.images.push(...img);
    campground.save();
    if(req.body.deleteImages){      //If user wants to delete images while editing
        for(let files of req.body.deleteImages){
            await cloudinary.uploader.destroy(files);
        }
        await campground.updateOne({$pull: {images: {filename: { $in:req.body.deleteImages }}}})
    }
    req.flash('success', 'Successfully updated campground!');
    res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.deleteCamp = async (req, res) => {       //Delete Camp
    const { id } = req.params;
    const camp = await Campground.findByIdAndDelete(id);
    const imgs = camp.images.map((img)=>{               //Saving the deleted camp's images to delete them from cloudinary
        return img.filename
    })
    if(imgs){
        for(let files of imgs){
            await cloudinary.uploader.destroy(files);
        }
    }
    req.flash('success', 'Successfully deleted campground');
    res.redirect('/campgrounds');
};