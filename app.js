var express = require('express'),
    app = express(),
    mongoose = require('mongoose'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    expressSanitizer = require('express-sanitizer')

mongoose.connect('mongodb://localhost:27017/restful_blog_app', {useNewUrlParser: true});
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));
app.use(methodOverride('_method'));
app.use(expressSanitizer());

var blogSchema = new mongoose.Schema({
  title: String,
  image: String,
  body: String,
  created: {type: Date, default: Date.now}
});
var Blog = mongoose.model('Blog', blogSchema);

//check if someone is logged in
global.isSignedIn = false;

// admin username and password
let mail = process.env.EMAIL;
let pass = process.env.PASSWORD;


app.use(function(req, res, next) {
    if (!req.user) {
        res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
        res.header('Expires', '-1');
        res.header('Pragma', 'no-cache');
    }
    next();
});


// RESTful Routes
app.get('/', function(req, res){
  res.redirect('/blogs');
});

// RESTful Routes
app.get('/', function(req, res){
  res.redirect('/blogs');
});

// Index Route
app.get('/blogs', function(req, res){
  Blog.find({}, function(err, blogs){
    if(err){
      console.log(err);
    } else {
      res.render('index', {blogs: blogs});
    }
  });
});

// New Route
app.get('/blogs/new', function(req, res){
  if (isSignedIn) {
    res.render('new');
  } else {
    res.render('notlogged');
  }
});

//login route
app.get('/blogs/admin', (req, res) => {
	res.render('login')
});

//logout route
app.get('/logout', (req, res) => {
  global.isSignedIn = false;
  res.redirect('/blogs');
})

//verification
app.post('/signin', (req, res, next) => {

  if (req.body.email === mail && req.body.password === pass) {
    global.isSignedIn = true
    res.redirect('/blogs');
  } else {
    global.isSignedIn = false
    res.redirect('/blogs/admin');
  }
  
})

// Create Route
app.post('/blogs', function(req, res){
  if (isSignedIn) {
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.create(req.body.blog, function(err, newBlog){
    if(err){
      console.log(err);
      res.render('new');
    } else {
      res.redirect('/blogs');
    }
  });
  } else {
    console.log("error");
    res.render('notlogged');
  }
  
});

// Show Route
app.get('/blogs/:id', function(req, res){
  Blog.findById(req.params.id, function(err, foundBlog){
    if(err){
      res.redirect('/blogs');
    } else {
      res.render('show', {blog: foundBlog});
    }
  });
});

// Edit Route
app.get('/blogs/:id/edit', function(req, res){
  Blog.findById(req.params.id, function(err, foundBlog){
    if(err){
      res.redirect('/blogs');
    } else {
      res.render('edit', {blog: foundBlog});
    }
  });
});

// Update Route
app.put('/blogs/:id', function(req, res){
  req.body.blog.body = req.sanitize(req.body.blog.body);
  Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog){
    if(err){
      res.redirect('/blogs');
    } else {
      res.redirect('/blogs/' + req.params.id);
    }
  });
});

// Delete Route
app.delete('/blogs/:id', function(req, res){
  Blog.findByIdAndRemove(req.params.id, function(err){
    if(err){
      res.redirect('/blogs');
    } else {
      res.redirect('/blogs');
    }
  });
});

app.listen(3001, function(){
  console.log('restful-blog-app server has started!');
});