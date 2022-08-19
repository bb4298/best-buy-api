const jwt = require('jsonwebtoken');
const {DbUrl, DbName, defaultImage} = require('../../configs/constant');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const bcrypt = require('bcrypt');
module.exports = {
    LayPhuongThucThanhToan: async function (req, res, next) {
        const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
        try {
            //console.log(req.body.idCS);
            const idCS = ObjectId(req.body.idCS);
           //console.log('idCS');
            //console.log(idCS);
            await client.connect();
            const db = client.db(DbName);
            const colNguoiDung = db.collection('NguoiDung');

            let resNguoiDung = await colNguoiDung.find({_id: idCS}).next();
            client.close();
            res.status(200).json(
                resNguoiDung.ppThanhToan
            );
        } catch (err) {
            res.status(200).json({
                status: "fail",
                message: err.toString()
            });
        }
    }

}