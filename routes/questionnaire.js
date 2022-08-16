const express = require('express');
const router = express.Router();
const Questionnaire = require('../models/Questionnaire');
const User = require('../models/User');
const Admin = require('../models/Admin');
const fetchUser = require('../middleware/fetchUser');
const {sendAppointmentMail} = require('../utils/sendAppointmentMail');
const {sendSuggestionsMail} = require('../utils/sendSuggestionsMail');

// ROUTE 1: Get all questionnaires using: GET "/api/questionnaire/fetchQuestionnaires"; Login required
router.get('/fetchQuestionnaires', fetchUser, async (req, res)=>{
    success = false;
    try{
        const myQuestionnaires = await Questionnaire.find({user: req.user.id}).select("-user");
        success = true;
        res.status(200).json({success, myQuestionnaires});
    }
    catch(error){
        console.error(error.message);
        res.status(500).json({success, errors:"Internal server error"});
    }
})

// ROUTE 2: Add a new questionnaire using: Post "/api/questionnaire/addQuestionnaire"; Login required
router.post('/addQuestionnaire', fetchUser, async (req, res)=>{
    // In case of errors return bad request along with error messages
    success = false;
    try{
        const {questionanswers} = req.body;
        const myQuestionnaireSave = await new Questionnaire({
            questionanswers, user: req.user.id
        });
        await myQuestionnaireSave.save();
        success = true;
        res.status(200).json({success, message:"Questionnaire added successfully", questionnaireId: myQuestionnaireSave.id});
    }
    catch(error){
        console.error(error.message);
        res.status(500).json({success, errors:"Internal server error"});
    }
})

// ROUTE 3: Delete an existing questionnaire using: Post "/api/questionnaire/deleteQuestionnaire"; Login required
router.delete('/deleteQuestionnaire/:id', fetchUser, async (req, res)=>{
    success = false;
    try{
        let myQuestionnaire = await Questionnaire.findById(req.params.id);
        if(!myQuestionnaire){ return res.status(404).json({success, errors:"Questionnaire not found"})}
        if(myQuestionnaire.user.toString()!==req.user.id){
            return res.status(401).json({success, errors:"Access Denied"});
        }

        myQuestionnaire = await Questionnaire.findByIdAndDelete(req.params.id);
        success = true;
        res.status(200).json({success, message:"Questionnaire deleted successfully"});
    }
    catch(error){
        console.error(error.message);
        res.status(500).json({success, errors:"Internal server error"});
    }
})

// ROUTE 4: Get all questionnaires (at admin level) using: GET "/api/questionnaire/fetchQuestionnairesAdmin"; Login required
router.get('/fetchQuestionnairesAdmin', fetchUser, async (req, res)=>{
    success = false;
    try{
        const userId = req.user.id;
        let user = await Admin.findById(userId).select("-password");
        if (!user){ return res.status(401).json({success, errors: "Access denied"});}
        const allQuestionnaires = await Questionnaire.find({});
        success = true;
        res.status(200).json({success, allQuestionnaires});
    }
    catch(error){
        console.error(error.message);
        res.status(500).json({success, errors:"Internal server error"});
    }
})

// ROUTE 5: Take an appointment with pychologist using: POST "/api/questionnaire/takeAppointment"; Login required
router.post('/takeAppointment/:id', fetchUser, async (req, res)=>{
    success = false;
    try{
        const userId = req.user.id;
        let user = await User.findById(userId).select(["-password", "-questionnaires"]);

        let myQuestionnaire = await Questionnaire.findById(req.params.id);
        if(!myQuestionnaire){ return res.status(404).json({success, errors:"Questionnaire not found"})}
        if(myQuestionnaire.user.toString()!==req.user.id){
            return res.status(401).json({success, errors:"Access Denied"});
        }
        if(myQuestionnaire.appointmenttaken===true){
            return res.status(405).json({success, errors:"Appointment has already been taken"});
        }
        myQuestionnaire = await Questionnaire.findByIdAndUpdate({ "_id": req.params.id }, { $set: { appointmenttaken: true } });
        await myQuestionnaire.save();
        sendAppointmentMail(user, req.body.questionanswers);
        success = true;
        res.status(200).json({success, message:"Appointment taken successfully"});
    }
    catch(error){
        console.error(error.message);
        res.status(500).json({success, errors:"Internal server error"});
    }
})

// ROUTE 6: Send suggestion mail: POST "/api/questionnaire/sendSuggestionsMail"; Login required
router.post('/sendSuggestionsMail', fetchUser, async (req, res)=>{
    success = false;
    try{
        const userId = req.user.id;
        let user = await User.findById(userId).select(["-password", "-questionnaires"]);
        sendSuggestionsMail(user, req.body.suggestions, req.body.videos);
        success = true;
        res.status(200).json({success, message:"Suggestions and videos mailed successfully"});
    }
    catch(error){
        console.error(error.message);
        res.status(500).json({success, errors:"Internal server error"});
    }
})

module.exports = router;