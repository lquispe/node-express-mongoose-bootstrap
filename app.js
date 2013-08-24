
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , nunjucks = require('nunjucks');

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  //app.set('view engine', 'html');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});


var env = new nunjucks.Environment(new nunjucks.FileSystemLoader('views'));
env.express(app);



// mongodb configure 

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/module-test');

 var UserSchema = new mongoose.Schema({
     name:String,
     email:String,
     age:Number
 });

Users = mongoose.model('Users',UserSchema);




app.configure('development', function(){
  app.use(express.errorHandler());
});







app.get('/',function(req,res){
    //res.render('index.html',{title:"hellow"});
    res.redirect('/users');
});





app.get('/users',function(req,res){
  Users.find({},function(err, docs){
    if(err) throw err;

    res.render('users/index.html',{ users:docs });

  });
});

app.get('/users/new',function(req,res){
  res.render('users/new.html');
});



app.post('/users',function(req,res){
  var b = req.body;

  new Users({
    name: b.name,
    email:b.email,
    age: b.age
  }).save(function(err,user){
    if (err) res.json(err);
    res.redirect('/users/'+user.name);
  });

});

app.param('name',function(req,res,next,name){
  Users.find({name:name},function(err,docs){
    req.user = docs[0];
    next();
  });
});



app.get('/users/:name',function(req,res){
  res.render('users/show.html',{user:req.user})
});



app.get('/users/:name/edit',function(req,res){
  res.render('users/edit.html',{user:req.user});
});


app.put('/users/:name',function(req,res){
  var b = req.body;
  Users.update(
    {name:req.params.name},
    {name:b.name,age:b.age,email:b.email},
    function(err){
      res.redirect('/users/'+b.name);
    });
});





app.delete('/users/:name',function(req,res){
  Users.remove({name:req.params.name},function(err){
    res.redirect('/');
  });
});




// app.get('/', routes.index);
// app.get('/users', user.list);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
