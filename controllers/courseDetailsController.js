const moment=require('moment');
const path=require('path');
let user_type;
const Class=require('../models/class');
const Resource=require('../models/resources');
const Submission=require('../models/submission');
const Grade=require('../models/grade');
const updateClassBg = require('../models/updateClassbg');
const Comment=require('../models/comment')
const Enroll=require('../models/enrolment');
const User=require('../models/user')
const nodemailer=require('nodemailer');
const Profile=require('../models/updateProfile');
function sendMail(req,res,emails,due,topic,classname)
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
    let Text;
    if(due=="Invalid date") 
    Text="New announcement";
    else Text="New assignment";
    mailOptions={
        from:name+'..Virtual Classroom'+process.env.NODEMAILUSER,
        to :emails,
        subject :Text+":"+"\""+topic+"\"",
        text:"Hi,"+`${name} posted a ${Text} in ${classname}`,
        html :`
        <h3>Hi,</h3>
        <p>${name} posted a ${Text} in ${classname}</p>
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
module.exports.courseDetails=async(req,res)=>
{
    user_type=req.params.type;
    let findClassenroll;
    if(user_type=='enrolled')
    {
       findClassenroll=await Enroll.findOne({student_id:req.session.user._id,class_id:req.params.id});
        if(!findClassenroll)
        return res.render('404page');
    }
    if(user_type=='created')
    {
        const user_id=req.session.user._id;
        const findClass=await Class.findOne({_id:req.params.id,teacher_id:user_id});
        if(!findClass)
        return res.render('404page');
    }
    const findClassDetails=await Class.findById(req.params.id);
    console.log(findClassDetails);
    const allResources=await Resource.find({course_id:req.params.id});
    for(let i=0;i<allResources.length;i++)
    {
        for(let j=0;j<allResources[i].files.length;j++)
        {
            allResources[i].files[j].filepath=allResources[i].files[j].filepath.replace(/\\/g, "/");
        }
    }
    let submissionStatus=[];
    if(user_type=='enrolled'){
    for(let i=0;i<allResources.length;i++){
           if(allResources[i].due!=='Invalid date')
           {
             const isSubmitted=await Submission.findOne({student_id:req.session.user._id,course_id:allResources[i].course_id,resource_id:allResources[i]._id});
             if(isSubmitted)
             submissionStatus.push('submitted');
             else submissionStatus.push('missing')
           }
           else{
               submissionStatus.push('missing');
            }
    }
 }
 const class_bg=await updateClassBg.findOne({class_id:req.params.id});
    if(user_type=='enrolled'){
        console.log(submissionStatus);
    const findTeacher=await Profile.findOne({user_id:findClassenroll.teacher_id});
    return res.render("student/courseDetails",{user_type,courseId:req.params.id,allResources,submissionStatus,findClassDetails,class_bg,findClassenroll,findTeacher});
    }
    else if(user_type=='created'){
        res.render("teacher/courseDetails",{user_type,courseId:req.params.id,allResources,findClassDetails,class_bg});
    }
    else return res.render('404page')
}

module.exports.uploadResource=async(req,res)=>
{
    const filesArray=[];
    const files=req.files;
    files.forEach((singleFile)=>
    {
        const file={
            filename:singleFile.originalname,
            filepath:singleFile.path
        }
        filesArray.push(file);
    })
    const dueDate=moment(req.body.due).format('DD MMM YYYY, hh:mm a');
    const enrolledUsers=await Enroll.find({class_id:req.params.id});
    const fClass=await Class.findById(req.params.id);
    const user_mails=[];
    for(let i=0;i<enrolledUsers.length;i++)
    {
      const user=await User.findOne({_id:enrolledUsers[i].student_id});
      user_mails.push(user.email);
    }
    const currentTime=moment(new Date().toISOString()).format('DD MMM YYYY, hh:mm a');
    const resource=new Resource({
        teacher_id:req.session.user._id,
        course_id:req.params.id,
        topic_name:req.body.topicname,
        instruction:req.body.instruction,
        points:req.body.points,
        current_time:currentTime,
        due:dueDate,
        files:filesArray
    });
    await resource.save()
    .then( (rsc)=>{
        console.log(rsc);
        sendMail(req,res,user_mails,rsc.due,rsc.topic_name,fClass.classname);
       req.flash('success','New resource is added');
       return res.redirect("/courseDetails/"+req.params.id+'/created');
    })
    .catch((err)=>{console.log(err)})
    
}

module.exports.submit=async(req,res)=>
{
    console.log(req.files);
    console.log(req.params.id);
    console.log(req.params.id1);
    const filesArray=[];
    const files=req.files;
    if(files.length>0){
    files.forEach((singleFile)=>
    {
        const file={
            filename:singleFile.originalname,
            filepath:singleFile.path
        }
        filesArray.push(file);
    })
    const currentTime=moment(new Date().toISOString()).format('DD MMM YYYY, hh:mm a');
    const st_name=req.session.user.firstname+" "+req.session.user.lastname;
    const submit=new Submission({
        student_id:req.session.user._id,
        student_name:st_name,
        course_id:req.params.id,
        resource_id:req.params.id1,
        files:filesArray,
        submitTime:currentTime,
        grading_status:'not graded'
    });
    await submit.save()
    .then(sbmt=>{
        console.log(sbmt);
        return res.redirect('/courseDetails/'+req.params.id+'/showAssignment/'+req.params.id1);
    })
    .catch(err=>{console.log(err)});
}
else
{
    req.flash('error','No file is attached');
    return res.redirect('/courseDetails/'+req.params.id+'/showAssignment/'+req.params.id1);
}
    
}

module.exports.seeAllSubmissions=async(req,res)=>
{

    if(req.params.type=="all"){
        const allSubmissions=await Submission.find({course_id:req.params.id,resource_id:req.params.id1});
        for(let i=0;i<allSubmissions.length;i++)
        {
            for(let j=0;j<allSubmissions[i].files.length;j++)
            {
                allSubmissions[i].files[j].filepath=allSubmissions[i].files[j].filepath.replace(/\\/g, "/");
            }
        }
        const findResource=await Resource.findOne({_id:req.params.id1,course_id:req.params.id});
        if(allSubmissions.length>0){
        const comments=[];
        for(let i=0;i<allSubmissions.length;i++)
        {
            const findComments=await Comment.find({submission_id:allSubmissions[i]._id});
            const allcom=[];
            for(let j=0;j<findComments.length;j++){
            allcom.push(findComments[j]);
            }
            comments.push(allcom);
        }
        console.log(comments);
        const dueStatus=[];
        allSubmissions.forEach((sub)=>
        {
           if(Date.parse(sub.submitTime)>Date.parse(findResource.due))
           dueStatus.push('Turned in late');
           else dueStatus.push('Turned in');
          });
          return  res.render('submissions',{Type:"all",allSubmissions,comments,Topic:findResource.topic_name,user_type:'Teacher',courseId:req.params.id,resourceId:req.params.id1,Points:findResource.points,dueStatus});
    }
     else return  res.render('submissions',{allSubmissions,Topic:findResource.topic_name,user_type:'Teacher',courseId:req.params.id,resourceId:req.params.id1,Points:findResource.points});
    }
    else if(req.params.type=="one")
    {
        const allSubmissions=await Submission.find({student_id:req.session.user._id,course_id:req.params.id,resource_id:req.params.id1});
        const findResource=await Resource.findOne({_id:req.params.id1,course_id:req.params.id});
        
        if(allSubmissions.length>0){
        const findComments=await Comment.find({submission_id:allSubmissions[0]._id});
        for(let i=0;i<allSubmissions[0].files.length;i++)
        {
            allSubmissions[0].files[i].filepath=allSubmissions[0].files[i].filepath.replace(/\\/g, "/");
        }
        console.log(allSubmissions[0].submitTime);
        console.log(findResource.due);
        const dueStatus=[];
        if(Date.parse(allSubmissions[0].submitTime)>Date.parse(findResource.due))
            dueStatus.push('Turned in late');
        else  dueStatus.push('Turned in');
        return  res.render('submissions',{Type:"one",allSubmissions,findComments,Topic:findResource.topic_name,user_type:'Student',courseId:req.params.id,resourceId:req.params.id1,dueStatus});
        }
        else return  res.render('submissions',{allSubmissions,Topic:findResource.topic_name,user_type:'Student',courseId:req.params.id,resourceId:req.params.id1});
        

    }
    else return res.render('404page');
}

module.exports.unsubmit=async(req,res)=>
{
    const submittedFiles=await Submission.findOne({student_id:req.session.user._id,course_id:req.params.cid,resource_id:req.params.rid});
    if(submittedFiles)
    {
        console.log(submittedFiles);
        const  unsubmitted=await Submission.findOneAndDelete({student_id:req.session.user._id,course_id:req.params.cid,resource_id:req.params.rid});
        console.log(unsubmitted);
        const  remove_grade=await Grade.findOneAndDelete({student_id:req.session.user._id,class_id:req.params.cid,resource_id:req.params.rid});
        console.log(remove_grade);
        return res.redirect('/courseDetails/'+req.params.cid+'/showAssignment/'+req.params.rid);
    }
    else{
        console.log('already unsubmitted');
        res.send("You have unsubmitted it already");
    }

}

module.exports.deleteResource=async(req,res)=>
{
    const  deleteRes=await Resource.findByIdAndRemove(req.params.rid);
    console.log(deleteRes);
    return res.redirect('/courseDetails/'+req.params.cid+'/created');
}

module.exports.editResource=async(req,res)=>
{
    const selectResource= await Resource.findById(req.params.rid);
    console.log(selectResource.due);
    const selectResource_due=moment(selectResource.due).format('YYYY-MM-DDTHH:mm');
    res.render('teacher/editResource',{selectResource,selectResource_due});
}
module.exports.updateResource=async(req,res)=>
{
    console.log(req.body);
    console.log(req.files);
    const filesArray=[];
    const files=req.files;
    files.forEach((singleFile)=>
    {
        const file={
            filename:singleFile.originalname,
            filepath:singleFile.path
        }
        filesArray.push(file);
    });
    if(filesArray.length==0)
    {
        const selectResource= await Resource.findById(req.params.rid);
        selectResource.files.forEach((singleFile)=>
        {
            const file={
                filename:singleFile.filename,
                filepath:singleFile.filepath
            }
            filesArray.push(file);
        });
    }
    const dueDate=moment(req.body.due).format('DD MMM YYYY, hh:mm a');
    const Nresource=new Resource({
        _id:Object(req.params.rid),
        files:filesArray,
        teacher_id:req.session.user._id,
        course_id:req.params.cid,
        topic_name:req.body.topicname,
        instruction:req.body.instruction,
        points:req.body.points,
        due:dueDate
    });

    const updatedResource=await Resource.findByIdAndUpdate(req.params.rid,Nresource,{new:true});
    console.log(updatedResource);
    const updateGrades=await Grade.updateMany({class_id:req.params.cid,resource_id:req.params.rid},{topic_name:req.body.topicname});
    console.log(updateGrades);
    res.redirect('/courseDetails/'+req.params.cid+'/created');

}

module.exports.writeComment=(req,res)=>
{
    console.log(req.body);
    const currentTime=moment(new Date().toISOString()).format('DD MMM YYYY, hh:mm a');
    const st_name=req.session.user.firstname+" "+req.session.user.lastname;
    const newComment=new Comment({
        submission_id:req.params.id,
        user:st_name,
        comment:req.body.comment,
        current_time:currentTime
    });
    newComment.save()
    .then(com=>{
        console.log(com);
        res.redirect('/courseDetails/'+req.params.cid+'/showAssignment/'+req.params.rid);
    })
    .catch(err=>console.log(err));
}

module.exports.writeComment_from_teacher=(req,res)=>
{
    console.log(req.body);
    const currentTime=moment(new Date().toISOString()).format('DD MMM YYYY, hh:mm a');
    const st_name=req.session.user.firstname+" "+req.session.user.lastname;
    const newComment=new Comment({
        submission_id:req.params.id,
        user:st_name,
        comment:req.body.comment,
        current_time:currentTime
    });
    newComment.save()
    .then(com=>{
        console.log(com);
        return res.redirect('/grade/checkAssignment'+'/'+req.params.id+'/'+req.params.sid);
    })
    .catch(err=>console.log(err));
}

module.exports.showAssignment=async(req,res)=>
{
    console.log(req.params.rscid);
    const findResource=await Resource.findById(req.params.rscid);
    const findClass=await Class.findById(req.params.id);
    console.log(findResource);
    const findSubmission=await Submission.findOne({student_id:req.session.user._id,course_id:req.params.id,resource_id:req.params.rscid});
    console.log(findSubmission);
    let findComments;
    let dueStatus;
    if(findSubmission){
    if(Date.parse(findSubmission.submitTime)>Date.parse(findResource.due))
    dueStatus='Turned in late';
    else dueStatus='Turned in';
    }
    if(findSubmission)
    findComments=await Comment.find({submission_id:findSubmission._id});
    res.render('assignment',{dueStatus,findComments,findResource,courseId:req.params.id,rscId:req.params.rscid,findSubmission,findClass});
}
module.exports.showAssignmentandSubmissions=async(req,res)=>
{
   const findResource=await Resource.findById(req.params.rscid);
    const findClass=await Class.findById(req.params.id);
    console.log(findResource);
    const allSubmissions=await Submission.find({course_id:req.params.id,resource_id:req.params.rscid});
    console.log(allSubmissions);
    let profile_path=[];
    const fileExtension=[];
        for(let i=0;i<allSubmissions.length;i++)
        {
            const findPic=await Profile.findOne({user_id:allSubmissions[i].student_id});
            if(findPic)
            profile_path.push(findPic.pic_path)
            else profile_path.push('uploads/profile_pic.jpg');
            for(let j=0;j<allSubmissions[i].files.length;j++)
            {
                if(!fileExtension[i])
                fileExtension.push(path.extname(allSubmissions[i].files[j].filepath));
                allSubmissions[i].files[j].filepath=allSubmissions[i].files[j].filepath.replace(/\\/g, "/");
            }
        }
        console.log(fileExtension);
        const enrolledStudents=await Enroll.find({class_id:req.params.id});
        const submitStatus=[];
        const findStudentPic=[];
        for(let i=0;i<enrolledStudents.length;i++)
        {
          const findSubmission=await Submission.findOne({student_id:enrolledStudents[i].student_id,course_id:req.params.id,resource_id:req.params.rscid});
          if(findSubmission){
            if(Date.parse(findSubmission.submitTime)>Date.parse(findResource.due))
          submitStatus.push('Turned in Late');
          else submitStatus.push('Turned in');
          }
          else submitStatus.push('Missing');
          const findPic=await Profile.findOne({user_id:enrolledStudents[i].student_id});
            if(findPic)
            findStudentPic.push(findPic.pic_path)
            else findStudentPic.push('uploads/profile_pic.jpg');
        }
        console.log(submitStatus);
        if(allSubmissions.length>0){
        const comments=[];
        for(let i=0;i<allSubmissions.length;i++)
        {
            const findComments=await Comment.find({submission_id:allSubmissions[i]._id});
            const allcom=[];
            for(let j=0;j<findComments.length;j++){
            allcom.push(findComments[j]);
            }
            comments.push(allcom);
        }
        console.log(comments);
        const dueStatus=[];
        allSubmissions.forEach((sub)=>
        {
           if(Date.parse(sub.submitTime)>Date.parse(findResource.due))
           dueStatus.push('Turned in late');
           else dueStatus.push('Turned in');
          });
          return  res.render('submissions',{fileExtension,findStudentPic,submitStatus,enrolledStudents,profile_path,findClass,findResource,allSubmissions,comments,Topic:findResource.topic_name,user_type:'Teacher',courseId:req.params.id,resourceId:req.params.rscid,Points:findResource.points,dueStatus});
    }
     else return  res.render('submissions',{fileExtension,findStudentPic,submitStatus,enrolledStudents,profile_path,findClass,findResource,allSubmissions,Topic:findResource.topic_name,user_type:'Teacher',courseId:req.params.id,resourceId:req.params.rscid,Points:findResource.points});
}