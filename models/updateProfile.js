const mongoose=require('mongoose');
const Schema=mongoose.Schema;

const updateProfile=new Schema({
  user_id:{
    type:String
  },
  pic_name:{
    type:String
},
pic_path:{
    type:String
}


});

const updateProf=new mongoose.model('updateProfile',updateProfile);
module.exports=updateProf;