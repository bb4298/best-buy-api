const {DbUrl,DbName} = require('../../configs/constant');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
module.exports = {
    Validate_LienKet_KhiThem_Sua: async function (req, res, next) {
        const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
        try {
            let {idfooter,lienket} = req.body;
            await client.connect();
            const db = client.db(DbName);
            const colBaiViet = db.collection('BaiViet');
            if (!idfooter  || !lienket.tenLienKet || !lienket.ID_BaiViet) {
                res.status(200).json({
                    status: 'fail',
                    message: 'Thông tin không được trống !'
                }); return;
            }

            let resBaiViet = await colBaiViet.find({id:lienket.ID_BaiViet, trangThaiXoa:false}).next();
            client.close();
            if(resBaiViet === null){
                res.status(200).json({
                    status: 'fail',
                    message:'ID bài viết không tồn tại, vui lòng thêm ID tồn tại trong hệ thống !'
                });
            }
            next();
        } catch (err) {
            res.status(200).json({
                status: "fail",
                message: err.toString()
            });
        }
    }
}
