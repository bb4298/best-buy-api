require('dotenv').config();
//console.log(process.env.NODE_ENV);
//const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const bodyParser = require('body-parser');
const rateLimit = require("express-rate-limit");
const CronJob = require('cron').CronJob;
const axios = require('axios');

//Khai báo short-id
const ids = require('short-id');
ids.configure({
  length: 12,          // The length of the id strings to generate
  algorithm: 'sha1',  // The hashing algoritm to use in generating keys
  salt: Math.random   // A salt value or function
});

// console.log(process.env.SECRET_KEY);
const indexRouter = require('./routes/index.Route');
const authRouter = require('./routes/auth.Route');
const nguoiDungRouter = require('./routes/nguoiDung.Route');
const adminRouter = require('./routes/admin.Route');
const chuShopRouter = require('./routes/chuShop.Route');
const khachHangRouter = require('./routes/khachHang.Route');
const trangChuRouter = require('./routes/trangChu.Route');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//body parser setup
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'ejs');

//Setup CORS
app.use(function (req, res, next) {
  // res.io = io;
  /*res.header("Access-Control-Allow-Origin", "http://localhost:3004");*/
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE, PATCH");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, X-Custom-Header ,Content-Type, Accept,Authorization, token");
  res.header('Access-Control-Allow-Credentials', true);
  next();
});

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // giới hạn 150 request/phút
  max: 150 // limit each IP to 100 requests per windowMs
});

//  apply to all requests
//app.use(limiter);

app.use('/', indexRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/nguoidung', nguoiDungRouter);
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/chushop', chuShopRouter);
app.use('/api/v1/khachhang', khachHangRouter);
app.use('/api/v1/trangchu', trangChuRouter);


/*const {triggerController} = require('./controllers');
const jobTruDiem = new CronJob('00 1 * * * *', () => {
  triggerController.TruDiemXepHangSanPham();
}, null, true, 'Asia/Ho_Chi_Minh');
//jobTruDiem.start();*/

const jobPingServer = new CronJob('0 */48 * * * *', async () => {
  // Ping server
  await axios({
    method: 'get',
    url: 'https://bestbuyapi98.herokuapp.com/',
  });
  // Ping client
  // await axios({
  //   method: 'get',
  //   url: 'https://bestbuyclient.herokuapp.com/login',
  // });
  //console.log(ping.data);
}, null, true, 'Asia/Ho_Chi_Minh');
jobPingServer.start();

global.SoSanPhamMoiPageIndex = 3;
global.SoItemMoiPageAdmin = 10;

module.exports = app;
