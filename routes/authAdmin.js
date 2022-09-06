const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');
const fetchAdmin = require('../middleware/fetchUser');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;

// ROUTE 1: create an admin using: POST "/api/authAdmin/addAdmin"; Login required
router.post('/addAdmin', [
        body('name', 'Enter a valid name of minimum length 3').isLength({min:3}), 
        body('email', 'Enter a valid email id').isEmail(),
        body('password', 'Enter a valid password of minimum length 5').isLength({min:5})
    ], fetchAdmin, async (req, res)=>{

    success = false;
    
    // In case of errors return bad request along with error messages
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
    // it is not working as express validator is doing it automatically so it is redundant
    return res.status(400).json({ success, errors: errors.array() });
    }

    try{
        const userId = req.user.id;

        let user = await Admin.findById(userId);
        if(!user){ return res.status(401).json({success, errors:"Not an admin"})}

        // Check with the user with this email exist already
        user = await Admin.findOne({email: req.body.email});
        if (user){ return res.status(400).json({ success, errors: "Admin already exists"});}
        
        const salt = await bcrypt.genSalt(10);
        const secPwd = await bcrypt.hash(req.body.password, salt);
        // create a new user
        user = await Admin.create({
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

// ROUTE 2: authenticate an admin using: POST "/api/authAdmin/login"; No login required
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
        let user = await Admin.findOne({email});
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

// ROUTE 3: Get logged in admin details: POST "/api/authAdmin/adminDetails"; Login required
router.post('/adminDetails', fetchAdmin, async (req, res)=>{
    success = false;
    try{
        const userId = req.user.id;
        let user = await Admin.findById(userId).select("-password");
        if (!user){ return res.status(400).json({success, errors: "Admin not found"});}
        success = true;
        res.status(200).json({success, user});
    }
    catch(error){
        console.error(error.message);
        res.status(500).json({success, errors:"Internal server error"});
    }
})

// ROUTE 4: delete an admin using: POST "/api/authAdmin/deleteAdmin"; Login required
router.post('/deleteAdmin', fetchAdmin, async (req, res)=>{
    success = false;
    try{
        const userId = req.user.id;

        let user = await Admin.findById(userId);
        if(!user){ return res.status(400).json({success, errors:"Admin not found"})}

        user = await Admin.findByIdAndDelete(userId);
        success = true;
        res.status(200).json({success, message:"Admin successfully deleted"});
    }
    catch(error){
        console.error(error.message);
        res.status(500).json({success, errors:"Internal server error"});
    }
})

// ROUTE 5: check authentication of admin using: GET "/api/authAdmin/checkLogin"; Auth token required
router.get('/checkLogin', fetchAdmin, async (req, res)=>{
    success = false;
    const token = req.header('auth-token');
    if(!token){
        return res.status(401).json({success, errors:"Missing auth token"})
    }
    try{
        const data = jwt.verify(token, JWT_SECRET);
        const userId = data.user.id;

        let user = await Admin.findById(userId);
        if(!user){ return res.status(400).json({success, errors:"Admin not found"})}

        success = true;
        res.status(200).json({success, user});
    }
    catch(error){
        console.error(error.message);
        res.status(500).json({success, errors:"Internal server error"});
    }
})

module.exports = router;