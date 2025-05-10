if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}




const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");



const listingRout = require("./routes/listing.js");
const reviewRout = require("./routes/review.js");
const userRout = require("./routes/user.js");


const dbUrl = process.env.ATLASDB_URL;



async function main() {
    await mongoose.connect(dbUrl);
}

main()
    .then(() => {
        console.log("db connected");
    })
    .catch((err) => {
        console.log(err);
    });

// app.get('/', (req, res) => {
//     res.send("Root is listening");
// });

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret: process.env.SECRET,
    },
});

store.on("error", function (e) {
    console.log("Session Store Error", e);
});


const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 1000 * 60 * 60 * 24 * 7,
        httpOnly: true,
    },
};

app.use(session(sessionOptions)); // ✅ Session must come before flash
app.use(flash()); // ✅ Flash middleware should be after session

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


// Middleware to make flash messages available in all views
app.use((req, res, next) => {
    res.locals.success = req.flash("success"); // ✅ Flash messages stored in res.locals
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

app.get("/demouser", async (req, res) => {
    let fakeUser = new User({
        email: "student@gmail.com",
        username: "delta-student"
    });
    let registeredUser = await User.register(fakeUser, "helloworld");
    res.send(registeredUser);
});

// Now define routes after middleware
app.use("/listings", listingRout);
app.use("/listings/:id/reviews", reviewRout);
app.use("/", userRout);






app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page Not Found!!"));
});

app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong" } = err;
    res.status(statusCode).render("error.ejs", { err });
});


app.listen(8080, () => {
    console.log("server is listening to port 8080");
});


