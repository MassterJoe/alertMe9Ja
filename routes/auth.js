const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const accessTokenSecret = process.env.JWT_SECRET;
const upload = require('./../middlewares/uploadMiddleware'); 
const fs = require('fs');
const path = require('path');
const moment = require("moment");
const { render } = require('ejs');
var mainURL = "http://localhost:3000"


/* Sign Up */
router.get("/signup", (req, res) => {
    res.render('signup');
});

router.post("/signup", upload.none(), async (req, res) => {
    const { name, username, email, password, gender, dob, city, country, aboutMe } = req.body;

    
    try {
        const existingUser = await User.findOne({ 
            $or: [{ "email": email }, { "username": username }] 
        });

        if (existingUser) {
            return res.json({
                "status": "error",
                "message": "Email or username already exists."
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            name,
            username,
            email,
            password: hashedPassword,
            gender,
            profileImage: "",
            coverPhoto: "",
            dob,
            city,
            country,
            aboutMe,
            friends: [],
            pages: [],
            notifications: [],
            groups: [],
            posts: []
        });

        await newUser.save();
        res.json({
            "status": "success",
            "message": "Signed up successfully, you can log in now."
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ "status": "error", "message": "Internal server error." });
    }
}); 

/* Login */

router.get("/login", (req, res) => {
    res.render('login');
});


router.post("/login", upload.none(), async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email: email });

        if (!user) {
            return res.json({
                status: "error",
                message: "Email does not exist"
            });
        }

        const isVerify = await bcrypt.compare(password, user.password);
        
        if (isVerify) {
            const accessToken = jwt.sign({ email: email, id: user._id }, accessTokenSecret);
   
            res.cookie("accessToken", accessToken, {
                httpOnly: true,  // More secure as it prevents client-side access
                secure: true,    // Ensures the cookie is only sent over HTTPS (good for production)
                maxAge: 24 * 60 * 60 * 1000 // Expire after 1 day
            });
            
            // Update the user with the new access token
            user.accessToken = accessToken;
            await user.save(); // Save the updated user
            
            return res.json({
                status: "success",
                message: "Login successfully",
                accessToken: accessToken,
                profileImage: user.profileImage
            });
        } else {
            return res.json({
                status: "error",
                message: "Incorrect password"
            });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: "error", message: "Internal server error." });
    }
});



/*
uddateProfile
*/
router.get("/updateProfile", async (req, res) => {
    const accessToken = req.cookies.accessToken;
    try {
        const user = await User.findOne({ accessToken });
        
        if (user) {
            // Check if profileImage and coverPhoto are defined and then convert to base64
            const profileImage = user.profileImage && user.profileImage.data
                ? `data:${user.profileImage.contentType};base64,${user.profileImage.data.toString('base64')}`
                : null;
            const coverPhoto = user.coverPhoto && user.coverPhoto.data
                ? `data:${user.coverPhoto.contentType};base64,${user.coverPhoto.data.toString('base64')}`
                : null;


        
            res.render('updateProfile', {
                profileImage: profileImage,
                coverPhoto: coverPhoto,
                name: user.name,
                username: user.username,
                email: user.email,
                dob: user.dob,
                city: user.city,
                country: user.country,
                aboutMe: user.aboutMe
            
            });
        } else {
            res.redirect("/login");
        }
    } catch (error) {
        console.error("Error in /updateProfile route:", error);
        res.status(500).json({ status: "error", message: "Internal server error." });
    }
});

/* 
POSt
Update profile

*/

