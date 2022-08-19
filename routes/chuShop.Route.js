const express = require('express');
const router = express.Router();
const {authController,hoSoShopController,sanPhamChuShopController,donHangController,maGiamGiaController,thongKeChuShopController} = require( '../controllers');
const {nguoiDungValidate,sanPhamChuShopValidate,thanhToanValidate,donHangValidate,maGiamGiaValidate,hoSoShopValidate} = require( '../validators');
//Endpoint:localhost:3000/api/v1/chushop/

/*Quản lý hồ sơ shop----------------------------------------------------------- */
//Lấy thông tin hồ sơ shop
router.get('/hososhop', authController.KiemTraTokenChuShop, hoSoShopController.LayHoSoShopTheoIdChuShop);

//Sửa thông tin hồ sơ shop
router.put('/hososhop', authController.KiemTraTokenChuShop,hoSoShopValidate.Validate_HoShoShop_KhiThemSua, hoSoShopController.SuaHoSoShopTheoIdChuShop);

//Lấy thông tin mô tả shop tại trang tổng quan
router.get('/tongquanshop', authController.KiemTraTokenChuShop, hoSoShopController.LayThongTinMoTaShopTrangTongQuan);



/*Thống kê chủ shop----------------------------------------------------------- */
//Lấy kết quả thống kê dài hạn
router.post('/thongkedaihan', authController.KiemTraTokenChuShop, thongKeChuShopController.ThongKeDaiHan_ChuShop);

//Lấy kết quả thống kê số lượng sản phẩm
router.post('/thongkenganhan', authController.KiemTraTokenChuShop, thongKeChuShopController.ThongKeNganHan_ChuShop);


/*Quản lý địa chỉ shop--------------------------------------------------------- */
//Lấy địa chỉ shop
router.get('/diachi', authController.KiemTraTokenChuShop, hoSoShopController.LayDiaChiShop);

//Sửa địa chỉ shop
router.put('/diachi', authController.KiemTraTokenChuShop, hoSoShopController.SuaDiaChiShop);



/*Quản lý sản phẩm----------------------------------------------------------- */
// Lấy sản phẩm theo filter(tìm kiếm)
router.get('/sanpham',authController.KiemTraTokenChuShop,sanPhamChuShopValidate.ValidateFilterKhiTimKiem,sanPhamChuShopController.LaySanPhamTheoFilter);

// Lấy sản phẩm theo id
router.get('/sanpham/:id',authController.KiemTraTokenChuShop,sanPhamChuShopController.LaySanPhamTheoId);

// Tạo mới sản phẩm
router.post('/sanpham', authController.KiemTraTokenChuShop,sanPhamChuShopValidate.Validate_SanPham_Khi_Them_Sua,sanPhamChuShopController.ThemSanPham);

// Sửa sản phẩm
router.put('/sanpham', authController.KiemTraTokenChuShop,sanPhamChuShopValidate.Validate_SanPham_Khi_Them_Sua,sanPhamChuShopController.SuaSanPham);

// Khóa và mở khóa sản phẩm
router.put('/locksanpham', authController.KiemTraTokenChuShop,sanPhamChuShopController.LockSanPham);

// Xóa sản phẩm
router.delete('/sanpham', authController.KiemTraTokenChuShop,sanPhamChuShopController.XoaSanPham);

// Tạo mới phân loại
router.post('/phanloai', authController.KiemTraTokenChuShop,sanPhamChuShopValidate.Validate_PhanLoai_Khi_Them_Sua,sanPhamChuShopController.ThemPhanLoai);

// Sửa phân loại
router.put('/phanloai', authController.KiemTraTokenChuShop,sanPhamChuShopValidate.Validate_PhanLoai_Khi_Them_Sua,sanPhamChuShopController.SuaPhanLoai);

// Xóa phân loại
router.delete('/phanloai', authController.KiemTraTokenChuShop,sanPhamChuShopController.XoaPhanLoai);



/*Quản lý phương thức thanh toán online----------------------------------------------------------- */
// Lấy data thanh toán
router.get('/thanhtoan',authController.KiemTraTokenChuShop,hoSoShopController.LayDataThanhToanOnline);

// Sửa data thanh toán
router.put('/thanhtoan',authController.KiemTraTokenChuShop,thanhToanValidate.Validate_PhuongThucThanhToan,hoSoShopController.LuuDataThanhToanOnline);

// Khóa phương thức thanh toán
router.put('/lockthanhtoan',authController.KiemTraTokenChuShop,hoSoShopController.LuuDataThanhToanOnline);



/*Quản lý đơn hàng của chủ shop----------------------------------------------------------- */
// Lấy đơn hàng theo filter
router.get('/donhang',authController.KiemTraTokenChuShop,donHangValidate.ValidateFilterKhiTimKiem_DonHang,donHangController.LayDonHangTheoFilter);

// Lấy đơn hàng theo id
router.get('/donhang/:id',authController.KiemTraTokenChuShop,donHangController.LayDonHangTheoId);

// Chuyển trạng thái đơn hàng theo list item(dành cho chủ shop)
router.put('/donhang',authController.KiemTraTokenChuShop,donHangController.ChuyenTrangThaiDonHang);

// Xóa đơn hàng theo list item
router.delete('/donhang',authController.KiemTraTokenChuShop,donHangController.XoaDonHang);



/*Quản lý mã giảm giá của chủ shop----------------------------------------------------------- */
// Lấy mã giảm giá theo filter
router.get('/magiamgia',authController.KiemTraTokenChuShop,maGiamGiaValidate.ValidateFilterKhiTimKiem_MaGiamGia,maGiamGiaController.LayMaGiamGiaTheoFilter);

// Lấy mã giảm giá theo id
//router.get('/magiamgia/:id',authController.KiemTraTokenChuShop,maGiamGiaController.LayDonHangTheoId);

// Thêm mã giảm giá
router.post('/magiamgia',authController.KiemTraTokenChuShop,maGiamGiaValidate.Validate_MaGiamGia_Khi_Them_Sua,maGiamGiaController.ThemMaGiamGia);

// Sửa mã giảm giá
router.put('/magiamgia',authController.KiemTraTokenChuShop,maGiamGiaValidate.Validate_MaGiamGia_Khi_Them_Sua,maGiamGiaController.SuaMaGiamGia);

// Khóa/mở khóa mã giảm giá theo list item
router.put('/lockmagiamgia',authController.KiemTraTokenChuShop,maGiamGiaController.KhoaMaGiamGia);

// Xóa mã giảm giá theo list item
router.delete('/magiamgia',authController.KiemTraTokenChuShop,maGiamGiaController.XoaMaGiamGia);

module.exports = router;
