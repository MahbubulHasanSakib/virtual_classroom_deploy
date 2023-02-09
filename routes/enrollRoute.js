const express=require('express');
const route=express.Router();
const enrollController=require('../controllers/enrollController')
const Authmiddleware=require('../middlewares/guest');

route.post('/',enrollController.enroll);
module.exports=route;