const Contact=require('../models/contact')
module.exports.contact=(req,res)=>
{
    const {Name,Email,Phone,txtMsg}=req.body;
    if(!Name || !Email || !Phone || !txtMsg)
    {
        req.flash('error','All fields are required');
        return res.redirect('/');
    }
    else
    {
        const newcontact=new Contact({
            name:Name,
            email:Email,
            phone:Phone,
            message:txtMsg
        });
        newcontact.save()
        .then(cont=>{
            req.flash('success','Message send Successfully');
            console.log(cont);
            return res.redirect('/');
        })
        .catch(err=>console.log(err));
       
    }
        
}

module.exports.allcontacts=async(req,res)=>
{
    const allContacts=await Contact.find({});
    if(req.session.user)
    {
    if(req.session.user.email=='mahbubulhasan179@gmail.com')
    res.render('allContacts',{allContacts});
    else res.render('404page');
    }
    else res.render('404page');
}