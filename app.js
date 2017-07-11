var express = require("express"),
    bodyParser = require("body-parser"),
    expressSanitizer = require("express-sanitizer"),
    app = express();

//App config
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(expressSanitizer());


app.get("/", function(req, res) {
    res.render("index");
});


app.listen(process.env.PORT, process.env.IP, function() {
    console.log("Server started!");
});