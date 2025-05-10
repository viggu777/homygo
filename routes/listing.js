const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingController = require("../controllers/listings.js");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");

const upload = multer({ storage });

// Index Route
router.route("/")
    .get(wrapAsync(listingController.index)) // GET: Show all listings
    .post(isLoggedIn, upload.single("listing[image]"), validateListing, wrapAsync(listingController.createListing)); // POST: Create a new listing

// New Route
router.get("/new", isLoggedIn, listingController.renderNewForm);

// Show Route
router.route("/:id")
    .get(wrapAsync(listingController.showListing)) // GET: Show individual listing
    .put(isLoggedIn, isOwner, upload.single("listing[image]"), validateListing, wrapAsync(listingController.updateListing)) // PUT: Update a listing
    .delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing)); // DELETE: Delete a listing

// Edit Route
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.editListing));

module.exports = router;