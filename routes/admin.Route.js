const express = require('express');
const router = express.Router();
const {authController,nguoiDungController,chuShopController,kiemDuyetVienController,sanPhamKiemDuyetController,danhMucController,carouselController,baiVietController,thongBaoController,thongTinTinhController,phiBanHangController,thongKeAdminController} = require('../controllers');
const {nguoiDungValidate,danhMucValidate,carouselValidate,baivietValidate,thongBaoValidate,footerValidate,sanPhamKiemDuyetValidate, thongTinTinhValidate, chuShopValidate, phiBanHangValidate} = require('../validators');

//Endpoint:localhost:3000/api/v1/admin/



/*Thống kê sàn----------------------------------------------------------- */

//Lấy thông tin mô tả shop tại trang tổng quan
router.get('/tongquansan', authController.KiemTraTokenAdmin, thongKeAdminController.LayThongTinSanTaiTrangTongQuan);

//Lấy kết quả thống kê dài hạn
router.post('/thongkedaihan', authController.KiemTraTokenAdmin, thongKeAdminController.ThongKeDaiHan_Admin);

//Lấy kết quả thống kê shop
router.post('/thongkenganhan', authController.KiemTraTokenAdmin, thongKeAdminController.ThongKeNganHan_Admin);


//-----------------Quản lý chủ shop------------------------------------------------------------------
// Lấy danh sách chủ shop theo trang
router.get('/chushop/:page',authController.KiemTraTokenAdmin,chuShopController.LayChuShopTheoTrang);

// Lấy chủ shop theo id
router.get('/chushop',authController.KiemTraTokenAdmin,chuShopController.LayChuShopTheoId);

// Tìm kiếm chủ shop
router.get('/timchushop',authController.KiemTraTokenAdmin,chuShopController.TimKiemChuShop);

// Tạo mới chủ shop
router.post('/chushop', authController.KiemTraTokenAdmin,nguoiDungValidate.Validate_ChuShop_KiemDuyetVien_KhiThem_Sua,chuShopController.ThemChuShop);

// Sửa chủ shop(sửa quyền và phí bán hàng)
router.put('/chushop', authController.KiemTraTokenAdmin,chuShopValidate.Validate_ChuShop_Khi_Sua,chuShopController.SuaChuShop);

// Khóa hoặc mở khóa chủ shop
router.put('/lockchushop', authController.KiemTraTokenAdmin,nguoiDungController.KhoaNguoiDung);



//-----------------Quản lý kiểm duyệt viên-------------------------------------------------------------
// Lấy danh sách kiểm duyệt viên theo trang
router.get('/kiemduyetvien/:page',authController.KiemTraTokenAdmin,kiemDuyetVienController.LayKiemDuyetVienTheoTrang);

// Lấy kiểm duyệt viên theo id
router.get('/kiemduyetvien',authController.KiemTraTokenAdmin,kiemDuyetVienController.LayKiemDuyetVienTheoId);

// Tìm kiếm kiểm duyệt viên
router.get('/timkiemduyetvien',authController.KiemTraTokenAdmin,kiemDuyetVienController.TimKiemKiemDuyetVien);

// Tạo mới kiểm duyệt viên
router.post('/kiemduyetvien', authController.KiemTraTokenAdmin,nguoiDungValidate.Validate_ChuShop_KiemDuyetVien_KhiThem_Sua,kiemDuyetVienController.ThemKiemDuyetVien);

// Khóa hoặc mở khóa kiểm duyệt viên
router.put('/lockkiemduyetvien', authController.KiemTraTokenAdmin,nguoiDungController.KhoaNguoiDung);



//-----------------Quản lý danh mục--------------------------------------------------------------
// Lấy danh sách danh mục theo trang
router.get('/danhmuc/:page',authController.KiemTraTokenAdmin,danhMucController.LayDanhMucTheoTrang);

// Lấy danh mục theo id
router.get('/danhmuc',authController.KiemTraTokenAdmin,danhMucController.LayDanhMucTheoId);

// Tìm kiếm danh mục
router.get('/timdanhmuc',authController.KiemTraTokenAdmin,danhMucController.TimKiemDanhMuc);

