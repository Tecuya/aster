import express = require( 'express' );
import { Application } from 'express';
import path = require( 'path' );
import bodyParser = require( 'body-parser' );
import http = require( 'http' );
import os = require( 'os' );

// import cookieParser from 'cookie-parser';
// import logger from 'logger';

// Create a new express application instance
const app: express.Application = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// app.use('/', indexRouter);
// app.use('/users', usersRouter);

app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});

