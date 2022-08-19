const {DbUrl, DbName} = require('../../configs/constant');
const MongoClient = require('mongodb').MongoClient;
module.exports = {
    Validate_HoShoShop_KhiThemSua: async function (req, res, next) {
        let {tenShop, moTa} = req.body.inforHoSo;
        if (!tenShop || !moTa) {
            res.status(200).json({
                status: 'fail',
                message: 'Thông tin không được trống !'
            });return;
        }
        if (tenShop.length > 50 ) {
            res.status(200).json({
                status: 'fail',
                message: 'Tên shop không được lớn hơn 70 ký tự !'
            });return;
        }
        if( moTa.length >1000){
            res.status(200).json({
                status: 'fail',
                message: 'Mô tả shop không được lớn hơn 1000 ký tự !'
            }); return;
        }
        next();
    }
}