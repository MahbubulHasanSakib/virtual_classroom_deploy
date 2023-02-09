const express=require('express');
const route=express.Router();
const contactController=require('../controllers/contactController')
route.post('/',contactController.contact);
route.get('/all',contactController.allcontacts);
module.exports=route