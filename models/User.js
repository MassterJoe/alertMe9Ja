const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    username: { type: String, unique: true, sparse: true },
    email: { type: String, unique: true, sparse: true }, // Optional for the AI Bot
    password: { type: String }, // AI Bot won't use this field
    gender: { type: String, enum: ["Male", "Female", "Other"], default: "Other" }, // Optional field
    profileImage: { data: Buffer, contentType: String }, // Store binary data for images
    coverPhoto: { data: Buffer, contentType: String },
    dob: { type: String }, // Consider using a `Date` type if needed for real users
    city: { type: String },
    country: { type: String },
    aboutMe: { type: String },
    friends: { type: Array, default: [] },
    pages: { type: Array, default: [] },
    notifications: { type: Array, default: [] },
    groups: { type: Array, default: [] },
    posts: { type: Array, default: [] },
    accessToken: { type: String },
    location: { type: Array, default: [] },
    isBot: { type: Boolean, default: false }, // Flag to indicate if the user is an AI Bot
});

module.exports = mongoose.model("User", UserSchema);

/*
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: String,
    username: String,
    email: String,
    password: String,
    gender: String,
    profileImage: { data: Buffer, contentType: String },
    coverPhoto: { data: Buffer, contentType: String },
     dob: { type: String },
    city: String,
    country: String,
    aboutMe: String,
    friends: Array,
    pages: Array,
    notifications: Array,
    groups: Array,
    posts: Array,
    accessToken: String,
    isBot: { type: Boolean, default: false }
});

module.exports = mongoose.model('User', UserSchema);
*/