const jwt = require('jsonwebtoken');
const {DbUrl, DbName, defaultImage} = require('../../configs/constant');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const bcrypt = require('bcrypt');
module.exports = {
    LayLichSuTimKiemKH: async function (req, res, next) {
        const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
        try {
            let token = req.header('token');
            let tokenResult = await jwt.verify(token, process.env.SECRET_KEY);
            // console.log('payload');
            // console.log(resultToken);
            if (tokenResult.payload === undefined || tokenResult.payload.vaiTro !== 2) {
                res.status(200).json({
                    status: "fail",
                    message: 'Token không hợp lệ !'
                });
                return;
            }
            const userId = ObjectId(tokenResult.payload.userId);
            await client.connect();
            const db = client.db(DbName);
            const colLichSuTimKiem = db.collection('LichSuTimKiem');

            let resultLichSuTK = await colLichSuTimKiem.find({ID_NguoiDung: userId}).sort({updateAt: -1}).limit(5).toArray();
            client.close();
            //console.log('resultLichSuTK')
            //console.log(JSON.stringify(resultLichSuTK))
            res.status(200).json(resultLichSuTK);
        } catch (err) {
            res.status(200).json({
                status: "fail",
                message: err.toString()
            });
        }
    },

    DangKyKhachHang: async function (req, res, next) {
        const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
        try {
            //console.log(req.body);
            const {tentaikhoan, email, hoten, sdt, matkhau} = req.body;
            await client.connect();
            const db = client.db(DbName);
            const colNguoiDung = db.collection('NguoiDung');
            let resKetQuaTK = await colNguoiDung.find({tenDangNhap: tentaikhoan}).next();
            //let resKetQuaEmail = await colNguoiDung.find({email: email}).next();
            if (resKetQuaTK !== null /*|| resKetQuaEmail !== null*/) {
                res.status(200).json({
                    status: 'fail',
                    message: 'Tài khoản đã tồn tại, vui lòng dùng tài khoản khác !'
                });
                return;
            }
            let salt = bcrypt.genSaltSync(5);
            let hash = bcrypt.hashSync(matkhau, salt);
            let nguoiDung = {
                tenDangNhap: tentaikhoan,
                matKhau: hash,
                sdt: sdt,
                email: email,
                xacThucEmail:false,
                tokenXacThucEmail:'',
                hoTen: hoten,
                lowerCase: '',
                ngaySinh: new Date(),
                gioiTinh: true,
                anh: defaultImage,
                gioHang:[],
                vaiTro: 2,
                token: '',
                forgotPassToken: '',
                trangThaiKhoa: false
            }
            let r = await colNguoiDung.insertOne(nguoiDung);
            client.close();
            if (r.insertedCount < 1) {
                res.status(200).json({
                    status: 'fail',
                    message: 'Đăng ký thất bại !'
                });
                return;
            }
            res.status(200).json({
                status: 'ok',
                message: 'Đăng ký thành công !'
            });

        } catch (e) {
            console.log(e);
            res.status(200).json({
                status: "fail",
                message: e.toString()
            });
        }
    },

    CheckTaiKhoanKhachHangTonTai: async function (req, res, next) {
        const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
        try {
            const {tendangnhap} = req.body;
           // console.log(tendangnhap)
            await client.connect();
            const db = client.db(DbName);
            const colNguoiDung = db.collection('NguoiDung');
            let resKetQua = await colNguoiDung.find({tenDangNhap: tendangnhap}).next();
            client.close();
            ////console.log(resKetQua);
            //console.log(typeof resKetQua);
            if (resKetQua !== null) {
                res.status(200).json({
                    status: 'fail',
                    message: 'Tên tài khoản đã tồn tại !'
                });
                return;
            }
            if (!/^[a-zA-Z0-9_-]{6,18}$/.test(tendangnhap)) {
                res.status(200).json({
                    status: 'fail',
                    message: 'Tên tài khoản phải thuộc a-z,A-Z,0-9, từ 6-18 kí tự ! !'
                });
                return;
            }
            res.status(200).json({
                status: 'ok',
                message: 'Tên tài khoản hợp lệ !'
            });
        } catch (e) {
            console.log(e)
            res.status(200).json({
                status: "fail",
                message: e.toString()
            });
        }
    },

    CheckEmailKhacHangTonTai: async function (req, res, next) {
        const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
        try {
            const {email} = req.body;
            await client.connect();
            const db = client.db(DbName);
            const colNguoiDung = db.collection('NguoiDung');
            let resKetQua = await colNguoiDung.find({email: email}).next();
            client.close();
            if (resKetQua !== null) {
                res.status(200).json({
                    status: 'fail',
                    message: 'Tên email đã tồn tại !'
                });
                return;
            }
            if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
                res.status(200).json({
                    status: 'fail',
                    message: 'Email không hợp lệ !'
                });
                return;
            }
            res.status(200).json({
                status: 'ok',
                message: 'Tên email hợp lệ !'
            });
        } catch (e) {
            res.status(200).json({
                status: "fail",
                message: e.toString()
            });
        }
    },

    //Thao tác mua hàng


}