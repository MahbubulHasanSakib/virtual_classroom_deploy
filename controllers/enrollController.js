const Class=require('../models/class')
const Enroll=require('../models/enrolment')
module.exports.enroll=async(req,res)=>
{
    const {enrollCode}=req.body;
    if(!enrollCode)
    {
        return res.redirect('/classList/class/join_form');
    }
    const findClass=await Class.findOne({class_code:enrollCode});
    if(findClass)
    {
        const isEnrolled=await Enroll.findOne({student_id:req.session.user._id,class_id:findClass._id});
        if(isEnrolled)
        {
          req.flash('info','You have already enrolled this class');
          return res.redirect('/classList/enrolled');
        }
        else{
            const name=req.session.user.firstname+" "+req.session.user.lastname;
       const enrollClass=new Enroll({
           student_id:req.session.user._id,
           student_name:name,
           class_id:findClass._id,
           class_name:findClass.classname,
           section:findClass.section,
           teacher_id:findClass.teacher_id,
           teacher_name:findClass.teacher_name
       })
       await enrollClass.save()
       .then(enroll=>
        {
            req.flash('success','You have enrolled the class successfully');
            return res.redirect('/classList/enrolled');
        })
       .catch(err=>
        {
            console.log(err);
        })
    }
    }
    else
    {
        req.flash('info','This class code is invalid');
        res.redirect('/classList/enrolled');
    }
}