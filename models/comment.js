const mongoose=require('mongoose');
const Schema=mongoose.Schema;

const commentSchema=new Schema({
    submission_id:{
        type:String
    },
    user:
    {
        type:String
    },
     comment:{
         type:String
     },
     current_time:{
         type:String
     }
   
});

const Comment=new mongoose.model('comment',commentSchema);

module.exports=Comment;