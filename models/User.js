const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: String,
    username: String,
    email: String,
    password: String,
    gender: String,
    profileImage: String,
    coverPhoto: String,
     profileImage: { data: Buffer, contentType: String },
    coverPhoto: { data: Buffer, contentType: String },
    dob: Date,
    city: String,
    country: String,
    aboutMe: String,
    friends: Array,
    pages: Array,
    notifications: Array,
    groups: Array,
    posts: Array,
    accessToken: String // Add this field
});

module.exports = mongoose.model('User', UserSchema);