router.post("/updateProfile", upload.none(), async (req, res) => {
    const accessToken = req.cookies.accessToken;
    const { name, dob, city, country, aboutMe } = req.body;

    try {
        const user = await User.findOne({ accessToken });

        if (!user) {
            return res.json({
                status: "error",
                message: "User has been logged out. Please login again",
            });
        }

        // Validate and ensure dob is in DD/MM/YYYY format
        let formattedDob = null;
        if (dob) {
            const momentDob = moment(dob, "DD/MM/YYYY", true);
            if (!momentDob.isValid()) {
                return res.status(400).json({
                    status: "error",
                    message: "Invalid date format. Use DD/MM/YYYY.",
                });
            }
            formattedDob = momentDob.format("DD/MM/YYYY"); 
        }

        // Update fields
        user.set({
            name,
            dob: formattedDob, // Save formatted DOB
            city,
            country,
            aboutMe,
        });

        await user.save();

        res.json({
            status: "success",
            message: "Profile has been updated",
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status: "error",
            message: "Internal server error.",
        });
    }
});



router.post("/getUser", async (req, res) => {
    const authHeader = req.headers.authorization;
    const accessToken = authHeader && authHeader.split(" ")[1];

    if (!accessToken) {
        return res.json({
            status: "error",
            message: "User has been logged out. Please login again"
        });
    }

    try {
        // Verify the JWT
        const decodedToken = jwt.verify(accessToken, accessTokenSecret);
        
        const user = await User.findById(decodedToken.id);

        if (!user) {
            return res.json({
                status: "error",
                message: "User has been logged out. Please login again"
            });
        }

        res.json({
            status: "success",
            message: "Record has been fetched.",
            data: user
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: "error", message: "Internal server error." });
    }
});



// Route to upload cover photo
router.post("/uploadCoverPhoto", upload.single('coverPhoto'), async (req, res) => {
    const accessToken = req.body.accessToken;  // Access token should be in req.body

    try {
        const user = await User.findOne({ accessToken });

        if (!user) {
            return res.json({
                status: "error",
                message: "User has been logged out. Please login again."
            });
        }

        user.coverPhoto = {
            data: req.file.buffer,
            contentType: req.file.mimetype
        };  
        await user.save();
    
      const base64Image = `data:${user.coverPhoto.contentType};base64,${user.coverPhoto.data.toString('base64')}`;

        // Respond with the new cover photo URL
        res.json({
            status: "success",
            message: "Cover photo has been updated",
            data: base64Image
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: "error", message: "Internal server error." });
    }
});

//upload profile image

router.post('/uploadProfileImage', upload.single('profileImage'), async (req, res) => {
    const accessToken = req.body.accessToken;

    if (!req.file) {
        return res.status(400).json({ status: 'error', message: 'No file uploaded' });
    }

    try {
        const user = await User.findOne({ accessToken });

        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found or logged out. Please log in again.'
            });
        }

        
     user.profileImage = {
    data: req.file.buffer,
    contentType: req.file.mimetype
};  
  await user.save();

  const base64Image = `data:${user.profileImage.contentType};base64,${user.profileImage.data.toString('base64')}`;

        res.json({
            status: 'success',
            message: 'Profile image updated successfully',
            data: base64Image
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Internal server error.' });
    }
});

router.get("/", async (req, res) => {
    const accessToken = req.cookies.accessToken;

    try {
        const user = await User.findOne({ accessToken });
        if (!user) {
            return res.redirect("/login");
        }

        const profileImage = user.profileImage && user.profileImage.data
            ? `data:${user.profileImage.contentType};base64,${user.profileImage.data.toString('base64')}`
            : null;

        const coverPhoto = user.coverPhoto && user.coverPhoto.data
            ? `data:${user.coverPhoto.contentType};base64,${user.coverPhoto.data.toString('base64')}`
            : null;


        res.render('index', {
            profileImage: profileImage,
            coverPhoto: coverPhoto
        });
    } catch (error) {
        console.error("Error in / route:", error);
        res.status(500).json({ status: "error", message: "Internal server error." });
    }
});




