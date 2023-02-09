const mongoose=require('mongoose');
const Schema=mongoose.Schema;


const enrollSchema=new Schema({
     student_id:{
         type:String,
         required:true
     },
     student_name:
     {
        type:String,
        required:true
     },
     class_id:{
        type:String,
        required:true
     },
     class_name:{
        type:String,
        required:true
     },
     section:{
        type:String,
        required:true
     },
     teacher_id:{
      type:String,
      required:true
     },
     teacher_name:{
        type:String,
        required:true
     }
});

const Enrollment=new mongoose.model('enrolment',enrollSchema);
module.exports=Enrollment;