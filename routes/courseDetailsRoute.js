const express=require('express');
const route=express.Router();
const courseDetailsController=require('../controllers/courseDetailsController')
const Authmiddleware=require('../middlewares/guest');
const upload=require('../middlewares/fileUpload');

route.get('/:id/:type',Authmiddleware.isAuthenticated,courseDetailsController.courseDetails)
route.post('/addResource/:id',[Authmiddleware.isAuthenticated,upload.array('files')],courseDetailsController.uploadResource)
route.post('/:id/submit/:id1',[Authmiddleware.isAuthenticated,upload.array('submitFiles')],courseDetailsController.submit)
route.get('/:id/submissions/:id1/:type',Authmiddleware.isAuthenticated,courseDetailsController.seeAllSubmissions);
route.get('/:cid/unsubmit/:rid',Authmiddleware.isAuthenticated,courseDetailsController.unsubmit);
route.get('/:cid/delete/:rid',Authmiddleware.isAuthenticated,courseDetailsController.deleteResource);
route.get('/:cid/edit/:rid',Authmiddleware.isAuthenticated,courseDetailsController.editResource);
route.post('/:cid/update/:rid',[Authmiddleware.isAuthenticated,upload.array('files')],courseDetailsController.updateResource);
route.post('/:cid/submissions/:rid/comment/:id/:type',Authmiddleware.isAuthenticated,courseDetailsController.writeComment);
route.post('/:cid/check_submissions/:rid/comment/:id/:sid',Authmiddleware.isAuthenticated,courseDetailsController.writeComment_from_teacher);
route.get('/:id/showAssignment/:rscid',Authmiddleware.isAuthenticated,courseDetailsController.showAssignment);
route.get('/:id/showAssignmentandSubmissions/:rscid',Authmiddleware.isAuthenticated,courseDetailsController.showAssignmentandSubmissions);

module.exports=route;