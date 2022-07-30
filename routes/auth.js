const express = require('express');
const router = express.Router();
const User = require('../models/User');
const fetchUser = require('../middleware/fetchUser');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;

// ROUTE 1: create a user using: POST "/api/auth/addUser"; No login required
router.post('/addUser', [
        body('name', 'Enter a valid name of minimum length 3').isLength({min:3}), 
        body('email', 'Enter a valid email id').isEmail(),
        body('password', 'Enter a valid password of minimum length 5').isLength({min:5})
    ], async (req, res)=>{

    success = false;
     
    // In case of errors return bad request along with error messages
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
    // it is not working as express validator is doing it automatically so it is redundant
      return res.status(400).json({ success, errors: errors.array() });
    }

    try{
        // Check with the user with this email exist already
        let user = await User.findOne({email: req.body.email});
        if (user){ return res.status(400).json({ success, errors: "User already exists"});}
        
        const salt = await bcrypt.genSalt(10);
        const secPwd = await bcrypt.hash(req.body.password, salt);
        // create a new user
        user = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: secPwd,
        })
        const data = {
            user:{
                id: user.id
            }
        }
        const authToken = jwt.sign(data, JWT_SECRET);
        success = true;
        res.status(200).json({success, authToken});

    }
    catch(error){
        console.error(error.message);
        res.status(500).json({success, errors:"Internal server error"});
    }
})

// ROUTE 2: authenticate a user using: POST "/api/auth/login"; No login required
router.post('/login', [
        body('email', 'Enter a valid email id').isEmail(),
        body('password', 'Enter a valid password').isLength({min:1})
    ], async (req, res)=>{

    // In case of errors return bad request along with error messages
    success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
    // it is not working as express validator is doing it automatically so it is redundant
    return res.status(400).json({ success, errors: errors.array() });
    }

    const {email, password} = req.body;

    try{
        // Check with the user with this email exist already
        let user = await User.findOne({email});
        if (!user){ return res.status(400).json({success, errors: "Invalid credentials"});}
        
        const passwordCompare = await bcrypt.compare(password, user.password);

        if(!passwordCompare){
            return res.status(400).json({success, errors: "Invalid credentials"});
        }

        const data = {
            user:{
                id: user.id
            }
        }
        const authToken = jwt.sign(data, JWT_SECRET);
        success = true;
        res.status(200).json({success, authToken});

    }
    catch(error){
        console.error(error.message);
        res.status(500).json({success, errors:"Internal server error"});
    }
})

// ROUTE 3: Get logged in user details: POST "/api/auth/userDetails"; Login required
router.post('/userDetails', fetchUser, async (req, res)=>{
    success = false;
    try{
        const userId = req.user.id;
        let user = await User.findById(userId).select(["-password", "-questionnaires"]);
        if (!user){ return res.status(400).json({success, errors: "User not found"});}
        success = true;
        res.status(200).json({success, user});
    }
    catch(error){
        console.error(error.message);
        res.status(500).json({success, errors:"Internal server error"});
    }
})

// ROUTE 4: delete a user using: POST "/api/auth/deleteUser"; Login required
router.post('/deleteUser', fetchUser, async (req, res)=>{
    success = false;
    try{
        const userId = req.user.id;

        let user = await User.findById(userId);
        if(!user){ return res.status(400).json({success, errors:"User not found"})}

        user = await User.findByIdAndDelete(userId);
        success = true;
        res.status(200).json({success, message:"User successfully deleted"});
    }
    catch(error){
        console.error(error.message);
        res.status(500).json({success, errors:"Internal server error"});
    }
})

// ROUTE 5: check authentication of a user using: GET "/api/auth/checkLogin"; Auth token required
router.get('/checkLogin', fetchUser, async (req, res)=>{
    success = true;
    res.status(200).json({success});
})

module.exports = router;