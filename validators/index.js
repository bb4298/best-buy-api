const danhMucValidate = require('./admin/danhMuc.Validate');
const carouselValidate = require('./admin/carousel.Validate');
const baivietValidate = require('./admin/baiViet.Validate');
const thongBaoValidate = require('./admin/thongbao.Validate');
const thongTinTinhValidate = require('./admin/thongTinTinh.Validate.js');
const chuShopValidate = require('./admin/chuShop.Validate.js');
const phiBanHangValidate = require('./admin/phiBanHang.Validate.js');

const nguoiDungValidate = require('./dungchung/nguoiDung.Validate');
const donHangValidate = require('./dungchung/donHang.Validate');
const footerValidate = require('./dungchung/footerValidate');
const sanPhamKiemDuyetValidate = require('./dungchung/sanPhamKiemDuyet.Validate');
const sanPhamTrangChuValidate = require('./dungchung/sanPhamTrangChu.Validate');

const thanhToanValidate = require('./chushop/thanhToan.Validate');
const sanPhamChuShopValidate = require('./chushop/sanPhamChuShop.Validate');
const maGiamGiaValidate = require('./chushop/maGiamGia.Validate');
const hoSoShopValidate = require('./chushop/hoSoShop.Validate');

const khachHangValidate = require('./khachhang/khachHang.Validate');

module.exports={
    danhMucValidate,
    carouselValidate,
    baivietValidate,
    thongBaoValidate,
    thongTinTinhValidate,
    chuShopValidate,
    phiBanHangValidate,

    nguoiDungValidate,
    donHangValidate,
    footerValidate,
    sanPhamKiemDuyetValidate,
    sanPhamTrangChuValidate,

    thanhToanValidate,
    sanPhamChuShopValidate,
    maGiamGiaValidate,
    hoSoShopValidate,

    khachHangValidate,
}