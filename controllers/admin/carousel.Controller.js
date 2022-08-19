const {DbUrl,DbName} = require('../../configs/constant');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const {BoDau} = require('../../utils/hamHoTro');
module.exports = {
    //Thao tác CRUD carousel của admin
    LayCarouselTheoTrang: async function (req, res, next) {
        var SoItemMoiPageAdmin = parseInt(global.SoItemMoiPageAdmin);
        const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
        const page = req.params.page;
        try {
            await client.connect();
            const db = client.db(DbName);
            const colCarousel = db.collection('Carousel');
            let count = await colCarousel.find({trangThaiXoa:false}).toArray();
            let soTrang = Math.ceil(parseInt(count.length) / SoItemMoiPageAdmin);
            let arrCarousel = await colCarousel.find({trangThaiXoa:false}).sort({_id: -1}).limit(SoItemMoiPageAdmin).skip(SoItemMoiPageAdmin * page).toArray();
            client.close();
            res.status(200).json({
                status: "ok",
                data: arrCarousel,
                soTrang: soTrang
            });
        } catch (err) {
            res.status(200).json({
                status: "fail",
                message: err.toString()
            });
        }
    },

    LayCarouselTheoId: async function (req, res, next) {
        const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
        const id = ObjectId(req.query.id);
        try {
            await client.connect();
            const db = client.db(DbName);
            const colCarousel = db.collection('Carousel');
            let resultCarousel = await colCarousel.find({_id: id}).next();
            client.close();
            if (resultCarousel === null) {
                res.status(200).json({
                    status: 'fail',
                    message: 'Không có dữ liệu !'
                });
            } else {
                res.status(200).json(resultCarousel);
            }
        } catch (err) {
            res.status(200).json({
                status: "fail",
                message: err.toString()
            });
        }
    },

    TimKiemCarousel: async function (req, res, next) {
        const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
        const tuKhoa = BoDau(req.query.tukhoa);
        try {
            await client.connect();
            const db = client.db(DbName);
            const col = db.collection('Carousel');
            let arrCarousel = await col.find({
                '$or': [
                    {
                        trangThaiXoa:false,
                        lowerCase: {'$regex': tuKhoa, '$options': '$i'}
                    },
                    {
                        trangThaiXoa:false,
                        ID_BaiViet:{'$regex': tuKhoa.toUpperCase(), '$options': '$i'}
                    }
                ]
            }).sort({_id: -1}).limit(15).toArray();
            client.close();
            res.status(200).json({
                status: "ok",
                data: arrCarousel,
            });
        } catch (err) {
            res.status(200).json({
                status: "fail",
                message: err.toString()
            });
        }
    },

    ThemCarousel: async function (req, res, next) {
        const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
        try {
            await client.connect();
            const db = client.db(DbName);
            const colCarousel = db.collection('Carousel');
            //Kiểm tra user đã tồn tại hay chưa
            let result = await colCarousel.find({tenCarousel: req.body.tencarousel}).next();
            if (result != null) {
                res.status(200).json({
                    status: 'fail',
                    message: 'Tên carousel đã tồn tại, vui lòng đặt tên khác !'
                });
            } else {
                //Tạo parameter carousel
                let carousel = {
                    tenCarousel: req.body.tencarousel,
                    lowerCase: BoDau(req.body.tencarousel),
                    anh: req.body.anh,
                    trangThaiXoa: false,
                    ID_BaiViet:req.body.idbv
                }
                let result = await colCarousel.insertOne(carousel);
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

    SuaCarousel: async function (req, res, next) {
        // const resultToken = await jwt.verify(req.header('token'), process.env.SECRET_KEY);
        // const userId = resultToken.payload.userId;

        const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
        try {
            await client.connect();
            const db = client.db(DbName);
            const colCarousel = db.collection('Carousel');
            //Kiểm tra tên carousel đã tồn tại hay chưa
            let result = await colCarousel.find({
                lowerCase: BoDau(req.body.tencarousel),
                _id: {$ne: ObjectId(req.body.id)},
                trangThaiXoa:false
            }).next();
            console.log(result);
            if (result != null) {
                res.status(200).json({
                    status: 'fail',
                    message: 'Tên carousel đã tồn tại, vui lòng đặt tên khác !'
                });
            } else {
                console.log(req.body.id);
                let result = await colCarousel.updateOne(
                    {_id: ObjectId(req.body.id)},
                    {
                        $set: {
                            tenCarousel: req.body.tencarousel,
                            lowerCase: BoDau(req.body.tencarousel),
                            anh: req.body.anh,
                            ID_BaiViet:req.body.idbv
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

    XoaCarousel: async function (req, res, next) {
        const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
        try {
            await client.connect();
            const db = client.db(DbName);
            const colCarousel = db.collection('Carousel');

            let id = ObjectId(req.body.id);

            let delResult = await colCarousel.updateOne({_id: id}, {$set: {trangThaiXoa: true}});
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