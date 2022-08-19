const requestImageSize = require('request-image-size');
module.exports = {
    Validate_DanhMuc_KhiThem_Sua: function (req, res, next) {
        try {
            let tendanhmuc = req.body.tendanhmuc;
            let anh = req.body.anh;

            if (!tendanhmuc  || !anh ) {
                res.status(200).json({
                    status: 'fail',
                    message: 'Thông tin không được trống !'
                });
            }
            else {
                requestImageSize(anh).then(size => next())
                .catch(err => {
                    res.status(200).json({
                        status: 'fail',
                        message: 'Link ảnh không hợp lệ, vui lòng nhập lại !'
                    });return
                });
            }
        } catch (err) {
            res.status(200).json({
                status: "fail",
                message: err.toString()
            });
        }
    }
}
