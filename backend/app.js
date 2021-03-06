var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var passport = require('passport');
var session = require('express-session');
var bodyParser = require('body-parser')

var apiRouter = require('./routes/api');

var app = express();

//Set up mongoose connection
var mongoose = require('mongoose');
var mongoDB = 'mongodb+srv://pennspark:team1matchamakers@cluster0.cx4rx.mongodb.net/Cluster0?retryWrites=true&w=majority';
mongoose.connect(mongoDB, { useNewUrlParser: true , useUnifiedTopology: true});
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

app.use(bodyParser.json());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.authenticate('session')); //equivalent to app.use(passport.session())

// //app.use('/', indexRouter);
// app.use('/', authRouter);
// app.use('/user/', usersRouter);
app.use('/api', apiRouter);

//if (process.env.NODE_ENV === 'production') {
console.log("bruh")
app.use(express.static(path.join(__dirname, '../frontend/build')));
app.get("*", function (request, response) {
  response.sendFile(path.resolve(__dirname, "../frontend/build", "index.html"));
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // // set locals, only providing error in development
  // res.locals.message = err.message;
  // res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  console.log(err)
  res.status(err.status || 500).send(`${err.message}`)
});

module.exports = app;
