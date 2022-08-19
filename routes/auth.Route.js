const express = require('express');
const router = express.Router();
const {authController} = require( '../controllers');
const {khachHangValidate,nguoiDungValidate} = require('../validators');
//Endpoint:localhost:3000/api/v1/auth/

//Kiểm tra đăng nhập khách hàng
router.post('/', authController.KiemTraDangNhapKhachHang);

//Kiểm tra đăng nhập phần quản trị(admin và chủ shop)
router.post('/quantri', authController.KiemTraDangNhapQuanTri);

//Login facebook
router.post('/facebook', authController.KiemTraDangNhapFacebook);

//Check tài khoản fb đã tồn tại khi login
router.post('/kiemtratkfb', authController.KiemTraTonTaiTaiKhoanFacebook);

//Kiểm tra mật khẩu hiện tại của user trước khi thực hiện thao tác gì đó( như đổi pass hoặc xóa sản phẩm)
router.post('/checkcurrentpass', authController.KiemTraMatKhauHienTaiCuaNguoiDung);

//Kiểm tra token hiện tại của người dùng có hợp lệ hay không (dành cho mọi user)
router.get('/checklogin', authController.CheckLogined);

//Xóa token của user khi đăng xuất
router.get('/dangxuat', authController.DangXuat);

/*Xác thực email-------------------------------------------------*/
//Gửi email cho người dùng đẻ xác thực email
router.get('/guimailxacthuc', authController.GuiMailXacThucEmailChoKH);

//Xác thực email người dùng
router.post('/xacthucemail', authController.XacThucEmail);

/*Quên mật khẩu-------------------------------------------------*/
//Gửi email cho người dùng để đổi mật khẩu (quên mật khẩu)
router.post('/quenmk', nguoiDungValidate.Validate_Email_NguoiDung, authController.GuiLinkQuenMatKhauChoKH);

//Kiểm tra token đổi mật khẩu đã hết hạn chưa
router.post('/checktokendoimk', authController.KiemTraTokenDoiMK);

//Thay đổi mật khẩu người dùng (quên mật khẩu)
router.post('/resetmk', nguoiDungValidate.Validate_MatKhau_NguoiDung,authController.ResetMatKhau);


module.exports = router;
