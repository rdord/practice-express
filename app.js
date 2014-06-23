
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path');

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({ secret: 'this will be hashed' }));
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));

  app.use(function (req, res) {
    res.send(404, 'FOF');
  });

  app.use(function (err, req, res, next) {
    res.status(err.status || 404);  //vrne err če obstaja, drugače 404
    res.send(err.message);
  });
});

app.configure('development', function(){
  app.use(express.errorHandler());
});
/*
app.get('/', routes.index);
*/
app.get('/', function (req, res) {
  res.render('home.jade', {title: 'Text from the title object.'});
});


app.get('/hi', function (req, res) {
  var msg = ['<h1>Hi</h1>', '<p>How are you?</p>', '<p>Good?</p>'].join('\n');
  res.send(msg);
});
/*
app.get('/users/:userId', function (req, res) {
  res.send('<h1>Hello user ' + req.params.userId + '!');
});
*/
app.post('/users', function (req, res) {
  res.send("Created a new user: " + req.body.username +
    " (" + req.body.userId + ")");
});
/*
app.put('/users/:userId', function (req, res) {
  res.send("Updated user " + req.body.username);
});

app.delete('/users/:userId', function (req, res) {
  res.send('User with ID ' + req.params.userId + ' deleted.');
});
*/
app.get(/\/users\/(\d*)\/?(edit)?/, function  (req, res) {
  //  /users/10
  //  /users/10/
  //  /users/10/edit

  //prvi element v oklepajih v regex je prvi v polju params
  var  msg = "users #" + req.params[0] + " profile.";

  if(req.params[1] === "edit") {
    msg = "Editing " + msg;
  }
  else {
    msg = "Viewing " + msg;
  }

  res.send(msg);
});

/* respond with json */
app.get('/json', function (req, res) {
  res.json({name: 'John'});
});

/* different output for different formats */
app.get('/format', function (req, res) {
  res.format({
    html: function () {
      res.send('<h1>Hi</h1>');
    },
    json: function  () {
      res.json({ messafe: 'hi' });
    },
    text: function () {
      res.send('hi');
    }
  });
});

/* redirect */
app.get('/re', function (req, res) {
  res.status(302).redirect('/');  //temp redirect; 301 is perm
});

/* passing params between functions */
var users = ['john', 'andy', 'mya', 'rya', 'bob', 'guy', 'moe'];

app.param('from', function (req, res, next, from) {
  req.from = parseInt(from, 10);
  next();
});

app.param('to', function (req, res, next, to) {
  req.to = parseInt(to, 10);
  next();
});

app.get('/user/:from-:to', function (req, res) {
  res.json(users.slice(req.from - 1, req.to));
});

/* file download counter*/
var count = 0;

app.get('/hello.txt', function (req, res, next) {
  count++;
  next();
});

app.get('/count', function (req, res) {
  res.send('' + count + ' views');
});

/* passing multiple functions */
var usrs = [
  {name: 'john'},
  {name: 'bonnie'},
  {name: 'rukola'}
];

function loadUsr (req, res, next) {
  req.usr = usrs[parseInt(req.params.usrId, 10) - 1];
  next();
}

app.get('/usr/:usrId', loadUsr, function (req, res, next) {
  res.json(req.usr);
});

/* cookie */
app.get('/name/:cname', function (req, res) {
  res.cookie('name', req.params.cname).send('<p><a href="/name">View cookie</a></p>');
});

app.get('/name', function (req, res) {
  res.clearCookie('name').send(req.cookies.name);
});

/* session */
app.get('/nme/:sname', function (req, res) {
  req.session.name = req.params.sname;
  res.send('<p><a href="/nme">View session</a></p>');
});

app.get('/nme', function (req, res) {
  res.send(req.session.name);
});

/* error */
app.param('username', function (req, res, next, username) {
  if(username !== 'sandi'){
    req.uname = username;
    next();
  } 
  else {
    next(new Error('User not found'));
  }
});

app.get('/username/:username', function (req, res, next) {
  res.send(req.uname + '´s profile');
});


http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
