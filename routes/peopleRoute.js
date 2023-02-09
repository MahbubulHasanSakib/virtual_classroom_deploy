const express=require('express');
const route=express.Router();
const peopleController=require('../controllers/peopleController')
const Authmiddleware=require('../middlewares/guest');

route.get('/:id/:type',Authmiddleware.isAuthenticated,peopleController.people)
module.exports=route;