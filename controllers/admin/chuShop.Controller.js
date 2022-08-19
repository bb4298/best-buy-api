const {DbUrl, DbName, defaultImage} = require('../../configs/constant');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const bcrypt = require('bcrypt');
const {BoDau} = require('../../utils/hamHoTro');
module.exports = {
    //Thao tác CRUD chủ shop của admin
    LayChuShopTheoTrang: async function (req, res) {
        const SoItemMoiPageAdmin = parseInt(global.SoItemMoiPageAdmin);
        const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
        const page = req.params.page;
        try {
            await client.connect();
            const db = client.db(DbName);
            const colNguoiDung = db.collection('NguoiDung');
            let count = await colNguoiDung.find({vaiTro: 1, trangThaiKhoa: false}).toArray();
            let soTrang = Math.ceil(count.length / SoItemMoiPageAdmin);
            let arrNguoiDung = await colNguoiDung.find({vaiTro: 1}).sort({_id: -1}).limit(SoItemMoiPageAdmin).skip(SoItemMoiPageAdmin * page)
                .project({'matKhau': 0, 'token': 0, 'forgotPassToken': 0, 'tokenXacThucEmail': 0}).toArray();
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

    LayChuShopTheoId: async function (req, res) {
        const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
        const id = ObjectId(req.query.id);
        try {
            await client.connect();
            const db = client.db(DbName);
            const colNguoiDung = db.collection('NguoiDung');
            let resultChuShop = await colNguoiDung.find({vaiTro: 1, _id: id}).next();
            client.close();
            if (resultChuShop === null) {
                res.status(200).json({
                    status: 'fail',
                    message: 'Không có dữ liệu !'
                });
            } else {
                res.status(200).json(resultChuShop);
            }
        } catch (err) {
            res.status(200).json({
                status: "fail",
                message: err.toString()
            });
        }
    },

    TimKiemChuShop: async function (req, res) {
        const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
        const tuKhoa = BoDau(req.query.tukhoa);
        try {
            await client.connect();
            const db = client.db(DbName);
            const col = db.collection('NguoiDung');
            let arrChuShop = await col.find({
                '$or': [
                    {
                        vaiTro: 1,
                        tenDangNhap: {'$regex': tuKhoa, '$options': '$i'}
                    },
                    {
                        vaiTro: 1,
                        lowerCase: {'$regex': tuKhoa, '$options': '$i'}
                    },
                    {
                        vaiTro: 1,
                        email: {'$regex': tuKhoa, '$options': '$i'}
                    },
                    {
                        vaiTro: 1,
                        sdt: {'$regex': tuKhoa, '$options': '$i'}
                    }
                ]
            }).sort({_id: -1}).limit(15).toArray();
            client.close();
            res.status(200).json({
                status: "ok",
                data: arrChuShop
            });
        } catch (err) {
            res.status(200).json({
                status: "fail",
                message: err.toString()
            });
        }
    },

    ThemChuShop: async function (req, res) {
        const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
        try {
            await client.connect();
            const db = client.db(DbName);
            const colNguoiDung = db.collection('NguoiDung');
            const colCauHinh = db.collection('CauHinh');

            //Kiểm tra user đã tồn tại hay chưa
            let resultUser = await colNguoiDung.find({tenDangNhap: req.body.tendangnhap.toLowerCase()}).next();
            if (resultUser !== null) {
                res.status(200).json({
                    status: 'fail',
                    message: 'Tên đăng nhập đã tồn tại, vui lòng đặt tên khác !'
                });
                return;
            }

            const resPhiBanHangMacDinh = await colCauHinh.find({type:0}).next();
            const {phiBanHangMacDinh} = resPhiBanHangMacDinh;
            //Mã hóa mật khẩu trước khi add vào db
            let salt = bcrypt.genSaltSync(5);
            let hash = bcrypt.hashSync(req.body.matkhau, salt);
            let user = {
                tenDangNhap: req.body.tendangnhap.toLowerCase(),
                matKhau: hash,
                sdt: '',
                email: '',
                hoTen: '',
                lowerCase: '',
                ngaySinh: new Date(),
                gioiTinh: true,
                anh: defaultImage,
                thongTinShop: {
                    tenShop: 'Thay đổi tên shop tại đây',
                    anhGioiThieu: [],
                    moTa: 'Thay đổi mô tả tại đây'
                },
                luotXem: 0,
                vaiTro: 1,
                diaChi: {
                    ID_Tinh: 1,
                    ID_Quan: 1,
                    ID_Phuong: 1,
                    tenDuong: '',
                    tenTinh:'Thành phố Hà Nội'
                },
                ppThanhToan: [
                    {
                        id: '12345',
                        tenPhuongThuc: 'Paypal',
                        email: '',
                        kichHoat: false
                    }
                ],
                phiBanHang:phiBanHangMacDinh,
                phiNoHienTai:0,
                quyen: req.body.quyen,
                token: '',
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

    SuaChuShop: async function (req, res) {
        const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
        try {
            await client.connect();
            const db = client.db(DbName);
            const colNguoiDung = db.collection('NguoiDung');

            let id = ObjectId(req.body.id);
            let quyen = req.body.quyen;
            let phiBanHang = req.body.phiBanHang;

            // Cập nhật chủ shop
            let capNhat = await colNguoiDung.updateOne({_id: id},
                {
                    $set: {
                        quyen: quyen,
                        phiBanHang: parseInt(phiBanHang)
                    }
                });
            client.close();
            if (capNhat.result.ok == 1) {
                res.status(200).json({
                    status: "ok",
                    message: 'Thay đổi thành công !'
                });
            } else {
                res.status(200).json({
                    status: "ok",
                    message: 'Thay đổi thất bại !'
                });
            }
        } catch (err) {
            res.status(200).json({
                status: "fail",
                message: err.toString()
            });
        }
    },

}