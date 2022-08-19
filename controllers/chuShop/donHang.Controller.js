const {DbUrl, DbName} = require('../../configs/constant');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const {BoDau} = require('../../utils/hamHoTro');
module.exports = {
    //Thao tác CRUD sanpham của admin
    LaySanPhamTheoFilter: async function (req, res, next) {
        const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
        const {filter, page, pagesize} = req;
        console.log(JSON.stringify({filter, page, pagesize}));
        try {
            await client.connect();
            const db = client.db(DbName);
            const colSanPham = db.collection('SanPham');
            let count = await colSanPham.find(filter).toArray();
            let soTrang = Math.ceil(parseInt(count.length) / pagesize);
            let arrSanPham = await colSanPham.find(filter).sort({_id: -1}).limit(parseInt(pagesize)).skip(parseInt(pagesize) * parseInt(page)).toArray();
            console.log(arrSanPham)
            client.close();
            res.status(200).json({
                status: "ok",
                data: arrSanPham,
                soTrang: soTrang,
                count: count.length
            });
        } catch (e) {
            console.log(e);
            res.status(200).json({
                status: "fail",
                message: e.toString()
            });
        }
    },



    Duyet_BoDuyetSanPham: async function (req, res, next) {
        const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
        try {
            let ids = req.body.listid; //array
            let type = req.body.type; //array

            await client.connect();
            const db = client.db(DbName);
            const colSanPham = db.collection('SanPham');
            let duyetResult = await colSanPham.updateMany({_id: {'$in': ids.map(item => ObjectId(item))}}, {
                $set: {
                    trangThaiDuyet: type,
                    trangThaiKhoa: type ? false : true
                }
            });
            client.close();
            res.status(200).json({
                status: "ok",
                message: `Đã ${type?'duyệt':'bỏ duyệt'} ${ids.length} sản phẩm !`
            });
        } catch (e) {
            res.status(200).json({
                status: "fail",
                message: e.toString()
            });
        }
    },



}