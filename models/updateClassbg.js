const mongoose=require('mongoose');
const Schema=mongoose.Schema;

const updateClassbgSchema=new Schema({
  class_id:{
    type:String
  },
  pic_name:{
    type:String
  },
   pic_path:{
    type:String
   }


});

const updateClassBg=new mongoose.model('updateClassBg',updateClassbgSchema);
module.exports=updateClassBg;