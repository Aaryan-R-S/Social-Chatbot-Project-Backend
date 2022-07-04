const express = require('express');
const router = express.Router();
const Video = require('../models/Video');
const Admin = require('../models/Admin');
const fetchAdmin = require('../middleware/fetchUser');
const { body, validationResult } = require('express-validator');

// ROUTE 1: find videos by tag using: GET "/api/video/:tag"; No login required
router.get('/:tag', async (req, res)=>{
    success = false;
    try{
        let videos = await Video.find({tags: { $in: [req.params.tag] }}).select("-tags");
        success = true;
        res.status(200).json({success, videos});
    }
    catch(error){
        console.error(error.message);
        res.status(500).json({success, errors:"Internal server error"});
    }
});

// ROUTE 2: Add a new video using: Post "/api/video/addVideo"; Admin Login required
router.post('/addVideo', fetchAdmin, [
        body('link', 'No valid link provided').isLength({min:1}), 
        body('tags', 'No valid tag array provided').isArray({min:1})
    ], async (req, res)=>{

    // In case of errors return bad request along with error messages
    success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // it is not working as express validator is doing it automatically so it is redundant
        return res.status(400).json({ success, errors: errors.array() });
    }
    try{
        const userId = req.user.id;
        let user = await Admin.findById(userId).select("-password");
        if (!user){ return res.status(405).json({success, errors: "Access denied"});}
        const {link, tags} = req.body;
        const myVideoSave = await new Video({link, tags});
        await myVideoSave.save();
        success = true;
        res.json({success, message: "Video added successfully"});
    }
    catch(error){
        console.error(error.message);
        res.status(500).json({success, errors:"Internal server error"});
    }
})

module.exports = router;