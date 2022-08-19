const jwt = require('jsonwebtoken');
const {DbUrl, DbName} = require('../../configs/constant');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const {BoDau} = require('../../utils/hamHoTro');
module.exports = {
    //Thao tác CRUD danh mục của admin

    LayDanhMucTheoTrang: async function (req, res, next) {
        let SoItemMoiPageAdmin = global.SoItemMoiPageAdmin;
        const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
        try {
            const page = req.params.page;
            await client.connect();
            const db = client.db(DbName);
            const colDanhMuc = db.collection('DanhMuc');
            let count = await colDanhMuc.countDocuments();
            let soTrang = Math.ceil(count / SoItemMoiPageAdmin);
            let arrDanhMuc = await colDanhMuc.find().sort({_id: -1}).
            limit(SoItemMoiPageAdmin).skip(SoItemMoiPageAdmin * page).toArray();
            client.close();
            res.status(200).json({
                status: "ok",
                data: arrDanhMuc,
                soTrang: soTrang
            });
        } catch (err) {
            res.status(200).json({
                status: "fail",
                message: err.toString()
            });
        }
    },

    LayDanhMucTheoId: async function (req, res, next) {
        const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
        try {
            const id = ObjectId(req.query.id);
            await client.connect();
            const db = client.db(DbName);
            const colDanhMuc = db.collection('DanhMuc');
            let resultDanhMuc = await colDanhMuc.find({_id: id}).next();
            client.close();
            if (resultDanhMuc === null) {
                res.status(200).json({
                    status: 'fail',
                    message: 'Không có dữ liệu !'
                });
            } else {
                res.status(200).json(resultDanhMuc);
            }
        } catch (err) {
            res.status(200).json({
                status: "fail",
                message: err.toString()
            });
        }
    },

    TimKiemDanhMuc: async function (req, res, next) {
        const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
        const tuKhoa = BoDau(req.query.tukhoa);
        try {
            await client.connect();
            const db = client.db(DbName);
            const col = db.collection('DanhMuc');
            let arrDanhMuc = await col.find({
                lowerCase: {
                    '$regex': tuKhoa,
                    '$options': '$i'
                }
            }).sort({_id: -1}).limit(15).toArray();
            client.close();
            res.status(200).json({
                status: "ok",
                data: arrDanhMuc
            });
        } catch (err) {
            res.status(200).json({
                status: "fail",
                message: err.toString()
            });
        }
    },

    ThemDanhMuc: async function (req, res, next) {
        const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
        try {
            await client.connect();
            const db = client.db(DbName);
            const colDanhMuc = db.collection('DanhMuc');
            //Kiểm tra tên danh mục đã tồn tại hay chưa
            let result = await colDanhMuc.find({lowerCase: BoDau(req.body.tendanhmuc)}).next();
            if (result != null) {
                res.status(200).json({
                    status: 'fail',
                    message: 'Tên danh mục đã tồn tại, vui lòng đặt tên khác !'
                });
            }
            else {
                //Tạo parameter danhmuc
                let danhmuc = {
                    tenDanhMuc: req.body.tendanhmuc,
                    lowerCase: BoDau(req.body.tendanhmuc),
                    anh: req.body.anh,
                    trangThaiKhoa: false
                }
                let result = await colDanhMuc.insertOne(danhmuc);
                client.close();
                if (result.insertedCount > 0) {
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
            }
        } catch (err) {
            res.status(200).json({
                status: "fail",
                message: err.toString()
            });
        }
    },

    SuaDanhMuc: async function (req, res, next) {
        // const resultToken = await jwt.verify(req.header('token'), process.env.SECRET_KEY);
        // const userId = resultToken.payload.userId;
        console.log(req.body.id);
        const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
        try {
            await client.connect();
            const db = client.db(DbName);
            const colDanhMuc = db.collection('DanhMuc');
            //Kiểm tra tên danh mục đã tồn tại hay chưa
            let result = await colDanhMuc.find({
                lowerCase: BoDau(req.body.tendanhmuc),
                _id: {$ne: ObjectId(req.body.id)},
                trangThaiXoa:false
            }).next();
            console.log(result);
            if (result != null) {
                res.status(200).json({
                    status: 'fail',
                    message: 'Tên danh mục đã tồn tại, vui lòng đặt tên khác !'
                });
            } else {
                console.log(req.body.id);
                let result = await colDanhMuc.updateOne(
                    {_id: ObjectId(req.body.id)},
                    {
                        $set: {
                            tenDanhMuc: req.body.tendanhmuc,
                            lowerCase: BoDau(req.body.tendanhmuc),
                            anh: req.body.anh,
                        }
                    }
                );
                client.close();
                // console.log(result);
                res.status(200).json({
                    status: 'ok',
                    message: 'Sửa thành công !'
                });
            }
        } catch (err) {
            res.status(200).json({
                status: "fail",
                message: err.toString()
            });
        }
    },

    KhoaDanhMuc: async function (req, res, next) {
        const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
        try {
            let id = ObjectId(req.body.id);
            await client.connect();
            const db = client.db(DbName);
            const colDanhMuc = db.collection('DanhMuc');

            let resSoLuongDM = await colDanhMuc.find({trangThaiKhoa: false}).toArray();
            if(resSoLuongDM.length<10){
                res.status(200).json({
                    status: "fail",
                    message: 'Số lượng danh mục hiển thị không được nhỏ hơn 10 !'
                }); return;
            }

            let lockResult = await colDanhMuc.updateOne({_id: id}, {$set: {trangThaiKhoa: true}});
            client.close();
            if (lockResult.result.ok == 1) {
                res.status(200).json({
                    status: "ok",
                    message: 'Khóa thành công !',
                    type:true
                });
            } else {
                res.status(200).json({
                    status: "ok",
                    message: 'Khóa thất bại !'
                });
            }
        } catch (err) {
            res.status(200).json({
                status: "fail",
                message: err.toString()
            });
        }
    },

    MoKhoaDanhMuc: async function (req, res, next) {
        const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
        try {
            await client.connect();
            const db = client.db(DbName);
            const colDanhMuc = db.collection('DanhMuc');

            let id = ObjectId(req.body.id);
            // Cập nhật manager
            let lockResult = await colDanhMuc.updateOne({_id: id}, {$set: {trangThaiKhoa: false}});
            client.close();
            if (lockResult.result.ok == 1) {
                res.status(200).json({
                    status: "ok",
                    message: 'Mở khóa thành công !',
                    type:false
                });
            } else {
                res.status(200).json({
                    status: "ok",
                    message: 'Mở khóa thất bại !'
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