// Tạo mới danh mục
router.post('/danhmuc', authController.KiemTraTokenAdmin,danhMucValidate.Validate_DanhMuc_KhiThem_Sua,danhMucController.ThemDanhMuc);

// Sủa danh mục
router.put('/danhmuc', authController.KiemTraTokenAdmin,danhMucValidate.Validate_DanhMuc_KhiThem_Sua,danhMucController.SuaDanhMuc);

// Khóa danh mục
router.put('/lockdanhmuc', authController.KiemTraTokenAdmin,danhMucController.KhoaDanhMuc);

// Mở khóa danh mục
router.put('/unlockdanhmuc', authController.KiemTraTokenAdmin,danhMucController.MoKhoaDanhMuc);



//-----------------Quản lý carousel-----------------------------------------------------------
// Lấy danh sách carousel theo trang
router.get('/carousel/:page',authController.KiemTraTokenAdmin,carouselController.LayCarouselTheoTrang);

// Lấy carousel theo id
router.get('/carousel',authController.KiemTraTokenAdmin,carouselController.LayCarouselTheoId);

// Tìm kiếm carousel
router.get('/timcarousel',authController.KiemTraTokenAdmin,carouselController.TimKiemCarousel);

// Tạo mới carousel
router.post('/carousel', authController.KiemTraTokenAdmin,carouselValidate.Validate_Carousel_KhiThem_Sua,carouselController.ThemCarousel);

// Sửa carousel
router.put('/carousel', authController.KiemTraTokenAdmin,carouselValidate.Validate_Carousel_KhiThem_Sua,carouselController.SuaCarousel);

// Xóa carousel
router.delete('/carousel', authController.KiemTraTokenAdmin,carouselController.XoaCarousel);



//-----------------Quản lý bài viết---------------------------------------------------------
// Lấy danh sách bài viết theo trang
router.get('/baiviet/:page',authController.KiemTraTokenAdmin,baiVietController.LayBaiVietTheoTrang);

// Lấy bài viết theo id
router.get('/baiviet',authController.KiemTraTokenAdmin,baiVietController.LayBaiVietTheoId);

// Tìm kiếm bài viết
router.get('/timbaiviet',authController.KiemTraTokenAdmin,baiVietController.TimKiemBaiViet);

// Tạo mới bài viết
router.post('/baiviet', authController.KiemTraTokenAdmin,baivietValidate.Validate_BaiViet_KhiThem_Sua,baiVietController.ThemBaiViet);

// Sủa bài viết
router.put('/baiviet', authController.KiemTraTokenAdmin,baivietValidate.Validate_BaiViet_KhiThem_Sua,baiVietController.SuaBaiViet);

// Xóa bài viết
router.delete('/baiviet', authController.KiemTraTokenAdmin,baiVietController.XoaBaiViet);



//-----------------Thông báo-----------------------------------------------------------------
// Lấy danh sách thông báo theo trang
router.get('/thongbao/:page',authController.KiemTraTokenAdmin,thongBaoController.LayThongBaoTheoTrang);

// Lấy thông báo theo id
router.get('/thongbao',authController.KiemTraTokenAdmin,thongBaoController.LayThongBaoTheoId);

// Tìm kiếm thông báo
router.get('/timthongbao',authController.KiemTraTokenAdmin,thongBaoController.TimKiemThongBao);

// Tạo mới thông báo
router.post('/thongbao', authController.KiemTraTokenAdmin,thongBaoValidate.Validate_ThongBao_KhiThem_Sua,thongBaoController.ThemThongBao);

// Sủa thông báo
router.put('/thongbao', authController.KiemTraTokenAdmin,thongBaoValidate.Validate_ThongBao_KhiThem_Sua,thongBaoController.SuaThongBao);

// Xóa thông báo
router.delete('/thongbao', authController.KiemTraTokenAdmin,thongBaoController.XoaThongBao);



//-----------------Thông tin tĩnh---------------------------------------------------------------------------
// Lấy thông tin footer     //Không cần lấy token, tại vì cả user và admin đều dùng được.
router.get('/thongtintinh',thongTinTinhController.LayThongTinTinh);

