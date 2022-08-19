const {BoDau} = require('../../utils/hamHoTro');
module.exports = {
    Validate_KhachHang_KhiDangKy: function (req, res, next) {
        try {
            const {tentaikhoan,email,hoten,sdt,matkhau }= req.body;

            if (!tentaikhoan || !matkhau || !email) {
                res.status(200).json({
                    status: 'fail',
                    message: 'Thông tin không được trống !'
                }); return;
            }
            if (!/^[a-zA-Z0-9_-]{6,18}$/.test(tentaikhoan)) {
                res.status(200).json({
                    status: 'fail',
                    message: 'Tên tài khoản phải thuộc a-z,A-Z,0-9, từ 6-18 kí tự !'
                }); return;
            }
            if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
                res.status(200).json({
                    status: 'fail',
                    message: 'Email không hợp lệ !'
                }); return;
            }
            if (!/^[a-zA-Z ]*$/.test(BoDau(hoten))) {
                res.status(200).json({
                    status: 'fail',
                    message: 'Họ tên không hợp lệ !'
                }); return;
            }
            if (!/^[0-9]{10,11}$/.test(sdt)) {
                res.status(200).json({
                    status: 'fail',
                    message: 'Số điện thoại không đúng định dạng ! !'
                }); return;
            }
            if (!/^[a-zA-Z0-9_-]{6,18}$/.test(matkhau)) {
                res.status(200).json({
                    status: 'fail',
                    message: 'Mật khẩu phải thuộc a-z,A-Z,0-9, từ 6-18 kí tự !'
                }); return;
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