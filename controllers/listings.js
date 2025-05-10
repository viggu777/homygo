const Listing = require("../models/listing.js");


module.exports.index = async (req, res) => {
    const { filter, search } = req.query;
    let query = {};

    // Apply filter logic
    if (filter) {
        switch (filter) {
            case "trending":
                query.price = { $gt: 3000 };
                break;
            case "rooms":
                query.title = /room|house|apartment/i;
                break;
            case "iconic":
                query.location = /city|delhi|mumbai|hyderabad/i;
                break;
            case "mountains":
                query.title = /mountain|hill/i;
                break;
            case "castles":
                query.title = /castle|fort/i;
                break;
            case "pools":
                query.description = /pool/i;
                break;
            case "camping":
                query.description = /camp|tent/i;
                break;
            case "farms":
                query.title = /farm/i;
                break;
            case "arctic":
                query.location = /ice|arctic|snow/i;
                break;
        }
    }

    // Apply search logic
    if (search) {
        const regex = new RegExp(escapeRegex(search), "i");
        query.$or = [
            { title: regex },
            { description: regex },
            { location: regex }
        ];
    }

    const allListings = await Listing.find(query);
    res.render("listings/index", { allListings });
};

// Utility to escape special characters from the search input
function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}


module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate({ path: "reviews", populate: { path: "author", }, }).populate("owner");
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist");
        res.redirect("/listings");
    }
    res.render("listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res) => {
    let url = req.file.path;
    let filename = req.file.filename;
    console.log(url, "....", filename);

    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = { url, filename };
    await newListing.save();
    req.flash("success", "Successfully created a new listing!"); // ✅ Flash message set
    res.redirect("/listings"); // ✅ Redirect is required
};

module.exports.editListing = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist");
        res.redirect("/listings");
    }
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
    res.render("listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    if (typeof req.file !== "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = { url, filename };
        await listing.save();
    }
    req.flash("success", "Successfully Edited a listing!");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
    let id = req.params.id.trim();
    const deletedListing = await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
};
