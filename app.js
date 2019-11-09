const express = require('express');
const path = require('path');
const logger = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');

const api = require('./routes/api');
const auth = require('./routes/auth');

require('dotenv').config();


if (process.env.NODE_ENV === 'development') {
  mongoose.connect(process.env.DATABASE);
} else {
  mongoose.connect(process.env.DATABASE);
}

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => console.log(`Connected to ${process.env.DATABASE} database`));

const app = express();

app.set('trust proxy', true);
app.use(cors);
app.options('*', cors);

// view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'ejs');
// const corsOptions = { origin: 'https://cofluencer.netlify.com' };

// app.use(cors(corsOptions));
// app.options('https://cofluencer.netlify.com', cors);
// uncomment after placing your favicon in /public
// app.use((req, res, next) => {
// res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');
//   res.setHeader('Access-Control-Allow-Origin', 'https://cofluencer.netlify.com');
//   res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,OPTIONS,DELETE');
// res.setHeader('Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers,X-Access-Token,XKey,Authorization');
//   res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
//   res.setHeader('Access-Control-Allow-Credentials', false);
//   next();
// });

// app.use(
//  cors({
//    credentials: true,
//    origin: ['https://cofluencer.netlify.com', 'https://elite-app.netlify.com'],
//  }),
// );

app.use(session({
  secret: 'cofluencer-api',
  resave: true,
  saveUninitialized: true,
  cookie: { maxAge: 2419200000, sameSite: 'none', secure: process.env.NODE_ENV === 'production' },
}));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/auth', auth);
app.use('/api', api);

app.use((req, res) => {
  res.sendFile(`${__dirname}/public/index.html`);
});

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use((error, req, res) => {
  // set locals, only providing error in development
  // console.log(error);
  res.locals.message = error.message;
  res.locals.error = req.app.get('env') === 'development' ? error : {};

  // send error
  res.status(error.status || 500);
  res.json({ error: error.statusMessage });
});

module.exports = app;
