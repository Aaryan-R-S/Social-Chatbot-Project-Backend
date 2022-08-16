const express = require('express');
const router = express.Router();
const Question = require('../models/Question');
const Admin = require('../models/Admin');
const fetchAdmin = require('../middleware/fetchUser');
const { body, validationResult } = require('express-validator');

// Fetch next question on the basis of last answered question. Also report if done.
// For initial fetch give uid 0
// If possible answer is empty then answer id -1

// ROUTE 1: Get basic question using: GET "/api/question/fetchNext"; No Login required
router.post('/fetchNext', [
        body('uniqueid', 'No Question ID provided').isLength({min:1}), 
        body('answerid', 'No Answer ID provided').isLength({min:1})
    ], async (req, res)=>{

    success = false;

    // In case of errors return bad request along with error messages
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // it is not working as express validator is doing it automatically so it is redundant
        return res.status(400).json({ success, errors: errors.array() });
    }
 
    try{
        let myNextQuestion = null, myCurrQuestion = null;
        // first question
        if(req.body.uniqueid=="0"){
            myNextQuestion = await Question.findOne({uniqueid:"1"}).select(["-nextquestions", "-suggestions", "-videos"]);
            success = true;
            let myCurrQuestionResults = {questionTxt:"", answers:[], suggestions: [], videos: []};
            return res.status(200).json({success, myNextQuestion, myCurrQuestionResults});
        }
        else{
            myCurrQuestion = await Question.findOne({uniqueid: req.body.uniqueid});
            if(myCurrQuestion==null){
                // restart
                myNextQuestion = await Question.findOne({uniqueid: "1"}).select(["-nextquestions", "-suggestions", "-videos"]);
                let myCurrQuestionResults = {questionTxt:"", answers:[], suggestions: [], videos: []};
                return res.status(400).json({success, errors: "Invalid uniqueid provided", myNextQuestion, myCurrQuestionResults})
            }
            if(myCurrQuestion.nextquestions.length==0 && (req.body.answerid!=-1 || myCurrQuestion.answers.length==0)){
                // all done
                myNextQuestion = await Question.findOne({uniqueid: req.body.uniqueid}).select(["-nextquestions", "-suggestions", "-videos"]);
            }
            else if(myCurrQuestion.nextquestions.length<=req.body.answerid){
                // invalid answer -- send same curr question again
                let myCurrQuestionResults = {questionTxt:"", answers:[], suggestions: [], videos: []};
                return res.status(400).json({success, errors: "Invalid answerid provided", myNextQuestion: myCurrQuestion, myCurrQuestionResults})
            }
            else if(req.body.answerid==-1 && myCurrQuestion.answers.length==0){
                myNextQuestion = await Question.findOne({uniqueid: myCurrQuestion.nextquestions[0]}).select(["-nextquestions", "-suggestions", "-videos"]);
            }
            else if(req.body.answerid==-1 && myCurrQuestion.answers.length>0){
                let myCurrQuestionResults = {questionTxt:"", answers:[], suggestions: [], videos: []};
                return res.status(400).json({success, errors: "Invalid answerid provided", myNextQuestion: myCurrQuestion, myCurrQuestionResults})
            }
            else if(myCurrQuestion.nextquestions[req.body.answerid]==null){
                // all done
                myNextQuestion = await Question.findOne({uniqueid: req.body.uniqueid}).select(["-nextquestions", "-suggestions", "-videos"]);
            }
            else{
                myNextQuestion = await Question.findOne({uniqueid: myCurrQuestion.nextquestions[req.body.answerid]}).select(["-nextquestions", "-suggestions", "-videos"]);
            }
            
        }
        let myCurrQuestionResults = {questionTxt:"", answers:[], suggestions: [], videos: []};
        if (myCurrQuestion){ 
            if(myCurrQuestion.suggestions.length>0){
                myCurrQuestionResults.suggestions = myCurrQuestion.suggestions[req.body.answerid];
            }
            if(myCurrQuestion.videos.length>0){
                myCurrQuestionResults.videos = myCurrQuestion.videos[req.body.answerid];
            }
            myCurrQuestionResults.questionTxt = myCurrQuestion.text;
            myCurrQuestionResults.answers = myCurrQuestion.answers;
        }
        success = true;
        res.status(200).json({success, myNextQuestion, myCurrQuestionResults});
    }
    catch(error){
        console.error(error.message);
        res.status(500).json({success, errors:"Internal server error"});
    }
})

// ROUTE 2: Add a new question using: Post "/api/question/addQuestion"; Admin Login required
router.post('/addQuestion', fetchAdmin, [
        body('uniqueid', 'No valid uniqueid provided').isLength({min:1}), 
        body('text', 'No valid text provided').isLength({min:1}), 
        body('answers', 'No valid answer array provided').isArray(),
        body('nextquestions', 'No valid next question array provided').isArray(),
        body('suggestions', 'No valid suggestion array provided').isArray(),
        body('videos', 'No valid video array provided').isArray()
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
        const {uniqueid, text, answers, nextquestions, suggestions, videos} = req.body;
        const myQuestionSave = await new Question({uniqueid, text, answers, nextquestions, suggestions, videos});
        await myQuestionSave.save();
        success = true;
        res.json({success, message: "Question added successfully"});
    }
    catch(error){
        console.error(error.message);
        res.status(500).json({success, errors:"Internal server error"});
    }
})

module.exports = router;