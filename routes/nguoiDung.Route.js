const express = require('express');
const router = express.Router();
const {authController,nguoiDungController,diaDiemController,chatController} = require('../controllers');
const {nguoiDungValidate} = require('../validators');
//Endpoint:localhost:3000/api/v1/nguoidung/

/*Quản lý thông tin người dùng-----------------------------------------------------------------------------------*/
//Lấy thông tin người dùng
router.get('/',authController.KiemTraTokenNguoiDung,nguoiDungController.LayThongTinNguoiDung);

//Sửa thông tin người dùng
router.post('/',authController.KiemTraTokenNguoiDung,nguoiDungValidate.Validate_NguoiDung_KhiSua,nguoiDungController.SuaThongTinNguoiDung);

//Sửa email người dùng
router.post('/suaemail',authController.KiemTraTokenNguoiDung,nguoiDungValidate.Validate_Email_NguoiDung,nguoiDungController.SuaEmailNguoiDung);

//Đổi mật khẩu người dùng
router.post('/doimk',authController.KiemTraTokenNguoiDung,nguoiDungValidate.Validate_MatKhau_NguoiDung, nguoiDungController.DoiMatKhau);

//Lấy danh sách tỉnh thành
router.get('/laytinhthanh',diaDiemController.LayAllTinhThanh);



/*Quản lý chat của người dùng -------------------------------------------------------------------*/
//Lấy danh sách những người đã chat
router.post('/laynguoidachat',authController.KiemTraTokenNguoiDung,chatController.LayDanhSachNguoiDaChat);

//Lấy danh sách tin nhắn
router.post('/laytinnhan',authController.KiemTraTokenNguoiDung,chatController.LayTinNhan);

//Tạo cuộc trò chuyện
router.post('/taocuoctrochuyen',authController.KiemTraTokenNguoiDung,chatController.TaoCuocTroChuyen);



module.exports = router;
