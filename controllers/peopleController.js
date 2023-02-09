const Class=require('../models/class')
const Enroll=require('../models/enrolment')
const updatedProfile=require('../models/updateProfile')

module.exports.people=async(req,res)=>
{
    console.log(req.params.id); 
    userType=req.params.type;
    if(userType!=='enrolled' &&  userType!=='created')
    {
       return res.render('404page')
    }
    if(userType=='enrolled')
    {
        const findClassenroll=await Enroll.findOne({student_id:req.session.user._id,class_id:req.params.id});
        if(!findClassenroll)
        return res.render('404page');
    }
    if(userType=='created')
    {
        const user_id=req.session.user._id;
        const findClass=await Class.findOne({_id:req.params.id,teacher_id:user_id});
        console.log(findClass)
        if(!findClass)
        return res.render('404page');
    }
    const findClass=await Class.findById(req.params.id);
    const findProfilePic=await updatedProfile.findOne({user_id:findClass.teacher_id});
    if(findProfilePic)
    findProfilePic.pic_path= findProfilePic.pic_path.replace(/\\/g, "/");
    const enrolledStudents=await Enroll.find({class_id:req.params.id});
    const st_Profile=[];
    for(let i=0;i<enrolledStudents.length;i++)
    {
        const findProfile_st=await updatedProfile.findOne({user_id:enrolledStudents[i].student_id});
        if(findProfile_st)
        st_Profile.push(findProfile_st.pic_path.replace(/\\/g, "/"));
        else st_Profile.push('uploads/profile_pic.jpg');
    }
    return res.render('people',{courseId:req.params.id,findClass,enrolledStudents,userType,findProfilePic,st_Profile});
}