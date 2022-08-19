const requestImageSize = require('request-image-size');
const {DbUrl,DbName} = require('../../configs/constant');
const MongoClient = require('mongodb').MongoClient;
module.exports = {
    Validate_Carousel_KhiThem_Sua: async function (req, res, next) {
        const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
        await client.connect();
        const db = client.db(DbName);
        const colBaiViet = db.collection('BaiViet');
        let result = await colBaiViet.find({id: req.body.idbv}).next();
        try {
            let tencarousel = req.body.tencarousel;
            let anh = req.body.anh;
            let idbv = req.body.idbv;

            if (tencarousel === undefined || anh === undefined || idbv === undefined) {
                res.status(200).json({
                    status: 'fail',
                    message: 'Thông tin không được trống !'
                });
            } else if (tencarousel.length === 0 ||anh.length === 0 ) {
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
                requestImageSize(anh)
                    .then(size => next())
                    .catch(err => {
                        res.status(200).json({
                            status: 'fail',
                            message: 'Link ảnh không hợp lệ, vui lòng nhập lại !'
                        });
                    });
            }

        } catch (err) {

            res.status(200).json({
                status: "fail",
                message: 'ID Bài viết không hợp lệ !'
            });
        }
    }
}