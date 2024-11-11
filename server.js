require('dotenv').config();
var express = require('express');
var bcrypt = require('bcrypt');
const cookieParser = require("cookie-parser");
const connectDb = require('./config/db'); 
const authRoutes = require('./routes/auth'); 


var jwt = require("jsonwebtoken");
var accessTokenSecret = process.env.SECRET;



var app = express();
var http = require("http").createServer(app);


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


app.use("/public", express.static(__dirname + "/public"));
app.set("view engine", "ejs");
app.use('/', authRoutes);


var socketIO = require("socket.io")(http);
var socketID = "";


socketIO.on("connection", function(socket){
    console.log("User connected", socket.id);
    socketID = socket.id;
});



http.listen(3000, function(){
    console.log("Server started.");
    connectDb(); 
});
