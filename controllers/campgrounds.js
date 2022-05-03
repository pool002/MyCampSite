const Campground = require('../models/campground');


module.exports.showAllCamps = async (req, res) => {     //Camps Index Page 
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
};

module.exports.showNewCampForm = (req, res) => {        //Renders the new Camp Form
    res.render('campgrounds/new');
};

module.exports.makeNewCamp = async (req, res, next) => {        //Post req makes a new camp
    const campground = new Campground(req.body.campground);
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

module.exports.editCamp = async (req, res) => {     //Put req edits the camp details
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    req.flash('success', 'Successfully updated campground!');
    res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.deleteCamp = async (req, res) => {       //Delete Camp
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted campground');
    res.redirect('/campgrounds');
};