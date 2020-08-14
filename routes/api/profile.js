const express =require('express');
const router =express.Router();
const request = require('request');
const config = require('config');
const auth =require('../../middleware/auth')
const {check,validationResult} = require('express-validator');
const User = require('../../models/User');
const Profile =require('../../models/Profile')
const Post =require('../../models/Post');

    // @route  GET api/profile/me
    // @desc   Get User profile
    // @access Public

router.get('/me',auth,async (req,res)=>{
    try{
        const profile=await Profile.findOne({user:req.user.id}).populate('user',['name','avatar']);
        if(!profile){
            return res.status(400).json({errors:[{msg:"There is no profile for this User"}]});
        }
        res.json(profile);
    }catch(err){
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

    // @route  POST api/profile
    // @desc   Create Or Update Profile
    // @access Public

router.post('/',
    [
        auth,
        [
            check('status','Status is Required').not().isEmpty(),
            check('skills','Skills is Required').not().isEmpty(),
        ]
    ],
    async (req,res) => {
        const errors= validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({errors:errors.array()});
        }
        const {
            company,
            website,
            location,
            bio,
            status,
            githubusername,
            skills,
            youtube,
            facebook,
            twitter,
            instagram,
            linkedin
        }= req.body;

        //Bild Profile Object
        const profileFields = {};
        
        profileFields.user=req.user.id;

        if(company) profileFields.company=company;
        if(website) profileFields.website=website;
        if(location) profileFields.location=location;
        if(bio) profileFields.bio=bio;
        if(status) profileFields.status=status;
        if(githubusername) profileFields.githubusername=githubusername;
        if(skills){
            profileFields.skills=skills.split(',').map(skill=>skill.trim());
        }
        //Build Social Object
        profileFields.social = {};
        if(youtube) profileFields.social.youtube=youtube;
        if(twitter ) profileFields.social.twitter=twitter;
        if(facebook) profileFields.social.facebook=facebook;
        if(instagram) profileFields.social.instagram=instagram;
        if(linkedin) profileFields.social.linkedin = linkedin;

        try{
            let profile =await Profile.findOne({user:req.user.id});
            if(profile){
                profile= await Profile.findOneAndUpdate(
                    {user:req.user.id},
                    {$set:profileFields},
                    {new:true}
                    );
                return res.json(profile);    
            }
            profile=new Profile(profileFields);
            await profile.save();
            res.json(profile);
        }catch(err){
            console.error(err.message);
            res.status(500).send('Server Error');
        }
       //res.status(500).send('ok');
    }
);

    // @route  GET api/profile/
    // @desc   Get All profiles
    // @access Public

    router.get('/', async (req,res) => {
        try{
            let profiles = await Profile.find().populate('user',['name','avatar']);
            res.json(profiles);
        }catch(err){
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    });

    // @route  GET api/profile/user/:user_id
    // @desc   Get User profile
    // @access Public

    router.get('/user/:user_id',async (req,res) => {
        try{
            let profile = await Profile.findOne({user:req.params.user_id}).populate('user',['name','avatar']);
            if(!profile){
               return res.status(400).json({msg:'There is no profile for this user'});
            }
            res.json(profile);
        }catch(err){
            console.error(err.message);
            if(err.kind == 'ObjectId'){
                return res.status(400).json({msg:'There is no profile for this user'});
            }
            res.status(500).send('Server Error');
        }
    })

    // @route  DELETE api/profile/
    // @desc   DELETE Profile & User
    // @access Public
    router.delete('/',auth,async (req,res) => {
        try{
            await Post.deleteMany({user:req.user.id});
            await Profile.findOneAndRemove({user:req.user.id});
            await User.findOneAndRemove({_id:req.user.id});
            res.json({msg:'User has been Deleted Succesfully'});
        }catch(err){
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    })

    // @route  PUT api/profile/experience
    // @desc   Add Experience to profile
    // @access Public

    router.put('/experience',
    [
        auth,
        [
            check('title','Title is required').not().isEmpty(),
            check('company','Company is required').not().isEmpty(),
            check('from','From Date is required').not().isEmpty()   
        ]
    ] , async (req,res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({errors:errors.array()});
        }
        const {
            title,
            company,
            location,
            from,
            to,
            current,
            description
        } =req.body;

        const newExp ={
            title,
            company,
            location,
            from,
            to,
            current,
            description
        }
        try{
            let profile =await Profile.findOne({user:req.user.id});
            await profile.experience.unshift(newExp);
            await profile.save();
            res.json(profile);
        }catch(err){
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    });

    // @route  DELETE api/profile/experience
    // @desc   Delete Experience from profile
    // @access Public

    router.delete('/experience/:exp_id',auth,async (req,res) =>{
        try{
            profile = await Profile.findOne({user:req.user.id});
            //Get remove index
            const removeIndex = profile.experience.map(item => item._id).indexOf(req.params.exp_id);
            profile.experience.splice(removeIndex,1);
            await profile.save();
            res.json(profile);
        }catch(err){
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    })

    // @route  PUT api/profile/education
    // @desc   Add Education to profile
    // @access Public

    router.put('/education',
    [
        auth,
        [
            check('school','School is required').not().isEmpty(),
            check('degree','Degree is required').not().isEmpty(),
            check('fieldofstudy','Field Of Study is required').not().isEmpty(),
            check('from','From Date is required').not().isEmpty()   
        ]
    ] , async (req,res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({errors:errors.array()});
        }
        const {
            school,
            degree,
            fieldofstudy,
            from,
            to,
            current,
            description
        } =req.body;

        const newEdu ={
            school,
            degree,
            fieldofstudy,
            from,
            to,
            current,
            description
        }
        try{
            let profile =await Profile.findOne({user:req.user.id});
            await profile.education.unshift(newEdu);
            await profile.save();
            res.json(profile);
        }catch(err){
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    });

    // @route  DELETE api/profile/education
    // @desc   Delete Education from profile
    // @access Public

    router.delete('/education/:edu_id',auth,async (req,res) =>{
        try{
            profile = await Profile.findOne({user:req.user.id});
            //Get remove index
            const removeIndex = profile.education.map(item => item._id).indexOf(req.params.exp_id);
            profile.education.splice(removeIndex,1);
            await profile.save();
            res.json(profile);
        }catch(err){
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    })

    // @route  GET api/profile/github/:username
    // @desc   Get users repos from  github 
    // @access Public
    router.get('/github/:username',async (req,res) => {
        try{
            const options = {
                uri:`https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc&client_id=${config.get('githubClientId')}&client_secret=${config.get('githubClientSecret')}`,
                method:'GET',
                headers:{'user-agent':'Nodejs'}
            }
                await request(options,(error,response,body)=>{
                    if(error) console.error(error)
                    if(response.statusCode !== 200){
                       return res.status(404).json('No Github Profile Found')
                    }
                    res.json(JSON.parse(body));
                })
        }catch(err){
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    })
module.exports =router;