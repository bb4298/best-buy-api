const express = require('express');
const router = express.Router();
const {trangChuController,baiVietController,hoSoShopController,sanPhamTrangChuConttroller} = require('../controllers');
const {sanPhamTrangChuValidate} = require('../validators');

//Endpoint:localhost:3000/api/v1/admin/
/*Trang chủ-----------------------------------------------------------------------------------------------------------*/
// Lấy danh sách danh mục
router.get('/danhmucs',trangChuController.LayTatCaDanhMuc);

// Lấy tất cả carousel
router.get('/carousels',trangChuController.LayTatCaCarousel);

// Lấy sản phẩm hot theo trang( tại section sản phẩm)
router.get('/sanphamhot/:page',trangChuController.LaySanPhamHotTheoTrang);

// Lấy sản phẩm gợi ý theo trang( tại section sản phẩm)
router.get('/sanphamgoiy/:page',trangChuController.LaySanPhamGoiYTheoTrang);

// Lấy xu hướng tìm kiếm
router.get('/xuhuongs',trangChuController.LayDanhSachXuHuong);

// Lưu kết quả tìm kiếm (khi chưa đăng nhập và cả khi đăng nhập)
router.post('/luutukhoatimkiem',trangChuController.ThemTuKhoaTimKiem);

// Lấy thông báo từ admin (ko cần check token, lấy 5 thông báo)
router.get('/thongbao',trangChuController.LayThongBaoHeThong_Index);

// Lấy thông báo hệ thống theo trang
router.get('/thongbao/:page',trangChuController.LayThongBaoHeThong_TheoTrang);

// Lấy nội dung bài viết theo id
router.get('/baiviet',baiVietController.LayBaiVietTheoId);


/*Trang chi tiết sản phẩm----------------------------------------------------------------------------------------------*/
// Lấy sản phẩm theo id cho trang chi tiết
router.get('/sanphams',trangChuController.LayChiTietSanPham);

// Lấy sản phẩm khác của shop
router.get('/sanphamkhac',trangChuController.LaySanPhamKhacCuaShop);

// Lấy sản tương tự
router.get('/sanphamtuongtu',trangChuController.LaySanPhamTuongTu);

// Lấy đánh giá sản phẩm
router.get('/danhgiasanpham',trangChuController.LayDanhGiaSanPhamTheoTrang);

// Lấy danh sách danh mục
router.get('/laydanhmuc',trangChuController.LayDanhSachDanhMuc);

// Lấy sản phẩm theo filter khi nhập vào thanh search
router.get('/laysanphamtheofilter',sanPhamTrangChuValidate.ValidateFilterKhiTimKiem_TrangChu,sanPhamTrangChuConttroller.LaySanPhamTheoFilter_TrangChu);



/*Trang thông tin chủ shop--------------------------------------------------------------------------------------------*/
// Lấy thông tin mô tả shop(bằng tenDangNhap(trang thong tin chủ shop) hoặc id chủ shop(body chi tiêt sp)) bên trang hồ sơ shop của người bán
router.get('/thongtinshop',hoSoShopController.LayThongTinMoTaShop);

// Tăng lượt xem shop mỗi khi người dùng vào trang của shop
router.post('/ghethamshop',trangChuController.TangLuotXemKhiVaoTrangCuaShop);

// Tăng lượt xem sản phẩm mỗi khi người dùng vào trang sản phẩm
router.post('/tangluotxemsp',trangChuController.TangLuotXemKhiVaoTrangSanPham);


module.exports = router;