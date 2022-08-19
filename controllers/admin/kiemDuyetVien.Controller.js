const {DbUrl, DbName,defaultImage} = require('../../configs/constant');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const bcrypt = require('bcrypt');
const {BoDau} = require('../../utils/hamHoTro');
module.exports = {
    //Thao tác CRUD kiểm duyệt viên của admin
    LayKiemDuyetVienTheoTrang: async function (req, res) {
        var SoItemMoiPageAdmin = parseInt(global.SoItemMoiPageAdmin);
        const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
        const page = req.params.page;
        try {
            await client.connect();
            const db = client.db(DbName);
            const colNguoiDung = db.collection('NguoiDung');
            let count = await colNguoiDung.find({vaiTro:3,trangThaiKhoa:false}).toArray();
            let soTrang = Math.ceil(count.length / SoItemMoiPageAdmin);
            let arrNguoiDung = await colNguoiDung.find({vaiTro: 3}).sort({_id: -1}).limit(SoItemMoiPageAdmin).skip(SoItemMoiPageAdmin * page).toArray();
            client.close();
            res.status(200).json({
                status: "ok",
                data: arrNguoiDung,
                soTrang: soTrang
            });
        } catch (err) {
            res.status(200).json({
                status: "fail",
                message: err.toString()
            });
        }
    },

    LayKiemDuyetVienTheoId: async function (req, res) {
        const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
        const id = ObjectId(req.query.id);
        try {
            await client.connect();
            const db = client.db(DbName);
            const colNguoiDung = db.collection('NguoiDung');
            let resultKiemDuyetVien = await colNguoiDung.find({vaiTro: 3, _id: id}).next();
            client.close();
            if (resultKiemDuyetVien === null) {
                res.status(200).json({
                    status: 'fail',
                    message: 'Không có dữ liệu !'
                });
            } else {
                res.status(200).json(resultKiemDuyetVien);
            }
        } catch (err) {
            res.status(200).json({
                status: "fail",
                message: err.toString()
            });
        }
    },

    TimKiemKiemDuyetVien: async function (req, res) {
        const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
        const tuKhoa = BoDau(req.query.tukhoa);
        try {
            await client.connect();
            const db = client.db(DbName);
            const col = db.collection('NguoiDung');
            let arrKiemDuyetVien = await col.find({
                '$or': [
                    {
                        vaiTro: 3,
                        tenDangNhap: {'$regex': tuKhoa, '$options': '$i'}
                    },
                    {
                        vaiTro: 3,
                        lowerCase: {'$regex': tuKhoa, '$options': '$i'}
                    },
                    {
                        vaiTro: 3,
                        email: {'$regex': tuKhoa, '$options': '$i'}
                    },
                    {
                        vaiTro: 3,
                        sdt: {'$regex': tuKhoa, '$options': '$i'}
                    }
                ]
            }).sort({_id: -1}).limit(15).toArray();
            client.close();
            res.status(200).json({
                status: "ok",
                data: arrKiemDuyetVien
            });
        } catch (err) {
            res.status(200).json({
                status: "fail",
                message: err.toString()
            });
        }
    },

    ThemKiemDuyetVien: async function (req, res) {
        const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
        try {
            await client.connect();
            const db = client.db(DbName);
            const colNguoiDung = db.collection('NguoiDung');
            //Kiểm tra user đã tồn tại hay chưa
            let resultUser = await colNguoiDung.find({tenDangNhap: req.body.tendangnhap.toLowerCase()}).next();
            if (resultUser !== null) {
                res.status(200).json({
                    status: 'fail',
                    message: 'Tên đăng nhập đã tồn tại, vui lòng đặt tên khác !'
                }); return ;
            }
            //Mã hóa mật khẩu trước khi add vào db
            let salt = bcrypt.genSaltSync(5);
            let hash = bcrypt.hashSync(req.body.matkhau, salt);
            let user = {
                tenDangNhap: req.body.tendangnhap.toLowerCase(),
                matKhau: hash,
                sdt:'',
                email:'',
                hoTen:'',
                lowerCase:'',
                ngaySinh: new Date(),
                gioiTinh: true,
                anh:defaultImage,
                vaiTro: 3,
                quyen: req.body.quyen,
                token:'',
                forgotPassToken: '',
                trangThaiKhoa: false
            }
            let r = await colNguoiDung.insertOne(user);
            client.close();
            if (r.insertedCount > 0) {
                res.status(200).json({
                    status: 'ok',
                    message: 'Thêm thành công !'
                });
            } else {
                res.status(200).json({
                    status: 'fail',
                    message: 'Thêm thất bại !'
                });
            }
        } catch (e) {
            res.status(200).json({
                status: "fail",
                message: e.toString()
            });
        }
    },





}