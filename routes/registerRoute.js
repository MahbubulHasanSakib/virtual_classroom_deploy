const express=require('express');
const route=express.Router();
const {check,validationResult}=require('express-validator');
const Authmiddleware=require('../middlewares/guest')
const registerController=require('../controllers/registerController');


route.get('/',Authmiddleware.islogged,registerController.getRegister);
route.get('/verify/:uniqeStr',Authmiddleware.islogged,registerController.verifyEmail)
route.post('/',[
    check('firstname')
    .trim(),
    check('lastname')
    .trim(),
    check('email','Email is invalid')
    .isEmail()
    .normalizeEmail(),
    check('password','Password must be six charaters long')
    .isLength({min:6})

],registerController.postRegister)

module.exports=route;