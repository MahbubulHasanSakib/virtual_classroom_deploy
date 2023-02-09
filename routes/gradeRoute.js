const express=require('express');
const route=express.Router();
const gradeController=require('../controllers/gradeControllers')
const Authmiddleware=require('../middlewares/guest');

route.get('/:id/:type',Authmiddleware.isAuthenticated,gradeController.grade);
route.post('/:id/graded/:id1/:topic/:sid/:sname/:points',Authmiddleware.isAuthenticated,gradeController.gradeWork);
route.get('/checkAssignment/:subid/:sid',Authmiddleware.isAuthenticated,gradeController.checkWork)
module.exports=route;