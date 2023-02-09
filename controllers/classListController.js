const Class=require('../models/class');
const Enroll=require('../models/enrolment');
const Resource=require('../models/resources');
const Submission = require('../models/submission');
const updateProfile=require('../models/updateProfile')
const updateClassBg=require('../models/updateClassbg')
let user_type;
module.exports.classList=async(req,res)=>
{
    user_type=req.params.id;
    if(user_type=="created")
    {
         const allclasses=await Class.find({teacher_id:req.session.user._id});
         console.log(allclasses);
         const name=req.session.user.firstname+" "+req.session.user.lastname;
         const profile=await updateProfile.findOne({user_id:req.session.user._id});
         if(profile)
         profile.pic_path=profile.pic_path.replace(/\\/g, "/");
         const classesBg=[];
         for(let i=allclasses.length-1;i>=0;i--)
         {
             const up_bg = await updateClassBg.findOne({class_id:allclasses[i]._id});
             if(up_bg){
             up_bg.pic_path = up_bg.pic_path.replace(/\\/g, "/");
             classesBg.push(up_bg.pic_path);
             }
             else classesBg.push('uploads/class-background.jpg')
         }
         console.log(classesBg)
         return res.render("teacher/classList",{user_type,allclasses,name,profile,classesBg});
    }
    else if(user_type=="enrolled")
    {
        const enrolledCourses=await Enroll.find({student_id:req.session.user._id});
        console.log(enrolledCourses);
        const countDueResources=[];
        for(let i=0;i<enrolledCourses.length;i++)
        {
            const countDueResource = await Resource.countDocuments({course_id:enrolledCourses[i].class_id,due:{ $ne:'Invalid date'}});
            countDueResources.push(countDueResource);
        }
        console.log(countDueResources);
        const countSubmissions=[];
        for(let i=0;i<enrolledCourses.length;i++)
        {
            const countSubmission = await Submission.countDocuments({course_id:enrolledCourses[i].class_id,student_id:enrolledCourses[i].student_id});
            countSubmissions.push(countSubmission);
        }
        console.log(countSubmissions);
        const remainingDue=[];
        for(let i=enrolledCourses.length-1;i>=0;i--)
        {
            remainingDue.push(countDueResources[i]-countSubmissions[i]);
        }
        console.log(remainingDue);


            const name=req.session.user.firstname+" "+req.session.user.lastname;
            const profile=await updateProfile.findOne({user_id:req.session.user._id});
            const teacher_profile=[];
            for(let i=enrolledCourses.length-1;i>=0;i--)
            {
                const t_prof = await updateProfile.findOne({user_id:enrolledCourses[i].teacher_id});
                if(t_prof){
                t_prof.pic_path=t_prof.pic_path.replace(/\\/g, "/");
                teacher_profile.push(t_prof.pic_path);
                }
                else teacher_profile.push('uploads/profile_pic.jpg')
            }
            console.log(teacher_profile);
            const classesBg=[];
            for(let i=enrolledCourses.length-1;i>=0;i--)
            {
                const up_bg = await updateClassBg.findOne({class_id:enrolledCourses[i].class_id});
                if(up_bg){
                up_bg.pic_path = up_bg.pic_path.replace(/\\/g, "/");
                classesBg.push(up_bg.pic_path);
                }
                else classesBg.push('uploads/class-background.jpg')
            }
            console.log(classesBg)
        return res.render("student/classList",{user_type,yourClasses:enrolledCourses,name,remainingDue,profile,teacher_profile,classesBg});
    }
    else return res.render('404page')
}

module.exports.createClass=async(req,res)=>
{
    const {classname,section,subject,class_code}=req.body;
    if(!classname || !section || !subject ||!class_code)
    {
        req.flash('info','Sorry,All fields are required');
        return res.redirect('/classList/created');
    }
    const is_class_exist=await Class.findOne({class_code});
    if(is_class_exist)
    {
        req.flash('error','Oops.This class code has already taken');
        return res.redirect('/classList/created');
    }
    else{
        const teacher_name=req.session.user.firstname+" "+req.session.user.lastname;
        const newclass=new Class({
            teacher_id:req.session.user._id,
            teacher_name:teacher_name,
            classname,
            section,
            subject,
            class_code
        });
        
        await newclass.save()
       .then(newclass=>{
        console.log(newclass);
        req.flash('success', 'Class Added Succesfully');
        return res.redirect('/classList/created');
    })
    .catch(err=>{console.log(err)});
        
    }
}

module.exports.unenroll=async(req,res)=>
{
    const st_id=req.session.user._id;
    const unenrolled_class=await Enroll.findOneAndDelete({student_id:st_id,class_id:req.params.id});
    if(unenrolled_class)
    {
       console.log(unenrolled_class);
       return res.redirect('/classList/enrolled')
    }
    else console.log('something went wrong');
}

module.exports.delete=async(req,res)=>
{
    const deletedClass=await Class.findByIdAndDelete(req.params.id);
    if(deletedClass)
    console.log(deletedClass);
    else console.log("something went wrong");
    await Enroll.deleteMany({class_id:req.params.id})
    .then(deletedEnrolledClasses=>console.log(deletedEnrolledClasses))
    .catch(err=>console.log(err));
     return res.redirect('/classList/created');
}

module.exports.joinForm=(req,res)=>
{
    return res.render('joinPage')
}
module.exports.profile=(req,res)=>
{
    return res.render('updateProfile')
}
module.exports.update_profile=async(req,res)=>
{
    console.log(req.file);
    if(req.file){
    const findProfile=await updateProfile.findOne({user_id:req.session.user._id});
    if(!findProfile){
    const uploadPic=new updateProfile({
        user_id:req.session.user._id,
        pic_name:req.file.originalname,
        pic_path:req.file.path
    });
    await uploadPic.save()
    .then(upload=>{
        console.log(upload);
        return res.redirect('/classList/created');
    })
    .catch(err=>{console.log(err)});
}
else
{
    const uploadPic={
        user_id:req.session.user._id,
        pic_name:req.file.originalname,
        pic_path:req.file.path
    };
    const updatedProfile=await updateProfile.findOneAndUpdate({user_id:req.session.user._id},uploadPic,{new:true});
    console.log(updatedProfile);
    return res.redirect('/classList/created');
}
}
}

module.exports.change_bg=(req,res)=>
{
    res.render('updateClassBg',{class_id:req.params.id});
}

module.exports.update_classBg=async(req,res)=>
{
  
        if(req.file){
            const findbg=await updateClassBg.findOne({class_id:req.params.id});
            if(!findbg){
            const uploadbg=new updateClassBg({
                class_id:req.params.id,
                pic_name:req.file.originalname,
                pic_path:req.file.path
            });
            await uploadbg.save()
            .then(upBg=>{
                console.log(upBg);
                return res.redirect('/classList/created');
            })
            .catch(err=>{console.log(err)});
        }
        else
        {
            const uploadbg=new updateClassBg({
                _id:Object(findbg._id),
                class_id:req.params.id,
                pic_name:req.file.originalname,
                pic_path:req.file.path
            });
            const updatedBg=await updateClassBg.findOneAndUpdate({class_id:req.params.id},uploadbg,{new:true});
            console.log(updatedBg);
           

             console.log(updatedBg);
            return res.redirect('/classList/created');
        }
        
    }
    console.log(req.params.id)
}