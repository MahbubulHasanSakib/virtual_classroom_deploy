const Resource=require('../models/resources');
const Enroll=require('../models/enrolment');
const Grade=require('../models/grade');
const Submission=require('../models/submission');
const Class=require('../models/class');
const User = require('../models/user');
const nodemailer=require('nodemailer');
const path=require('path');
const Comment=require('../models/comment')
let user_type;

function sendMail(req,res,email,topic,classname,total_point,obtained_point)
{
    var Transport = nodemailer.createTransport({
        /*host: "localhost", // hostname
      secure: false, // use SSL
      port: 3000, */
        service: "Gmail",
        auth: {
            user:process.env.NODEMAILUSER,
            pass:process.env.NODEMAILPASS
        },
        tls: {
            rejectUnauthorized: false
        }
    });
    let mailOptions;

    const name=req.session.user.firstname+" "+req.session.user.lastname;
   
    mailOptions={
        from:name+'..Virtual Classroom'+process.env.NODEMAILUSER,
        to :email,
        subject :"Graded Work:"+"\""+topic+"\"",
        text:"Hi,"+`${name} graded  \"${topic}\" in ${classname}.Points: ${obtained_point}/${total_point}`,
        html :`
        <h3>Hi,</h3>
        <p>${name} graded \"${topic}\" in \"${classname}\"</p>
        <h4>Points: ${obtained_point}/${total_point}</h4>
        `
    }
    console.log(mailOptions);
    Transport.sendMail(mailOptions, function(error,info){
     if(error){
            console.log(error);
        return res.end("error");
     }else{
            console.log("Message sent "+info.response);
         }
});

}

module.exports.grade=async(req,res)=>
{
    user_type=req.params.type;
    if(user_type=='one')
    {
        const findClassenroll=await Enroll.findOne({student_id:req.session.user._id,class_id:req.params.id});
        if(!findClassenroll)
        return res.render('404page');
    }
    if(user_type=='all')
    {
        const user_id=req.session.user._id;
        const findClass=await Class.findOne({_id:req.params.id,teacher_id:user_id});
        console.log(findClass)
        if(!findClass)
        return res.render('404page');
    }
    if(user_type=='all')
    {
        /*const dueResources=[];
        const findResources=await Resource.find({course_id:req.params.id});
        findResources.forEach((resource)=>
        {
            if(resource.due!=='Invalid date')
            dueResources.push(resource)
        });
        console.log(dueResources);
        const enrolledSt=await Enroll.find({class_id:req.params.id});
        console.log(enrolledSt);
        return res.render("teacher/grade",{courseId:req.params.id,dueResources,enrolledSt});*/
        const allGrades=await Grade.find({class_id:req.params.id}).sort({student_name:1});
        console.log(allGrades);
        return res.render("teacher/grade",{user_type,courseId:req.params.id,allGrades});
    }
    else if(user_type=="one")
    {
        const myGrades=await Grade.find({student_id:req.session.user._id,class_id:req.params.id});
        console.log(myGrades);
        return res.render("student/grade",{user_type,courseId:req.params.id,myGrades});
    }
    else return res.render('404page');
    
}
module.exports.gradeWork=async(req,res)=>{
   const {grade}=req.body;
   if(grade)
   {
       const isGraded=await Grade.findOne({class_id:req.params.id,resource_id:req.params.id1,student_id:req.params.sid});
       console.log(isGraded)
       if(isGraded)
       {
           console.log("already graded");
           return res.redirect('/courseDetails/'+req.params.id+'/submissions/'+req.params.id1+'/all');
       }
       const fClass=await Class.findById(req.params.id);
       const newgrade=new Grade({
        class_id:req.params.id,
        resource_id:req.params.id1,
        topic_name:req.params.topic,
        student_id:req.params.sid,
        student_name:req.params.sname,
        points:req.params.points,
        grade
       })
       console.log(newgrade);
       await newgrade.save().
       then(async(grd)=>{
           const findSub=await Submission.findOneAndUpdate({student_id:req.params.sid,course_id:req.params.id,resource_id:req.params.id1},{grading_status:'graded'}, {
            new: true
          });
          console.log(findSub);
           console.log(req.params.id+'  '+req.params.id1+'  '+req.params.topic);
           const findStudent=await User.findById(req.params.sid);
           const findResource=await Resource.findById(req.params.id1);
           sendMail(req,res,findStudent.email,grd.topic_name,fClass.classname,findResource.points,grd.grade);
           return res.redirect('/grade/checkAssignment'+'/'+findSub._id+'/'+req.params.sid);
       })
       .catch(err=>{console.log(err)});
   }
   else 
   {
       console.log("empty");
       return res.redirect('/courseDetails/'+req.params.id+'/submissions/'+req.params.id1);
   }
}
module.exports.checkWork=async(req,res)=>
{
    const findSubmission= await Submission.findOne({_id:req.params.subid,student_id:req.params.sid});
    console.log(findSubmission);
    let findResource;
    if(findSubmission)
    findResource=await Resource.findById(findSubmission.resource_id);
    const fileExt=[];
    let findgrade;
    if(findSubmission)
    findgrade=await Grade.findOne({resource_id:findSubmission.resource_id,student_id:req.params.sid})
    if(findSubmission)
    findComments=await Comment.find({submission_id:findSubmission._id});
    for(let i=0;i<findSubmission.files.length;i++)
    {
        fileExt.push(path.extname(findSubmission.files[i].filepath));
    }
    let dueStatus;
    if(findSubmission){
        if(Date.parse(findSubmission.submitTime)>Date.parse(findResource.due))
        dueStatus='Turned in late';
        else dueStatus='Turned in';
        }
    res.render('checkWork',{dueStatus,findComments,findgrade,findSubmission,findResource,fileExt});
}