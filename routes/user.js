const express = require("express");
const wrapAsync = require("../utils/wrapAsync");
const router = express.Router();
const User = require("../models/user");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware");

const userController = require("../controllers/users.js");

// Signup Routes
router.route("/signup")
    .get(userController.renderSignUpForm) // GET: Render signup form
    .post(wrapAsync(userController.signUp)); // POST: Handle signup

// Login Routes
router.route("/login")
    .get(userController.renderLoginForm) // GET: Render login form
    .post(saveRedirectUrl, passport.authenticate("local", { failureFlash: true, failureRedirect: "/login" }), userController.login); // POST: Handle login

// Logout Route
router.get("/logout", userController.logOut);

module.exports = router;