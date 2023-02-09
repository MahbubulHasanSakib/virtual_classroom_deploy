const User=require('../models/user');
module.exports.isAuthenticated=(req,res,next)=>
{
    if(req.session.isAuth)
    next();
    else res.redirect('/');
}

module.exports.islogged=(req,res,next)=>
{
    if(req.session.isAuth)
    {
        return res.redirect('/classList/created');
    }
    else next();
}
module.exports.isVerified=async(req,res,next)=>
{
    try{
    const user=await User.findOne({email:req.body.email});
    if(user){
    if(user.isValid)
    {
        return next();
    }
    else{
    req.flash('error','Your account has not been verified.Please check email to verify');
    return res.redirect('/login');
    }
    }
    else
    {
        req.flash('error','User has not been found');
    return res.redirect('/login');
    }
    }catch(error){
        console.log(error);
    req.flash('error','Something went wrong.Please contact us');
    return res.redirect('/login');
    }
}

