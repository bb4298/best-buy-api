const {DbUrl,DbName} = require('../../configs/constant');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const {BoDau} = require('../../utils/hamHoTro');
module.exports = {
    //Thao tác CRUD thông báo của admin
    LayThongBaoTheoTrang: async function (req, res, next) {
        var SoItemMoiPageAdmin = parseInt(global.SoItemMoiPageAdmin);
        const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
        const page = req.params.page;
        try {
            await client.connect();
            const db = client.db(DbName);
            const colThongBao = db.collection('ThongBao');
            let count = await colThongBao.find({trangThaiXoa:false}).toArray();
            let soTrang = Math.ceil(parseInt(count.length) / SoItemMoiPageAdmin);
            let arrThongBao = await colThongBao.find({trangThaiXoa:false}).sort({_id: -1}).limit(SoItemMoiPageAdmin).skip(SoItemMoiPageAdmin * page).toArray();
            client.close();
            res.status(200).json({
                status: "ok",
                data: arrThongBao,
                soTrang: soTrang
            });
        } catch (err) {
            res.status(200).json({
                status: "fail",
                message: err.toString()
            });
        }
    },

    LayThongBaoTheoId: async function (req, res, next) {
        const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
        const id = ObjectId(req.query.id);
        try {
            await client.connect();
            const db = client.db(DbName);
            const colThongBao = db.collection('ThongBao');
            let resultThongBao = await colThongBao.find({_id: id}).next();
            client.close();
            if (resultThongBao === null) {
                res.status(200).json({
                    status: 'fail',
                    message: 'Không có dữ liệu !'
                });
            } else {
                res.status(200).json(resultThongBao);
            }
        } catch (err) {
            res.status(200).json({
                status: "fail",
                message: err.toString()
            });
        }
    },

    TimKiemThongBao: async function (req, res, next) {
        const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
        const tuKhoa = BoDau(req.query.tukhoa);
        try {
            await client.connect();
            const db = client.db(DbName);
            const col = db.collection('ThongBao');
            let arrThongBao = await col.find({
                '$or': [
                    {
                        trangThaiXoa:false,
                        lowerCase: {'$regex': tuKhoa, '$options': '$i'}
                    },
                    {
                        trangThaiXoa:false,
                        ID_BaiViet: {'$regex': tuKhoa.toUpperCase(), '$options': '$i'}
                    }
                ]
            }).sort({_id: -1}).limit(15).toArray();
            client.close();
            res.status(200).json({
                status: "ok",
                data: arrThongBao,
            });
        } catch (err) {
            res.status(200).json({
                status: "fail",
                message: err.toString()
            });
        }
    },

    ThemThongBao: async function (req, res, next) {
        const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
        try {
            await client.connect();
            const db = client.db(DbName);
            const colThongBao = db.collection('ThongBao');
            //Kiểm tra user đã tồn tại hay chưa
            let result = await colThongBao.find({lowerCase: BoDau(req.body.tieude)}).next();
            if (result != null) {
                res.status(200).json({
                    status: 'fail',
                    message: 'Tên thông báo đã tồn tại, vui lòng đặt tên khác !'
                });
            } else {
                //Tạo parameter thongbao
                let thongbao = {
                    tieuDe: req.body.tieude,
                    lowerCase: BoDau(req.body.tieude),
                    noiDung: req.body.noidung,
                    trangThaiXoa: false,
                    ID_BaiViet: req.body.idbv
                }
                let result = await colThongBao.insertOne(thongbao);
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

    SuaThongBao: async function (req, res, next) {
        // const resultToken = await jwt.verify(req.header('token'), process.env.SECRET_KEY);
        // const userId = resultToken.payload.userId;

        const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
        try {
            await client.connect();
            const db = client.db(DbName);
            const colThongBao = db.collection('ThongBao');
            //Kiểm tra tên thongbao đã tồn tại hay chưa
            let result = await colThongBao.find({
                lowerCase: BoDau(req.body.tieude),
                _id: {$ne: ObjectId(req.body.id)},
                trangThaiXoa:false
            }).next();
            console.log(result);
            if (result != null) {
                res.status(200).json({
                    status: 'fail',
                    message: 'Tên thongbao đã tồn tại, vui lòng đặt tên khác !'
                });
            } else {
                console.log(req.body.id);
                let result = await colThongBao.updateOne(
                    {_id: ObjectId(req.body.id)},
                    {
                        $set: {
                            tieuDe: req.body.tieude,
                            lowerCase: BoDau(req.body.tieude),
                            noiDung: req.body.noidung,
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

    XoaThongBao: async function (req, res, next) {
        const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
        try {
            await client.connect();
            const db = client.db(DbName);
            const colThongBao = db.collection('ThongBao');

            let id = ObjectId(req.body.id);

            let delResult = await colThongBao.updateOne({_id: id}, {$set: {trangThaiXoa: true}});
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