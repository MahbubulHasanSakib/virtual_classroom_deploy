const mongoose=require('mongoose');
const Schema=mongoose.Schema;

const submissionSchema=new Schema({
    student_id:{
        type:String,
        required:true
    },
    student_name:{
           type:String,
           required:true
    },
    course_id:{
        type:String,
        required:true
    },
    resource_id:{
        type:String,
        required:true
    },
    files:[Object],
    submitTime:{
        type:String,
        required:true
    },
    grading_status:
        {
            type:String,
            required:true
        }

})

const Submission=new mongoose.model('submission',submissionSchema);
module.exports=Submission;