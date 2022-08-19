const {DbUrl,DbName} = require('../../configs/constant');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const {BoDau} = require('../../utils/hamHoTro');
const shortId = require('short-id');
module.exports = {
    //Thao tác CRUD bài viết của admin
    LayBaiVietTheoTrang: async function (req, res, next) {
        var SoItemMoiPageAdmin = parseInt(global.SoItemMoiPageAdmin);
        const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
        const page = req.params.page;
        try {
            await client.connect();
            const db = client.db(DbName);
            const colBaiViet = db.collection('BaiViet');
            let count = await colBaiViet.find({trangThaiXoa:false}).toArray();
            let soTrang = Math.ceil(count.length / SoItemMoiPageAdmin);
            let arrBaiViet = await colBaiViet.find({trangThaiXoa:false}).sort({_id: -1}).limit(SoItemMoiPageAdmin).skip(SoItemMoiPageAdmin * page).toArray();
            client.close();
            console.log(soTrang);
            res.status(200).json({
                status: "ok",
                data: arrBaiViet,
                soTrang: soTrang
            });
        } catch (err) {
            res.status(200).json({
                status: "fail",
                message: err.toString()
            });
        }
    },

    LayBaiVietTheoId: async function (req, res, next) {
        const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
        const id = req.query.id;
        try {
            await client.connect();
            const db = client.db(DbName);
            const colBaiViet = db.collection('BaiViet');
            let resultBaiViet = await colBaiViet.find({id: id}).next();

            if (resultBaiViet === null) {
                res.status(200).json({
                    status: 'fail',
                    message: 'Không có dữ liệu !'
                });
            } else {
                //console.log('poklll');
                let timestamp = ObjectId(resultBaiViet._id).getTimestamp();
                let tangLuotXem = await colBaiViet.updateOne(
                    {_id: ObjectId(resultBaiViet._id)},
                    {
                        $set: {
                            soLuotXem: parseInt(resultBaiViet.soLuotXem)+1,
                        }
                    }
                );
                client.close();
               // console.log('pok');
                res.status(200).json({
                    status: 'ok',
                    data: resultBaiViet,
                    time:timestamp
                });
            }
        } catch (err) {
            res.status(200).json({
                status: "fail",
                message: err.toString()
            });
        }
    },

    TimKiemBaiViet: async function (req, res, next) {
        const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
        const tuKhoa = BoDau(req.query.tukhoa);
        try {
            await client.connect();
            const db = client.db(DbName);
            const col = db.collection('BaiViet');
            let arrBaiViet = await col.find({
                '$or': [
                    {
                        trangThaiXoa:false,
                        lowerCase: {'$regex': tuKhoa, '$options': '$i'}
                    },
                    {
                        trangThaiXoa:false,
                        id:{'$regex': tuKhoa.toUpperCase(), '$options': '$i'}
                    }
                ]
            }).sort({_id: -1}).limit(15).toArray();
            client.close();
            res.status(200).json({
                status: "ok",
                data: arrBaiViet
            });
        } catch (err) {
            res.status(200).json({
                status: "fail",
                message: err.toString()
            });
        }
    },

    ThemBaiViet: async function (req, res, next) {
        const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
        try {
            await client.connect();
            const db = client.db(DbName);
            const colBaiViet = db.collection('BaiViet');
            //Kiểm tra user đã tồn tại hay chưa
            let result = await colBaiViet.find({lowerCase: BoDau(req.body.tenbaiviet)}).next();
            if (result != null) {
                res.status(200).json({
                    status: 'fail',
                    message: 'Tên bài viết đã tồn tại, vui lòng đặt tên khác !'
                });
            } else {
                //Tạo parameter baiviet
                let baiviet = {
                    id:shortId.generate().toUpperCase(),
                    tenBaiViet: req.body.tenbaiviet,
                    lowerCase: BoDau(req.body.tenbaiviet),
                    noiDung: req.body.noidung,
                    soLuotXem:0,
                    trangThaiXoa: false
                }
                let result = await colBaiViet.insertOne(baiviet);
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

    SuaBaiViet: async function (req, res, next) {
        // const resultToken = await jwt.verify(req.header('token'), process.env.SECRET_KEY);
        // const userId = resultToken.payload.userId;
        const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
        try {
            await client.connect();
            const db = client.db(DbName);
            const colBaiViet = db.collection('BaiViet');
            //Kiểm tra tên bài viết đã tồn tại hay chưa
            let result = await colBaiViet.find({
                lowerCase: BoDau(req.body.tenbaiviet),
                _id: {$ne: ObjectId(req.body.id)},
                trangThaiXoa:false
            }).next();

            if (result != null) {
                res.status(200).json({
                    status: 'fail',
                    message: 'Tên bài viết đã tồn tại, vui lòng đặt tên khác !'
                });
            } else {

                let result = await colBaiViet.updateOne(
                    {_id: ObjectId(req.body.id)},
                    {
                        $set: {
                            tenBaiViet: req.body.tenbaiviet,
                            lowerCase: BoDau(req.body.tenbaiviet),
                            noiDung: req.body.noidung
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

    XoaBaiViet: async function (req, res, next) {
        const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
        try {
            await client.connect();
            const db = client.db(DbName);
            const colBaiViet = db.collection('BaiViet');

            let id = ObjectId(req.body.id);
            // Xoá bài viết
            let delResult = await colBaiViet.updateOne({_id: id}, {$set: {trangThaiXoa: true}});
            client.close();
            res.status(200).json({
                status: "ok",
                message: 'Xóa thành công !'
            });
        } catch (err) {
            res.status(200).json({
                status: "fail",
                message: err.toString()
            });
        }
    }

}