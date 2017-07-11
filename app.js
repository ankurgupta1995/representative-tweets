var express = require("express"),
    bodyParser = require("body-parser"),
    expressSanitizer = require("express-sanitizer"),
    passport = require("passport"),
    Strategy = require("passport-twitter").Strategy,
    session = require("express-session"),
    morgan = require("morgan"),
    cookieParser = require("cookie-parser"),
    app = express();

//App config
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(expressSanitizer());
app.use(morgan('combined'));
app.use(cookieParser());
app.use(session({
    secret: 'Auth for representative tweets',
    resave: true,
    saveUninitialized: true
}));

passport.use(new Strategy({
    consumerKey: process.env.CONSUMER_KEY,
    consumerSecret: process.env.CONSUMER_SECRET,
    callbackURL: "https://representative-tweets-ankurgupta67.c9users.io/login/twitter/return"
}, function(token, tokenSecret, profile, cb) {
    return cb(null, profile);
}));


passport.serializeUser(function(user, cb) {
    cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
    cb(null, obj);
});

app.use(passport.initialize());
app.use(passport.session());

app.get("/", function(req, res) {
    res.render("index");
});


app.listen(process.env.PORT, process.env.IP, function() {
    console.log("Server started!");
});