router.post("/addPost", upload.fields([{ name: 'image' }, { name: 'video' }]), async (req, res) => {
    const { accessToken, caption, type } = req.body;
    const createdAt = new Date().getTime();

    try {
        const user = await User.findOne({ accessToken });
        if (!user) {
            return res.status(401).json({ status: "error", message: "User not found or logged out. Please log in again." });
        }

        let image = null;
        let video = null;

        if (req.files['image']) {
            const imgFile = req.files['image'][0];
            image = {
                data: imgFile.buffer.toString('base64'),
                contentType: imgFile.mimetype
            };
        }

        if (req.files['video']) {
            const vidFile = req.files['video'][0];
            video = {
                data: vidFile.buffer.toString('base64'),
                contentType: vidFile.mimetype
            };
        }

        const newPost = {
            caption,
            type,
            createdAt,
            image,
            video,
            likers: [],
            comments: [],
            shares: [],
            user: {
                _id: user._id,
                name: user.name,
                profileImage: user.profileImage
            }
        };

        // Ensure that MongoDB generates a unique _id for the post
        user.posts.push(newPost);

        // Save the user document with the new post
        await user.save();

        res.json({
            status: "success",
            message: "Post added successfully!",
            post: newPost
        });
    } catch (error) {
        console.error("Error in /addPost route:", error);
        res.status(500).json({ status: "error", message: "Internal server error." });
    }
});


/*
POST
 getNewsfeed
*/
router.post("/getNewsfeed", async (req, res) => {
    const token = req.headers.authorization && req.headers.authorization.split(" ")[1]; // Extract token from "Bearer <token>"

    try {
        if (!token) {
            return res.status(401).json({ status: "error", message: "No access token provided" });
        }

        // Validate the token (if using JWT, decode it here or find user using token)
        const user = await User.findOne({ accessToken: token });
        if (!user) {
            return res.status(401).json({ status: "error", message: "User not found or logged out. Please log in again." });
        }

        // Retrieve the user's posts sorted by creation date
        const posts = user.posts
            .sort((a, b) => b.createdAt - a.createdAt)
            .slice(0, 5);  // Limit to 5 latest posts

        res.json({
            status: "success",
            message: "Record has been fetched",
            data: posts
        });

    } catch (error) {
        console.error("Error in /getNewsfeed route:", error);
        res.status(500).json({ status: "error", message: "Internal server error." });
    }
});

router.post("/toggleLikePost", async (req, res) => {
    const id = req.headers["post-id"];
    const accessToken = req.headers.authorization && req.headers.authorization.split(" ")[1];

    console.log(id);
    try {
        // Find the user by access token
        const user = await User.findOne({ accessToken });
        if (!user) {
            return res.status(401).json({ status: "error", message: "User not found or logged out. Please log in again." });
        }

        console.log(user.posts)
        
        // Locate the post in the user's own posts array by `id`
        const post = user.posts.find(p => p._id === id);
        if (!post) {
            return res.status(404).json({ status: "error", message: "Post not found." });
        }

        // Check if the user has already liked the post
        const hasLiked = post.likers.some(likerId => likerId.toString() === user._id.toString());

        if (hasLiked) {
            // If the user has liked the post, remove their like
            post.likers = post.likers.filter(likerId => likerId.toString() !== user._id.toString());
            await user.save();
            return res.json({ status: "unliked", message: "Post unliked successfully." });
        } else {
            // If the user hasn't liked the post, add their like
            post.likers.push(user._id);

            // Create a new notification for the like
            const notification = {
                type: "photo-liked",
                content: `${user.name} has liked your post.`,
                profileImage: user.profileImage, // Assuming `profileImage` is a field on the User model
                createdAt: new Date()
            };
            user.notifications.push(notification);

            await user.save();
            return res.json({ status: "success", message: "Post liked successfully." });
        }
    } catch (error) {
        console.error("Error in /toggleLikePost route:", error);
        return res.status(500).json({ status: "error", message: "Internal server error." });
    }
});

//nNb
router.get("/logout", function(req, res){
    res.redirect("/login");
});


module.exports = router;