// Sửa tin footer
router.post('/thongtintinh',authController.KiemTraTokenAdmin,thongTinTinhValidate.Validate_NoiDungTinh_Khi_Sua,thongTinTinhController.SuaThongTinTinh);

// Sửa tên menu
router.put('/tenmenu',authController.KiemTraTokenAdmin,thongTinTinhValidate.Validate_TenMenuFoooter_Khi_Sua,thongTinTinhController.SuaTenMenu);

// Thêm liên kết
router.post('/lienket',authController.KiemTraTokenAdmin,footerValidate.Validate_LienKet_KhiThem_Sua,thongTinTinhController.ThemLienKet);

// Sửa liên kết
router.put('/lienket',authController.KiemTraTokenAdmin,footerValidate.Validate_LienKet_KhiThem_Sua,thongTinTinhController.SuaLienKet);

// Xóa liên kết
router.delete('/lienket',authController.KiemTraTokenAdmin,thongTinTinhController.XoaLienKet);



//-----------------Kiểm duyệt sản phẩm (Admin và kiểm duyệt viên)------------------
// Lấy danh sách sản phẩm kiểm duyệt theo filter
router.get('/sanphamkiemduyet',authController.KiemTraToken_Admin_KiemDuyetVien,sanPhamKiemDuyetValidate.ValidateFilterKhiTimKiem_SP_KiemDuyet,sanPhamKiemDuyetController.LaySanPhamTheoFilter);

// Lấy thông tin sản phẩm theo id cho trang preview
router.get('/laypreviewsanpham',authController.KiemTraToken_Admin_KiemDuyetVien,sanPhamKiemDuyetController.LayChiTietSanPhamChoTrangPreview);

// Phê duyệt hoặc bỏ phê duyệt
router.post('/pheduyetsanpham',authController.KiemTraToken_Admin_KiemDuyetVien,sanPhamKiemDuyetController.Duyet_BoDuyetSanPham);

// Phê duyệt hoặc bỏ phê duyệt
router.post('/baocaosanpham',authController.KiemTraToken_Admin_KiemDuyetVien,sanPhamKiemDuyetController.BaoCaoSanPham);


//-----------------Quản lý phí bán hàng(trang cài đặt phí mặc định)----------------------------------------------------------------------
// Lấy phí bán hàng mặc định
router.get('/phibanhangmacdinh',authController.KiemTraTokenAdmin,phiBanHangController.LayPhiBanHangMacDinh);

// Sửa phí bán hàng mặc định
router.put('/phibanhangmacdinh',authController.KiemTraTokenAdmin,thongTinTinhValidate.Validate_PhiBanHang_Khi_Sua,phiBanHangController.SuaPhiBanHangMacDinh);


//-----------------Quản lý phí bán hàng(trang quản lý thu phí)----------------------------------------------------------------------
// Lấy danh sách các shop theo filter(cho chức năng quản lý phí thuê)
router.get('/phibanhangshop',authController.KiemTraTokenAdmin,phiBanHangValidate.ValidateFilterKhiTimKiem_DanhSachShopVaPhiBanHang,phiBanHangController.LayThongTinShopVaPhiBanHangTheoFilter);

// Đánh dấu đã thu phí đơn hàng của shop theo list id
router.put('/thuphibanhangcuashop',authController.KiemTraTokenAdmin,phiBanHangController.DanhDauDaThuPhiDonHangCuaShop);


//-----------------Quản lý phí bán hàng(trang chi tiết phí thuê)----------------------------------------------------------------------
// Lấy thông tin shop đang quản lý phí
router.post('/thongtinshop',authController.KiemTraTokenAdmin,phiBanHangController.LayThongTinShopTrangChiTietPhiThue);

// Lấy thông tin shop đang quản lý phí
router.get('/donhangcuashop',authController.KiemTraTokenAdmin,phiBanHangValidate.ValidateFilterKhiTimKiem_DonHang_CuaShop,phiBanHangController.LayDonHangVaPhiBanHangCuaShopTheoFilter);

// Thu phí từng đơn hàng theo list item
router.put('/thuphidonhangtheolistiem',authController.KiemTraTokenAdmin,phiBanHangController.ThuPhiBanHangTheoLisstItem);





module.exports = router;