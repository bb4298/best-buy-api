const {BoDau} = require('../../utils/hamHoTro');
module.exports = {
    Validate_ChuShop_KiemDuyetVien_KhiThem_Sua: function (req, res, next) {
        // console.log(req.body.tendangnhap);
        // console.log(req.body.matkhau);
        try {
            let tendangnhap = req.body.tendangnhap;
            let matkhau = req.body.matkhau;

            if (!tendangnhap || !matkhau) {
                res.status(200).json({
                    status: 'fail',
                    message: 'Thông tin không được trống !'
                });return;
            }
            if (!/^[a-zA-Z0-9_-]{6,18}$/.test(tendangnhap)) {
                res.status(200).json({
                    status: 'fail',
                    message: 'Tên tài khoản phải thuộc a-z,A-Z,0-9, từ 6-18 kí tự ! !'
                });return;
            }
            next();
        } catch (err) {
            res.status(200).json({
                status: "fail",
                message: err.toString()
            });
        }
    },

    Validate_NguoiDung_KhiSua: function (req, res, next) {
        let inforKH = req.body;
        try {
            if (!inforKH.hoTen || !inforKH.sdt  ) {
                res.status(200).json({
                    status: 'fail',
                    message: 'Thông tin không được trống !'
                }); return;
            }
            if (!/^[a-zA-Z ]*$/.test(BoDau(inforKH.hoTen))) {
                res.status(200).json({
                    status: 'fail',
                    message: 'Họ tên không hợp lệ !'
                }); return;
            }
            if (!/^[0-9]{10,11}$/.test(inforKH.sdt)) {
                res.status(200).json({
                    status: 'fail',
                    message: 'Số điện thoại không đúng định dạng ! !'
                }); return;
            }
            next();
        } catch (err) {
            res.status(200).json({
                status: "fail",
                message: err.toString()
            });
        }
    },

    Validate_Email_NguoiDung: function (req, res, next) {
        let email = req.body.email;
        try {
            if (!email ) {
                res.status(200).json({
                    status: 'fail',
                    message: 'Thông tin không được trống !'
                }); return;
            }
            if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
                res.status(200).json({
                    status: 'fail',
                    message: 'Email không hợp lệ !'
                }); return;
            }
            next();
        } catch (err) {
            res.status(200).json({
                status: "fail",
                message: err.toString()
            });
        }
    },

    Validate_MatKhau_NguoiDung: function (req, res, next) {
        let matkhau = req.body.matkhau;
        try {
            if (!matkhau ) {
                res.status(200).json({
                    status: 'fail',
                    message: 'Mật khẩu không được trống !'
                }); return;
            }
            if (!/^[a-zA-Z0-9_-]{6,18}$/.test(matkhau)) {
                res.status(200).json({
                    status: 'fail',
                    message: 'Mật khẩu phải thuộc a-z,A-Z,0-9, từ 6-18 kí tự ! !'
                }); return;
            }
            next();
        } catch (e) {
            res.status(200).json({
                status: "fail",
                message: e.toString()
            });
        }
    }
}