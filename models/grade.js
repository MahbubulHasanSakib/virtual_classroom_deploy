const mongoose=require('mongoose');
const Schema=mongoose.Schema;

const gradeSchema=new Schema({
        class_id:{
            type:String,
            required:true
        },
        resource_id:{
            type:String,
            required:true
        },
        topic_name:{
            type:String,
            required:true
        },
        student_id:{
            type:String,
            required:true
        },
        student_name:{
            type:String,
            required:true
        },
        points:{
            type:String,
            required:true
        },
        grade:
        {
            type:String,
            required:true
        }
        
});

const Grade=new mongoose.model('grade',gradeSchema);
module.exports=Grade;