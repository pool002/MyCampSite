const express = require('express');
const router = express.Router();
const wrapper = require('../utils/wrapper');
const campController = require('../controllers/campgrounds');      //All campground functionalities.
const { isLoggedIn, isAuthor, validateCampground, isCampPresent } = require('../middlewares');  //All middlewares to run when needed.

const {storage} = require('../cloudinary/index')    //For adding photos
const multer = require('multer');
const upload = multer({storage})


router.route('/')
    .get(wrapper(campController.showAllCamps))
    .post(isLoggedIn, upload.array('image'), validateCampground, wrapper(campController.makeNewCamp)); //LogIn and Valid Camp Data required to make new Camp.

router.get('/new', isLoggedIn, campController.showNewCampForm);


router.route('/:id')
    .get(isCampPresent, wrapper(campController.showCampDetails))
    .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, wrapper(campController.editCamp))
    .delete(isLoggedIn, isAuthor, wrapper(campController.deleteCamp));  //Only author of a camp can delete it.


router.get('/:id/edit', isLoggedIn, isAuthor, isCampPresent, wrapper(campController.editCampForm));


module.exports = router;