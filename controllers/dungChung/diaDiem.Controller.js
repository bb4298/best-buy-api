const {DbUrl, DbName} = require('../../configs/constant');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const {BoDau} = require('../../utils/hamHoTro');
const jwt = require("jsonwebtoken");
const axios = require("axios");
module.exports = {
    LayAllTinhThanh: async function(req, res,next){

        const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
        try {

            await client.connect();
            const db = client.db(DbName);
            const colTinhThanh = db.collection('TinhThanh');
            let resTinhThanhs = await colTinhThanh.find().toArray();
            client.close();

            res.status(200).json({
                status:'ok',
                data:resTinhThanhs,
            });
        } catch (err) {
            res.status(200).json({
                status: "fail",
                message: err.toString()
            });
        }
    },

}

