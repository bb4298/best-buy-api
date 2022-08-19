const trangChuController = require('../controllers/dungChung/trangChu.Controller');
const authController = require('../controllers/dungChung/auth.Controller');
const nguoiDungController = require('../controllers/dungChung/nguoiDung.Controller');
const sanPhamKiemDuyetController = require('../controllers/dungChung/sanPhamKiemDuyet.Controller');
const diaDiemController = require('../controllers/dungChung/diaDiem.Controller');
const donHangController = require('../controllers/dungChung/donHang.Controller');
const chatController = require('../controllers/dungChung/chat.Controller');
const triggerController = require('../controllers/dungChung/trigger.Controller');

const chuShopController = require('../controllers/admin/chuShop.Controller');
const danhMucController = require('../controllers/admin/danhMuc.Controller');
const carouselController = require('../controllers/admin/carousel.Controller');
const thongBaoController = require('../controllers/admin/thongBao.Controller');
const baiVietController = require('../controllers/admin/baiViet.Controller');
const thongTinTinhController = require('../controllers/admin/thongTinTinh.Controller');
const kiemDuyetVienController = require('../controllers/admin/kiemDuyetVien.Controller');
const phiBanHangController = require('../controllers/admin/phiBanHang.Controller');
const thongKeAdminController = require('../controllers/admin/thongKeAdmin.Controller.js');

const hoSoShopController = require('../controllers/chuShop/hoSoShop.Controller.js');
const sanPhamChuShopController = require('../controllers/chuShop/sanPhamChuShop.Controller');
const maGiamGiaController = require('../controllers/chuShop/maGiamGia.Controller');
const thongKeChuShopController = require('../controllers/chuShop/thongKeChuShop.Controller');

const khachHangController = require('../controllers/khachHang/khachHang.Controller');
const gioHangController = require('../controllers/khachHang/gioHang.Controller');
const thanhToanController = require('../controllers/khachHang/thanhToan.Controller');

const sanPhamTrangChuConttroller = require('./trangChu/sanPhamTrangChu.Controller');


module.exports = {
    trangChuController,
    authController,
    nguoiDungController,
    sanPhamKiemDuyetController,
    diaDiemController,
    donHangController,
    chatController,
    triggerController,

    chuShopController,
    danhMucController,
    carouselController,
    thongBaoController,
    baiVietController,
    thongTinTinhController,
    kiemDuyetVienController,
    phiBanHangController,
    thongKeAdminController,

    hoSoShopController,
    sanPhamChuShopController,
    maGiamGiaController,
    thongKeChuShopController,

    khachHangController,
    gioHangController,
    thanhToanController,

    sanPhamTrangChuConttroller,
};