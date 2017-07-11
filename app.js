var express = require("express");
var app = express();

app.get("/", function(req, res) {
    res.send("IN PROGRESS");
});


app.listen(process.env.PORT, process.env.IP, function() {
    console.log("Server started!");
});