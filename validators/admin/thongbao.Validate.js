const {DbUrl,DbName} = require('../../configs/constant');
const MongoClient = require('mongodb').MongoClient;
module.exports = {
    Validate_ThongBao_KhiThem_Sua: async function (req, res, next) {
        const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
        await client.connect();
        const db = client.db(DbName);
        const colBaiViet = db.collection('BaiViet');
        let result = await colBaiViet.find({id: req.body.idbv}).next();
        try {
            let tieude = req.body.tieude;
            let noidung = req.body.noidung;
            let idbv = req.body.idbv;

            if (tieude === undefined || noidung === undefined || idbv === undefined) {
                res.status(200).json({
                    status: 'fail',
                    message: 'Thông tin không được trống !'
                });
            } else if (tieude.length === 0 ||noidung.length === 0 ) {
                res.status(200).json({
                    status: 'fail',
                    message: 'Thông tin không được trống !'
                });
            }
            else if(result == null){
                res.status(200).json({
                    status: 'fail',
                    message: 'ID Bài viết không tồn tại, vui lòng nhập lại !'
                });
            }
            else {
               next();
            }
        } catch (err) {
            res.status(200).json({
                status: "fail",
                message: err.toString()
            });
        }
    }
}