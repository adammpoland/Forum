const express = require('express');
const multer = require('multer');
const ejs = require('ejs');
const path = require('path');
const MongoClient = require('mongodb').MongoClient;
const url = "mongodb://localhost:27017/mydb";
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const hostURL = 'localhost:5000';
var session = require('express-session');
const app = express();

var methodOverride = require('method-override')

//promise
mongoose.Promise = global.Promise;
const keys = require('./config/keys');

//connet to mongoose
mongoose.connect(keys.mongoURI, {
    useNewUrlParser: true
})
    .then(() => console.log('Mongo is connected'))
    .catch(err => console.log(err));


// override with POST having ?_method=DELETE
app.use(methodOverride('_method'))
//session var middleware
app.use(session({secret:'XASDAasdiuDA',saveUninitialized: true,resave: true}));

    //body parser middleware
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json());


//load 
require('./models/questions');
require('./models/users');

const Question = mongoose.model('questions');
const User = mongoose.model('users');

//


//set storage engiene
const storage = multer.diskStorage({
    destination: './public/uploads/',
   
    filename: function (req, file, cb) {
        cb(null, file.originalname);
        // cb(null,file.originalname+ '-' + Date.now() + path.extname(file.originalname));

    }
});

//init upload
const upload = multer({
    storage: storage
}).single('myFile');


//starts ejs
app.set('view engine', 'ejs');

app.use("/public", express.static(path.join(__dirname, 'public')));
app.use("/views", express.static(path.join(__dirname, 'views')));

app.use(express.static("./views"));




app.get('/', (req, res) => {
session = req.session;
    //DATABASE TO ARRAY
    Question.find({}, (err, questions) => {
        if (err) return console.log(err);

        res.render('index', { 
            questions: questions,
             username: session.username,
             auth: session.auth                 
        });
    });

    console.log(session.username);
});


app.get('/results/:id', (req, res) => {
    session = req.session;

    Question.findOne({_id: req.params.id},(err,question)=>{
        console.log(req.params.id);

        res.render('results', { 
            question: question,
            username: session.username,
            auth: session.auth
        });
    })
    
});



app.get('/login',(req,res) => {
   res.render('login');
});


app.post('/login',(req,res) => {
    session = req.session;
    session.username = "coolQ@Qcool.com";
    

    try {
        // var idString = req.params.id;
        // var id = new mongoose.Types.ObjectId(String(idString));

    
        User.findOne({username: req.body.username},(err,user)=>{
            console.log(user);
            if(user.password == req.body.password){
                session.username = user.username;
                session.name = user.name;
                session.auth = "true";
                console.log("auth succesful");
                res.redirect("/");
            
        }});
        
    } catch (err) {
        console.log(err);
    }


});

//for downloads
app.post('/download', function (req, res) {
    try {
        let file = __dirname + '/public/uploads/'+req.body.title;
    console.log(file);
    res.download(file); // Set disposition and send it.
    } catch (error) {
        
    }
    
});

app.get('/myQuestions', (req, res) => {
    session = req.session;
    
    if(session.auth=='true'){

        try {
        //DATABASE TO ARRAY
        Question.find({username: session.username}, (err, questions) => {
            if (err) return console.log(err);
    
            res.render('myQuestions', { 
                questions: questions,
                username: session.username,
                auth: session.auth                 
            });
        });
    
        console.log(session.username);
    } catch (error) {
        console.log(error);
    }

                  

}else{
    res.redirect('/login');
}
});

app.get('/finishedSurveys', (req, res) => {
    session = req.session;
    
    if(session.auth=='true'){

        try {
        //DATABASE TO ARRAY
        Test.find({}, (err, tests) => {
            if (err) return console.log(err);
    
            res.render('finishedSurveys', { 
                tests: tests,
                username: session.username,
                auth: session.auth                 
            });
        });
    
        console.log(session.username);
    } catch (error) {
        console.log(error);
    }

                  

}else{
    res.redirect('/login');
}
});

app.get('/question/:id', function (req, res) {
   
    session = req.session;

    if(session.auth=='true'){

        try {
        
            Question.findOne({_id: req.params.id},(err,question)=>{
                console.log(req.params.id);
    
                console.log(question);
                res.render('question', { 
                    question: question,
                    username: session.username
                });
            })
        } catch (error) {
            console.log(error);
        }
    }else{
        res.redirect('/login');
    }
});


app.get('/addQuestion', (req, res) => {
    session = req.session;

    if(session.auth=='true'){
        res.render('addQuestion', { 
            username: session.username    
        });
    }else{
        res.redirect('/login');
    }
 });



 app.post('/addQuestion', (req, res) => {
     session = req.session;
     console.log("createing new test");
     console.log(req.body);

     console.log(session.auth);
    if(session.auth=='true'){
        try {
            var question = {
                question: req.body.question,
                username: req.body.username
            }
            new Question(question)
            .save();
            res.redirect("/");
        } catch (error) {
            console.log(error);
        }
   
    }else{
        res.redirect('/login');
    }
});


app.post('/newComment/:id', (req, res) => {
        console.log("submitted");
        console.log(req.body.writtenBy);
        session = req.session;
        if(session.auth=='true'){
     
         try {
             Question.findOne({_id: req.params.id},(err,question)=>{
                 console.log(req.params.id);

             }).then(question => {
                 //question.name = req.body.title;
                 //question.details = req.body.details;
               
            var comment = {
                writtenBy: session.username,
                text: req.body.text

            }

            question.comments.push(comment);
                 
                 question.save()
                   .then(question => {
                       res.redirect("/results/"+question._id);
                   })
             })
         } catch (error) {
             console.log(error);
         }
     }else{
         res.redirect('/login');
     }
});


 app.get('/logout', (req, res) => {
    req.session.destroy(function(err) {
        // cannot access session here
     })
     res.redirect('/login');

 });

 app.get('/registerUser', (req, res) => {
    session = req.session;
    //DATABASE TO ARRAY
    res.render('registerUser', { 
        username: session.username,
        auth: session.auth                 
    });
 });

 app.post('/registerUser', (req, res) => {
    try {
        console.log(req.body);
        // User.findOne({username: req.body.username},(err,test)=>{

        //     console.log(test);
        //     res.render('test', { 
        //         test: test,
        //         username: session.username
        //     });
        // })
       
        
        var user = {
            username: req.body.username,
            password: req.body.password
        }
        new User(user)
        .save();
        
    } catch (error) {
        console.log(error);
    }
    //navigate to login
    res.redirect('/login');

 });




const port = 5000;

app.listen(port, () => console.log('server started on 5000'));
