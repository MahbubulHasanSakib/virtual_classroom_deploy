const express=require('express');
const route=express.Router();
const Authmiddleware=require('../middlewares/guest');
const classListController=require('../controllers/classListController');
const upload=require('../middlewares/fileUpload');

route.get('/:id',Authmiddleware.isAuthenticated,classListController.classList)
route.get('/class/join_form',Authmiddleware.isAuthenticated,classListController.joinForm)
route.post('/createClass',Authmiddleware.isAuthenticated,classListController.createClass)
route.get('/:id/unenroll',Authmiddleware.isAuthenticated,classListController.unenroll)
route.get('/:id/delete',Authmiddleware.isAuthenticated,classListController.delete)
route.get('/profile/uploadPhoto',Authmiddleware.isAuthenticated,classListController.profile)
route.post('/update_profile',[Authmiddleware.isAuthenticated,upload.single('profile_pic')],classListController.update_profile)
route.get('/change_bg/:id',Authmiddleware.isAuthenticated,classListController.change_bg)
route.post('/update_classbg/:id',[Authmiddleware.isAuthenticated,upload.single('class_bg')],classListController.update_classBg)
module.exports=route;