const {DbUrl,DbName} = require('../configs/constant');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const {BoDau} = require('../utils/hamHoTro');
const fs = require('fs');
async function ex(){
    const client = new MongoClient(DbUrl, {raw: true, useNewUrlParser: true, useUnifiedTopology: true});
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
}