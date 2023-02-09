const mongoose=require('mongoose');
const Schema=mongoose.Schema;

const classSchema=new Schema({
   teacher_id:{
       type:String,
       required:true
   },
   teacher_name:{
    type:String,
    required:true
    },
   classname:{
    type:String,
    required:true
    },
    section:{
        type:String,
        required:true
    },
    subject:{
        type:String,
        required:true
    },
    class_code:{
        type:String,
        required:true,
        unique:true
    }
});

const Class=new mongoose.model('class',classSchema);
module.exports=Class;