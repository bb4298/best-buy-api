const jwt = require('jsonwebtoken');
const {DbUrl, NodemailerTransport,DbName,defaultImage,clientLink} = require('../../configs/constant');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const bcrypt = require('bcrypt');
const axios = require('axios');
const {BoDau} = require('../../utils/hamHoTro');
const nodemailer = require("nodemailer");
const soNgayHetHanToken = 5;
module.exports = {
    KiemTraDangNhapKhachHang: async function (req, res, next) {
        const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
        try{
            let tenDangNhap = req.body.tendangnhap.trim();
            let matKhau = req.body.matkhau;
            await client.connect();
            const db = client.db(DbName);
            const colNguoiDung = db.collection('NguoiDung');
            //Tìm user
            //let resultUser = await colNguoiDung.find({tenDangNhap: tenDangNhap, vaiTro:2,socialType:{$ne:'fb'}}).next();

            let resultUser = await colNguoiDung.find({
                '$or': [
                    {
                        tenDangNhap: tenDangNhap,
                        vaiTro:2,
                        socialType:{$ne:'fb'}
                    },
                    {
                        email: tenDangNhap,
                        xacThucEmail:true,
                        vaiTro:2,
                        socialType:{$ne:'fb'}
                    }
                ]
            }).next();
            if(resultUser === null){
                client.close();
                res.status(200).json({
                    status: 'fail',
                    message: 'Tài khoản hoặc mật khẩu không chính xác !'
                }); return ;
            }
            if(resultUser.trangThaiKhoa === true){
                client.close();
                res.status(200).json({
                    status: "fail",
                    message: "Tài khoản đã bị khóa, xin vui lòng liên hệ quản trị viên để mở lại !",
                }); return ;
            }

            let soSanhPass = bcrypt.compareSync(matKhau,resultUser.matKhau);
            if (soSanhPass) {
                let SecretKey = process.env.SECRET_KEY; //Biến môi trường
                let payload = {
                    userId: resultUser._id,
                    vaiTro: resultUser.vaiTro
                };
                let token = await jwt.sign({payload}, SecretKey, {expiresIn: 60 * 1440 * soNgayHetHanToken}); //Hết hạn trong 5 ngày
                //console.log(token.slice(token.length - 43, token.length));
                let r = await colNguoiDung.updateOne({_id:resultUser._id},{
                    $set:{
                        token:token.slice(token.length - 43, token.length)
                    }
                },{upsert: true});
                client.close();
                //console.log(JSON.stringify(payload));
                res.status(200).json({
                    status: "ok",
                    message: "Đăng nhập thành công !",
                    userName: resultUser.tenDangNhap,
                    userId: resultUser._id,
                    vaiTro: resultUser.vaiTro,
                    token: token
                });
            } else {
                client.close();
                res.status(200).json({
                    status: "fail",
                    message: "Tài khoản hoặc mật khẩu không chính xác !",
                });
            }
        }
        catch(e){
            client.close();
            res.status(200).json({
                status: "fail",
                message: e.toString(),
            });
        }

    },

    KiemTraDangNhapFacebook: async function (req, res, next) {
        const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
        try{
            const {id,name,email,accessToken,tenDangNhap} = req.body;
            if(!id && !accessToken){
                res.status(200).json({
                    status: 'fail',
                    message: 'Lỗi xác thực, vui lòng đăng nhập lại !'
                }); return;
            }
            await client.connect();
            const db = client.db(DbName);
            const colNguoiDung = db.collection('NguoiDung');
            let SecretKey = process.env.SECRET_KEY;
            //Tìm user
            let resultUser = await colNguoiDung.find({idFB: id, vaiTro:2}).next();
            //Trường hợp tài khoản chưa tồn tại(user cung cấp acces token sai)
            if(resultUser === null){
                let resFB = await axios({
                    method: 'get',
                    url: `https://graph.facebook.com/v6.0/me?access_token=${accessToken}`
                });
                if (resFB.data.error !== undefined) {
                    res.status(200).json({
                        status: "fail",
                        message: "Hết thời gian thao tác, vui lòng đăng nhập lại !",
                    }); return;
                }
                let resKetQua = await colNguoiDung.find({tenDangNhap:tenDangNhap}).next();
                if(resKetQua !== null){
                    client.close();
                    res.status(200).json({
                        status: 'fail',
                        message: 'Tên tài khoản đã tồn tại !'
                    }); return;
                }
                let _id = ObjectId();
                let payload = {
                    userId: _id,
                    vaiTro: 2,
                    fbUser:true
                };
                let token = await jwt.sign({payload}, SecretKey, {expiresIn: 60 * 1440 * soNgayHetHanToken}); //Hết hạn trong 5 ngày
                let tokenRutGon = token.slice(token.length - 43, token.length);
                //Tạo parameter NguoiDung
                let nguoiDung = {
                    _id:_id,
                    idFB:id,
                    socialType:'fb',
                    tenDangNhap:tenDangNhap,
                    sdt: '',
                    email: email || '',
                    xacThucEmail:false,
                    tokenXacThucEmail:'',
                    hoTen: name || '',
                    lowerCase:name ? BoDau(name) : '',
                    ngaySinh:new Date(),
                    gioiTinh:true,
                    anh:defaultImage,
                    gioHang:[],
                    vaiTro:2,
                    token:tokenRutGon,
                    forgotPassToken:'',
                    trangThaiKhoa: false
                }
                let r = await colNguoiDung.insertOne(nguoiDung);
                client.close();
                res.status(200).json({
                    status: "ok",
                    message: "Đăng nhập thành công !",
                    userName: tenDangNhap,
                    userId: _id,
                    vaiTro: 2,
                    token: token
                });
            }

            //Trường hợp tài khoản đã tồn tại
            if(resultUser !== null){
                let payload = {
                    userId: resultUser._id,
                    vaiTro: 2,
                    fbUser:true
                };
                let token = await jwt.sign({payload}, SecretKey, {expiresIn: 60 * 1440 * soNgayHetHanToken}); //Hết hạn trong 5 ngày
                let tokenRutGon = token.slice(token.length - 43, token.length);
                let r = await colNguoiDung.updateOne({_id:resultUser._id},{
                    $set:{
                        token:tokenRutGon
                    }
                });
                client.close();
                res.status(200).json({
                    status: "ok",
                    message: "Đăng nhập thành công !",
                    userName: resultUser.tenDangNhap,
                    userId: resultUser._id,
                    vaiTro: 2,
                    token: token
                });
            }
        }
        catch(e){
            client.close();
            res.status(200).json({
                status: "fail",
                message: e.toString(),
            });
        }

    },

    KiemTraTonTaiTaiKhoanFacebook: async function (req, res, next) {
        const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
        try{
            const {idfacebook} = req.body;
            await client.connect();
            const db = client.db(DbName);
            const colNguoiDung = db.collection('NguoiDung');
            //Tìm user
            let resultUser = await colNguoiDung.find({idFB: idfacebook, vaiTro:2}).next();
            client.close();
            //Trường hợp tài khoản chưa tồn tại
            if(resultUser === null){
               // console.log('chưa tt')
                res.status(200).json({
                    status: 'fail',
                    message: 'Tên tài khoản chưa tồn tại !'
                }); return;
            }
           // console.log('da tt');
            res.status(200).json({
                status: 'ok',
                message: 'Tên tài khoản đã tồn tại !'
            });
        }
        catch(e){
            client.close();
            res.status(200).json({
                status: "fail",
                message: e.toString(),
            });
        }

    },

    KiemTraDangNhapQuanTri: async function (req, res, next) {
        const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
        try{
            let tenDangNhap = req.body.tendangnhap.trim();
            let matKhau = req.body.matkhau;
            await client.connect();
            const db = client.db(DbName);
            const colNguoiDung = db.collection('NguoiDung');
            //Tìm user
            //let resultUser1 = await colNguoiDung.find({tenDangNhap: tenDangNhap,vaiTro:{'$in':[0,1,3]}}).next();
            let resultUser = await colNguoiDung.find({
                '$or': [
                    {
                        tenDangNhap: tenDangNhap,
                        vaiTro:{'$in':[0,1,3]},
                    },
                    {
                        email: tenDangNhap,
                        xacThucEmail:true,
                        vaiTro:{'$in':[0,1,3]},
                    }
                ]
            }).next();
            if(resultUser === null){
                client.close();
                res.status(200).json({
                    status: 'fail',
                    message: 'Tài khoản hoặc mật khẩu không chính xác !'
                }); return ;
            }
            if(resultUser.trangThaiKhoa === true){
                client.close();
                res.status(200).json({
                    status: "fail",
                    message: "Tài khoản đã bị khóa, xin vui lòng liên hệ quản trị viên để mở lại tài khoản !",
                }); return ;
            }
            let soSanhPass = bcrypt.compareSync(matKhau, resultUser.matKhau);
            if (soSanhPass) {
                let SecretKey = process.env.SECRET_KEY;
                let payload = {
                    userId: resultUser._id,
                    vaiTro: resultUser.vaiTro
                };
                let token = await jwt.sign({payload}, SecretKey, {expiresIn: 60 * 1440 * soNgayHetHanToken}); //Hết hạn trong 5 ngày
                //Trả về json
                let r = await colNguoiDung.updateOne({_id:resultUser._id},{
                    $set:{
                        token:token.slice(token.length - 43, token.length)
                    }
                },{upsert: true});
                // console.log(JSON.stringify(payload));
                client.close();
                res.status(200).json({
                    status: "ok",
                    message: "Đăng nhập thành công !",
                    userName: resultUser.tenDangNhap,
                    userId: resultUser._id,
                    vaiTro: resultUser.vaiTro,
                    token: token
                });
            } else {
                client.close();
                res.status(200).json({
                    status: "fail",
                    message: "Tài khoản hoặc mật khẩu không chính xác !",
                });
            }
        }
        catch(e){
            client.close();
            res.status(200).json({
                status: "fail",
                message: e.toString(),
            });
        }

    },

    CheckLogined: async function (req, res, next) {
        const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
        try {
            // var token = req.query.token;
            let token = req.header('token');
            let type = parseInt(req.query.type);
            await client.connect();
            const db = client.db(DbName);
            const colNguoiDung = db.collection('NguoiDung');
            let tokenResult = await jwt.verify(token, process.env.SECRET_KEY);
            let signatureToken = token.slice(token.length - 43, token.length);
            let resultUser = await colNguoiDung.find({_id: ObjectId(tokenResult.payload.userId), trangThaiKhoa:false,token:signatureToken,vaiTro:type}).next();
            client.close();
            if (resultUser === null) {
                //console.log('khong hl')
                res.status(200).json({
                    status: "fail",
                    message: 'Token không hợp lệ !',
                }); return;
            }
            //console.log('ok')
            res.status(200).json({
                status:"ok",
                message: 'Token hợp lệ !',
                fbUser:resultUser.idFB ? true: false,
            });
        } catch (e) {
            client.close();console.log(e);
            res.status(200).json({
                status: "fail",
                message: e.toString()
            });
        }
    },

    DangXuat: async function (req, res, next) {
        const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
        try {
            // var token = req.query.token;
            var token = req.header('token');
            await client.connect();
            const db = client.db(DbName);
            const colNguoiDung = db.collection('NguoiDung');
            let tokenResult = await jwt.verify(token, process.env.SECRET_KEY);
            let resultUser = await colNguoiDung.updateOne({_id: ObjectId(tokenResult.payload.userId)},{
                $set:{
                    token:''
                }
            });
            client.close();
            res.status(200).json({
                status:"ok",
                message: 'Đăng xuất thành công !',
            });
        } catch (err) {
            res.status(200).json({
                status: "fail",
                message: 'Token không hợp lệ !'
            });
        }
    },

    //Kiểm tra mọi user
    KiemTraTokenNguoiDung: async function (req, res, next) {
        const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
        const type = parseInt(req.query.intType); ///Dùng để phân biệt loại người dùng
        //console.log(type);
        try {
            // var token = req.query.token;
            let token = req.header('token');
            await client.connect();
            const db = client.db(DbName);
            const colNguoiDung = db.collection('NguoiDung');
            let resultToken = await jwt.verify(token, process.env.SECRET_KEY);
            let signatureToken = token.slice(token.length - 43, token.length);
            let resultUser = await colNguoiDung.find({_id: ObjectId(resultToken.payload.userId), trangThaiKhoa:false,token:signatureToken}).next();
            client.close();
            if(resultUser === null){
                res.status(401).json({
                    status: "fail",
                    message: 'Token không hợp lệ !',
                    vaiTro:type
                });return ;
            }

            req.tenDangNhap = resultUser.tenDangNhap;
            req.nguoiDungId = resultToken.payload.userId;
            req.vaiTro = resultToken.payload.vaiTro;
            next();
        }catch(e) {
            console.log(e)
            res.status(401).json({
                status: "fail",
                message: 'Token không hợp lệ !',
                vaiTro:type
            });
        }
        client.close();
    },

    KiemTraTokenAdmin: async function (req, res, next) {
        const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
        try {
            // var token = req.query.token;
            let token = req.header('token');
            await client.connect();
            const db = client.db(DbName);
            const colNguoiDung = db.collection('NguoiDung');
            let resultToken = await jwt.verify(token, process.env.SECRET_KEY);
            let signatureToken = token.slice(token.length - 43, token.length);
            let resultUser = await colNguoiDung.find({_id: ObjectId(resultToken.payload.userId), trangThaiKhoa:false,token:signatureToken,vaiTro:0}).next();
            client.close();
            if(resultUser === null){
                res.status(401).json({
                    status: "fail",
                    message: 'Token không hợp lệ !',
                    vaiTro:0
                });return ;
            }
            next();
        }catch(e) {
            client.close();
            res.status(401).json({
                status: "fail",
                message: 'Token không hợp lệ !',
                vaiTro:0
            });
        }
    },

    KiemTraToken_Admin_KiemDuyetVien: async function (req, res, next) {
        const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
        try {
            // var token = req.query.token;
            let token = req.header('token');
            console.log(token);
            await client.connect();
            const db = client.db(DbName);
            const colNguoiDung = db.collection('NguoiDung');
            let resultToken = await jwt.verify(token, process.env.SECRET_KEY);
            let signatureToken = token.slice(token.length - 43, token.length);
            let resultUser = await colNguoiDung.find({_id: ObjectId(resultToken.payload.userId), trangThaiKhoa:false,token:signatureToken,vaiTro:{'$in':[0,3]}}).next();
            client.close();
            if(resultUser === null){
                //console.log('token1')
                res.status(401).json({
                    status: "fail",
                    message: 'Token không hợp lệ !',
                    vaiTro:3
                });return ;
            }
            next();
        }catch(e) {
            console.log(e)
            client.close();
            res.status(200).json({
                status: "fail",
                message: 'Token không hợp lệ !',
                vaiTro:3
            });
        }
    },

    KiemTraTokenChuShop: async function (req, res, next) {
        const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
        try {
            // var token = req.query.token;
            let token = req.header('token');
            await client.connect();
            const db = client.db(DbName);
            const colNguoiDung = db.collection('NguoiDung');
            let resultToken = await jwt.verify(token, process.env.SECRET_KEY);
            let signatureToken = token.slice(token.length - 43, token.length);
            let resUser = await colNguoiDung.find({_id: ObjectId(resultToken.payload.userId), trangThaiKhoa:false,token:signatureToken,vaiTro:1}).next();
            client.close();
            if(resUser === null){
                res.status(401).json({
                    status: "fail",
                    message: 'Token không hợp lệ !',
                    vaiTro:1
                });return ;
            }
            req.chuShopId = resultToken.payload.userId;
            req.vaiTro = resultToken.payload.vaiTro;
            req.quyen = resUser.quyen;

            next();
        } catch (e) {
            client.close();
            res.status(401).json({
                status: "fail",
                message: 'Token không hợp lệ !',
                vaiTro:1
            });
        }
    },

    KiemTraTokenKhachHang: async function (req, res, next) {
        const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
        try {
            // var token = req.query.token;
            var token = req.header('token');
            await client.connect();
            const db = client.db(DbName);
            const colNguoiDung = db.collection('NguoiDung');
            let resultToken = await jwt.verify(token, process.env.SECRET_KEY);
            let signatureToken = token.slice(token.length - 43, token.length);
            let resultUser = await colNguoiDung.find({_id: ObjectId(resultToken.payload.userId), trangThaiKhoa:false,token:signatureToken,vaiTro:2}).next();
            client.close();

            if(resultUser === null){
                res.status(401).json({
                    status: "fail",
                    message: 'Token không hợp lệ !',
                    vaiTro:2
                });return ;
            }
            req.khachHangId = resultToken.payload.userId;
            req.vaiTro = resultToken.payload.vaiTro;
            next();
        } catch (e) {
            console.log(e);
            res.status(401).json({
                status: "fail",
                message: 'Token không hợp lệ !',
                vaiTro:2
            });
        }
    },

    KiemTraMatKhauHienTaiCuaNguoiDung: async function (req, res, next) {
        const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
        try{
            let matKhau = req.body.matkhau;
            let token = req.header('token');
            let tokenResult = await jwt.verify(token, process.env.SECRET_KEY);
            const userId = ObjectId(tokenResult.payload.userId);
            await client.connect();
            const db = client.db(DbName);
            const colNguoiDung = db.collection('NguoiDung');
            //Tìm user
            let resultUser = await colNguoiDung.find({_id: userId}).next();
            client.close();
            let soSanhPass = bcrypt.compareSync(matKhau,resultUser.matKhau);
            if(!soSanhPass){
                res.status(200).json({
                    status: "fail",
                    message: "Mật khẩu hiện tại không chính xác !",
                });return ;
            }
            res.status(200).json({
                status: "ok",
                message: "Mật khẩu hiện tại chính xác !",
            });
        }
        catch(e){
            res.status(200).json({
                status: "fail",
                message: 'Mật khẩu hiện tại không chính xác !',
            });
        }
    },

    //Gửi mail xác thực cho khách hàng(xác thực email khách hàng tại trang thông tin khách hàng)
    GuiMailXacThucEmailChoKH: async function (req, res, next) {
        const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
        try{
            const token = req.header('token');
            await client.connect();
            const db = client.db(DbName);
            const colNguoiDung = db.collection('NguoiDung');
            let tokenResult = await jwt.verify(token, process.env.SECRET_KEY);
            let resultUser = await colNguoiDung.find({_id: ObjectId(tokenResult.payload.userId), trangThaiKhoa:false}).next();
            let payload = {
                idNguoiDung:resultUser._id,
                email:resultUser.email
            }
            let resultEmail = await colNguoiDung.find({_id:{$ne:ObjectId(tokenResult.payload.userId)} ,email:resultUser.email, xacThucEmail:true, trangThaiKhoa:false}).next();
            if(resultEmail !== null){
                res.status(200).json({
                    status: 'fail',
                    message: 'Email này đã được xác thực bởi tài khoản khác, vui lòng dùng email khác !'
                }); return;
            }
            const tokenXacThuc = await jwt.sign({payload}, process.env.SECRET_KEY, {expiresIn: 60 * 15}); //Hết hạn trong 15 phút
            let r = await colNguoiDung.updateOne({_id: ObjectId(tokenResult.payload.userId), trangThaiKhoa:false},{
                $set:{
                    tokenXacThucEmail:tokenXacThuc
                }
            });
            client.close();
            guiMailXacThucEmailKhachHang(resultUser.email,tokenXacThuc,resultUser.tenDangNhap);
            res.status(200).json({
                status: 'ok',
                message: 'Email đã được gửi, vui lòng kiểm tra email !'
            });
        }
        catch(e){
            client.close();
            res.status(200).json({
                status: "fail",
                message: e.toString()
            });
        }

    },

    XacThucEmail: async function (req, res, next) {
        const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
        try{
            const token = req.body.token;
            await client.connect();
            const db = client.db(DbName);
            const colNguoiDung = db.collection('NguoiDung');
            let tokenResult = await jwt.verify(token, process.env.SECRET_KEY);
            const {idNguoiDung,email} = tokenResult.payload;
            let resultUser = await colNguoiDung.find({_id: ObjectId(idNguoiDung),tokenXacThucEmail:token, trangThaiKhoa:false}).next();
            if(resultUser === null){
                res.status(200).json({
                    status: 'fail',
                    message: 'Xác thực email thất bại !'
                }); return;
            }
            let r = await colNguoiDung.updateOne({_id: ObjectId(idNguoiDung),trangThaiKhoa:false},{
                $set:{
                    xacThucEmail:true,
                    tokenXacThucEmail:''
                }
            });
            client.close();
            res.status(200).json({
                status: 'ok',
                message: 'Xác thực email thành công !'
            });
        }
        catch(e){
            client.close();
            res.status(200).json({
                status: "fail",
                message: e.toString()
            });
        }

    },

    //Quên mật khẩu
    GuiLinkQuenMatKhauChoKH: async function (req, res, next) {
        const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
        try{
            const {email} = req.body;
            await client.connect();
            const db = client.db(DbName);
            const colNguoiDung = db.collection('NguoiDung');
            let resultUser = await colNguoiDung.find({email:email,xacThucEmail:true, trangThaiKhoa:false}).next();
            if(resultUser === null){
                res.status(200).json({
                    status: 'ok',
                    message: 'Email đặt lại mật khẩu đã được gửi, xin vui lòng kiểm tra hộp thư của bạn !'
                }); return;
            }
            let payload = {
                idNguoiDung:resultUser._id
            }
            const tokenQuenMK = await jwt.sign({payload}, process.env.SECRET_KEY, {expiresIn: 60 * 15}); //Hết hạn trong 15 phút
            let r = await colNguoiDung.updateOne({_id: ObjectId(resultUser._id), trangThaiKhoa:false},{
                $set:{
                    forgotPassToken:tokenQuenMK
                }
            });
            client.close();
            guiMailDoiMatKhauChoKhachHang(resultUser.email,tokenQuenMK,resultUser.tenDangNhap);
            res.status(200).json({
                status: 'ok',
                message: 'Email đặt lại mật khẩu đã được gửi, xin vui lòng kiểm tra hộp thư của bạn !'
            });
        }
        catch(e){
            client.close();
            res.status(200).json({
                status: "fail",
                message: e.toString()
            });
        }

    },

    KiemTraTokenDoiMK: async function (req, res, next) {
        const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
        try{
            const {token} = req.body;
            await client.connect();
            const db = client.db(DbName);
            const colNguoiDung = db.collection('NguoiDung');
            let resToken = await colNguoiDung.find({forgotPassToken: token, trangThaiKhoa:false}).next();
            if(resToken === null){
                client.close();
                res.status(200).json({
                    status: 'fail',
                    message: 'Token đổi mật khẩu hết hiệu lực !'
                }); return;
            }
            let tokenResult = await jwt.verify(token, process.env.SECRET_KEY);
            if(tokenResult.payload){
                res.status(200).json({
                    status: 'ok',
                    message: 'Token đổi mật khẩu còn hiệu lực !'
                }); return;
            }
            res.status(200).json({
                status: 'fail',
                message: 'Token đổi mật khẩu hết hiệu lực !'
            });
        }
        catch(e){
            res.status(200).json({
                status: "fail",
                message: e.toString()
            });
        }
    },

    ResetMatKhau: async function (req, res, next) {
        const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
        try{
            const {token, matkhau }= req.body;
            await client.connect();
            const db = client.db(DbName);
            const colNguoiDung = db.collection('NguoiDung');
            let resultUser = await colNguoiDung.find({forgotPassToken: token, trangThaiKhoa:false}).next();
            if(resultUser === null){
                client.close();
                res.status(200).json({
                    status: 'fail',
                    message: 'Xác thực email thất bại !'
                }); return;
            }
            let salt = bcrypt.genSaltSync(5);
            let hash = bcrypt.hashSync(matkhau, salt);
            let r = await colNguoiDung.updateOne({_id: resultUser._id,trangThaiKhoa:false},{
                $set:{
                    matKhau: hash,
                    forgotPassToken:''
                }
            });
            client.close();
            res.status(200).json({
                status: 'ok',
                message: 'Xác thực email thành công !'
            });
        }
        catch(e){
            res.status(200).json({
                status: "fail",
                message: e.toString()
            });
        }

    },

}

