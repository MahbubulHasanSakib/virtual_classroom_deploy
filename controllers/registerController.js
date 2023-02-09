const User=require('../models/user')
const nodemailer = require("nodemailer");
const bcrypt=require('bcrypt');
const { validationResult } = require('express-validator');
const crypto = require('crypto');
module.exports.getRegister=(req,res)=>
{
    return res.render('register');
}



function sendMail(req,res,email,uniqueString)
{
    var Transport = nodemailer.createTransport({
        /*host: "localhost", // hostname
      secure: false, // use SSL
      port: 3000, */
        service: "Gmail",
        auth: {
            user:process.env.NODEMAILUSER,
            pass:process.env.NODEMAILPASS
        },
        tls: {
            rejectUnauthorized: false
        }
    });
    let mailOptions;
    const link="http://"+req.get('host')+"/register/verify/"+uniqueString;
    mailOptions={
        from:"Virtual Classroom "+process.env.NODEMAILUSER,
        to :email,
        subject : "Email Confirmation",
        text:"Thanks for registering,Please copy and paste the address below to verify your email."+link,
        html : "Hello,<br> Please Click on the link to verify your email.<br><a href="+link+">Click here to verify your account</a>"
    }
    console.log(mailOptions);
    Transport.sendMail(mailOptions, function(error,info){
     if(error){
            console.log(error);
        return res.end("error");
     }else{
            console.log("Message sent "+info.response);
         }
});

}


module.exports.postRegister=async(req,res)=>
{
    const {firstname,lastname,email,password}=req.body;
    if(!firstname || !lastname || !email || !password)
    {
        req.flash('error','All fields are required');
        return res.redirect('/register');
    }
    const errors=validationResult(req);
    if(!errors.isEmpty())
    {
        return res.render('register',{alerts:errors.array()});
    }
    const user=await User.findOne({email});
    if(user)
    {
       req.flash('error','This email is already registered');
       return res.redirect('/register');
    }
    else{
    const hashedPassword=await bcrypt.hash(password,10);
    const uniqueString=crypto.randomBytes(64).toString('hex');
    const isValid=false;
    const newuser=new User({
    firstname,
    lastname,
    email,
    password:hashedPassword,
    uniqueString,
    isValid
    });
     await newuser.save()
    .then(user=>{
        console.log(user);
        /*req.session.isAuth=true;
        req.session.user=user;
        console.log(req.session.user);*/
        sendMail(req,res,user.email,uniqueString);
        req.flash('info','Thanks for registering.Please check your email to verify your account.');
        return res.redirect('/');
    })
    .catch(err=>{console.log(err)});
}
}

module.exports.verifyEmail=async(req,res)=>
{
    console.log(req.params.uniqeStr);
    const user=await User.findOne({uniqueString:req.params.uniqeStr});
    if(user)
    {
       user.isValid=true;
       await user.save()
       .then(data=>{
           console.log("user is verified.Please login");
           req.flash('info','Congratulations! Your account is verified.Please login');
           res.redirect('/');
        })
       .catch(err=>{console.log(err)})
    }
    else
    {
        console.log('user not found');
    }
}