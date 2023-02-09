const express=require('express');
const route=express.Router();
const {check,validationResult}=require('express-validator');
const Authmiddleware=require('../middlewares/guest')
const loginController=require('../controllers/loginController');
const User=require('../models/user')


route.get('/',Authmiddleware.islogged,loginController.getLogin);
route.post('/',[
    check('email','Email is invalid')
    .isEmail()
    .normalizeEmail()
    .custom(async(value,{req})=>{
        const user=await User.findOne({email:value});
        if(user){
            if(!user.isValid)
            {
                throw new Error('Your account has not been verified.Please check email to verify');
            }
            return true;
            }
    }),
    check('password','Password must be six charaters long')
    .isLength({min:6})

],loginController.postLogin)
module.exports=route;