async function guiMailXacThucEmailKhachHang(email, token,tenDangNhap) {
    //console.log(NodemailerTransport);
    let link = clientLink + 'xacnhanemail/' + token;
    let transporter = nodemailer.createTransport(NodemailerTransport);
    let info = await transporter.sendMail({
        from: '"Bestbuyvn"<foo@example.com>', // sender address
        to: email, // list of receivers
        subject: "Bestbuyvn - Xác thực email", // Subject line
        text: "Xác thực email", // plain text body
        html: "</b><div style='color:black'>Xin chào <b><u>"+tenDangNhap+"</u></b>, xin vui lòng truy cập vào link sau để xác thực email:</div>" +
            "<div> <b><a href=" + link + " style='color: blue'><u>" + link + "</u></a></b> </div>" +
            "</div>" // html body
    });
    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
}

async function guiMailDoiMatKhauChoKhachHang(email, token,tenDangNhap) {
    let link = clientLink + 'resetmatkhau/' + token;
    let transporter = nodemailer.createTransport(NodemailerTransport);
    let info = await transporter.sendMail({
        from: '"Besbuyvn"<foo@example.com>', // sender address
        to: email, // list of receivers
        subject: "Besbuyvn - Đặt lại mật khẩu", // Subject line
        text: "Đặt lại mật khẩu", // plain text body
        html: "</b><div style='color:black'>Xin chào <b><u>"+tenDangNhap+"</u></b>, xin vui lòng truy cập vào link sau để đặt lại mật khẩu:</div>" +
            "<div> <b><a href=" + link + " style='color: blue'><u>" + link + "</u></a></b> </div>" +
            "</div>" // html body
    });
    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
}
