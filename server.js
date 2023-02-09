const express=require('express');
const session = require('express-session');
const flash=require('express-flash');
const MongoDBSession=require('connect-mongodb-session')(session);
const path=require('path');
const mongoose=require('mongoose');
const Authmiddleware=require('./middlewares/guest')
const registerRoute=require('./routes/registerRoute');
const loginRoute=require('./routes/loginRoute');
const classListRoute=require('./routes/classListRoute');
const courseDetailsRoute=require('./routes/courseDetailsRoute')
const gradeRoute=require('./routes/gradeRoute');
const peopleRoute=require('./routes/peopleRoute');
const enrollRoute=require('./routes/enrollRoute');
const contactRoute=require('./routes/contactRoute');
require('dotenv').config();

app=express();
app.use(express.static(__dirname+'/public'));
app.use('/uploads',express.static(__dirname+'/uploads'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname,'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


const mongoURI=process.env.MONGOURI;
mongoose.connect(mongoURI, {useNewUrlParser: true,useUnifiedTopology: true,useCreateIndex:true,useFindAndModify: false})
.then(()=>{console.log("mongoose is connected")})
.catch((err)=>{console.log(err)});

const store=new MongoDBSession({
    uri:mongoURI,
    collection:'mySessions'
})

app.use(session({
    secret:process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
      },
    store:store
  }));

app.use(flash());

app.use((req,res,next)=>
{
    if(req.session.user){
    const userName=req.session.user.firstname+" "+req.session.user.lastname;
    const userType=req.session.user.user_type;
    res.locals.userName=userName;
    res.locals.userType=userType;
    }
    next();
})

app.get('/',Authmiddleware.islogged,(req,res)=>
{
    res.render('home');
})

app.use('/login',loginRoute);
app.use('/register',registerRoute);

app.use('/classList',classListRoute);
app.use('/courseDetails',courseDetailsRoute);
app.use('/classResource',courseDetailsRoute);
app.use('/people',peopleRoute);
app.use('/grade',gradeRoute);
app.use('/enrollCourse',enrollRoute);
app.use('/contact',contactRoute);
app.post('/logout',(req,res)=>
{
    req.session.destroy((err)=>
    {
        if(err)
        console.log(err);
        else
        {
            res.redirect('/');
        }
    });
});
/*app.get('*', function(req, res){
    res.render('404page');
  });*/




const port=process.env.PORT;
app.listen(port,(err)=>
{
    if(err)
    console.log(err);
    else console.log(`Server is running at port ${port}`)
})