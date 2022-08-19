module.exports = {
    Validate_BaiViet_KhiThem_Sua: function (req, res, next) {
      //  console.log(req.body.tenbaiviet);
       // console.log(req.body.noidung);
        try {
            let tenbaiviet = req.body.tenbaiviet;
            let noidung = req.body.noidung;

            if (tenbaiviet === undefined || noidung === undefined ) {
                res.status(200).json({
                    status: 'fail',
                    message: 'Thông tin không được trống !'
                });
            } else if (tenbaiviet.length === 0 ||noidung.length === 0 ) {
                res.status(200).json({
                    status: 'fail',
                    message: 'Thông tin không được trống !'
                });
            }
            else {
               next();
            }
        } catch (err) {

            res.status(200).json({
                status: "fail",
                message: 'ID Bài viết không hợp lệ !'
            });
        }
    }
}