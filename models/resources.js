const mongoose=require('mongoose');
const Schema=mongoose.Schema;

const resourceSchema=new Schema({
     teacher_id:
     {
         type:String
     },
     course_id:
     {
         type:String
     },
     topic_name:
     {
         type:String
     },
     instruction:
     {
         type:String
     },
     points:
     {
         type:String
     },
     current_time:{
             type:String
     },
     due:
     {
        type:String
     },
     files:[Object]
     
})

const Resource=new mongoose.model('resource',resourceSchema);
module.exports=Resource;
