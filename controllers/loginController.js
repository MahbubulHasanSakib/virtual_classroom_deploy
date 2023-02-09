const User=require('../models/user');
const bcrypt=require('bcrypt');
const {validationResult}=require('express-validator')
module.exports.getLogin=(req,res)=>
{
   return res.render('login');
}
module.exports.postLogin=async(req,res)=>
{
     const {email,password}=req.body;
     if(!email || !password)
    {
        req.flash('error','All fields are required');
        return res.redirect('/login');
    }
    const errors=validationResult(req);
    if(!errors.isEmpty())
    {
        return res.render('login',{alerts:errors.array()});
    }
     const user=await User.findOne({email});
     if(!user)
     {
        req.flash('error','This email is not registered');
         return res.redirect('/login');
     }
     else
     {
         const isMatched= await bcrypt.compare(password,user.password);
         if(isMatched)
         {
             req.session.isAuth=true;
             req.session.user=user;
             console.log(req.session.user);
             return res.redirect("/classList/created");
         }
         else
         {
             req.flash('error','email or password is wrong');
             return res.redirect('/login');
         }
     }

}