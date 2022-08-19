const express = require('express');
const router = express.Router();
const {authController,khachHangController,gioHangController,thanhToanController,donHangController,maGiamGiaController} = require('../controllers');
const {khachHangValidate, donHangValidate} = require('../validators');

//Endpoint:localhost:3000/api/v1/admin/

/*Phục vụ đăng ký------------------------------------------------------------------------------*/

//Đăng ký khách hàng
router.post('/dangky',khachHangValidate.Validate_KhachHang_KhiDangKy,khachHangController.DangKyKhachHang);

//Kiểm tra tài khoản có tồn tại không
router.post('/checktaikhoantontai',khachHangController.CheckTaiKhoanKhachHangTonTai);

//Kiểm tra email có tồn tại không
router.post('/checkemailtontai',khachHangController.CheckEmailKhacHangTonTai);



/*Phục vụ quản lý thông tin------------------------------------------------------------------*/
//Lấy lịch sử tìm kiếm
router.get('/lichsutk',khachHangController.LayLichSuTimKiemKH);



/*Thao tác giỏ hàng ----------------------------------------------------------------------------*/
//Lấy data giỏ hàng
router.get('/giohang',authController.KiemTraTokenKhachHang,gioHangController.LayDataGioHang);

//Thêm sản phẩm vào giỏ hàng(cập nhật số lượng cũng dùng route này)
router.post('/giohang',authController.KiemTraTokenKhachHang,gioHangController.Them_CapNhatSanPhamVaoGioHang);

//Xóa một sản phẩm trong giỏ hàng(khi khách hàng xóa sản phẩm)
router.delete('/giohang',authController.KiemTraTokenKhachHang,gioHangController.XoaSanPhamTrongGioHang);

//Xóa tất cả sản phẩm trong giỏ hàng(khi khách hàng đặt hàng thành công)
router.delete('/xoaallgiohang',authController.KiemTraTokenKhachHang,gioHangController.XoaTatCaSanPhamTrongGioHang);



/*Thao tác đặt hàng----------------------------------------------------------------------------*/
//Lấy phương thức thanh toán của shop đang mua(tại trang thanh toán)
router.post('/phuongthucthanhtoan',thanhToanController.LayPhuongThucThanhToan);

//Lấy phương thức thanh toán của shop đang mua(tại trang thanh toán)
router.post('/kiemtramagiamgia',maGiamGiaController.KiemTraTonTaiMaGiamGia);

//Đặt hàng bỏi khách hàng (tại trang thanh toán)
router.post('/donhang',authController.KiemTraTokenKhachHang,donHangController.DatHang);

//Thanh toán vào tài khoản paypal khách hàng (nếu trả trước)
router.post('/thanhtoanpaypal',donHangController.ThanhToanPaypalKhiTraTruoc);



/*Quản lý đơn hàng của khách hàng----------------------------------------------------------- */
// Lấy đơn hàng theo filter
router.get('/donhang',authController.KiemTraTokenKhachHang,donHangValidate.ValidateFilterKhiTimKiem_DonHang,donHangController.LayDonHangTheoFilter);

// Lấy đơn hàng theo id
router.get('/donhang/:id',authController.KiemTraTokenKhachHang,donHangController.LayDonHangTheoId);

// Chuyển trạng thái đơn hàng theo list item (dành cho khách hàng)
router.put('/donhang',authController.KiemTraTokenKhachHang,donHangController.ChuyenTrangThaiDonHang);

// Xóa đơn hàng theo list item
router.delete('/donhang',authController.KiemTraTokenKhachHang,donHangController.XoaDonHang);

// Đánh giá đơn hàng theo list item
router.post('/danhgiadonhang',authController.KiemTraTokenKhachHang,donHangController.DanhGiaDonHang);

module.exports = router;