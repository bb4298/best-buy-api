const ObjectId = require('mongodb').ObjectId;
const {BoDau} = require('../../utils/hamHoTro');
module.exports = {
    ValidateFilterKhiTimKiem(req, res, next) {
        const {chuShopId} = req;

        let {loaisp, searchtype, tukhoa, danhmuc, luotbanmin, luotbanmax, sosao, page, pagesize} = req.query;
        if (!page) {
            page = 0
        }
        if (parseInt(page) < 0) {
            page = 0
        }
        if (!pagesize) {
            pagesize = 10
        }
        if (parseInt(pagesize) < 0) {
            pagesize = 10
        }
        let filter = {trangThaiXoa: false, ID_ChuShop: ObjectId(chuShopId)};
        //console.log(loaisp)

        if (![0, 1, 2].includes(parseInt(loaisp))) {
            filter.trangThaiKhoa = false;
            filter.conHang = true
        }
        if (parseInt(loaisp) === 0) {
            filter.trangThaiKhoa = false;
            filter.conHang = true
        }         // còn hàng
        if (parseInt(loaisp) === 1) {
            filter.trangThaiKhoa = false;
            filter.conHang = false
        }        // hết hàng
        if (parseInt(loaisp) === 2) {
            filter.trangThaiKhoa = true
        }                                // đã ẩn

        if (![0, 1, 2].includes(parseInt(searchtype)) && tukhoa) {
            filter.lowerCase = {'$regex': BoDau(tukhoa), '$options': '$i'}
        }
        if (parseInt(searchtype) === 0 && tukhoa) {
            filter.lowerCase = {'$regex': BoDau(tukhoa), '$options': '$i'}
        }
        if (parseInt(searchtype) === 1 && tukhoa) {
            filter.id = {'$regex': BoDau(tukhoa), '$options': '$i'}
        }
        if (parseInt(searchtype) === 2 && tukhoa) {
            filter.thuongHieu = {'$regex': tukhoa.toUpperCase(), '$options': '$i'}
        }

        if (danhmuc) {
            filter.ID_DanhMuc = ObjectId(danhmuc)
        }

        if (luotbanmin && luotbanmax) {
            filter.luotBan = {'$gte': parseInt(luotbanmin), '$lte': parseInt(luotbanmax)}
        }
        if (luotbanmin && !luotbanmax) {
            filter.luotBan = {'$gte': parseInt(luotbanmin)}
        }
        if (!luotbanmin && luotbanmax) {
            filter.luotBan = {'$lte': parseInt(luotbanmax)}
        }
        if (sosao) {
            if ([1, 2, 3].includes(parseInt(sosao))) {
                filter.soSao = {'$lte': parseInt(sosao), '$gte': parseInt(sosao) - 1}
            }
            if (parseInt(sosao) === 4) {
                filter.soSao = {'$lte': 4.6, '$gte': 4}
            }
            if (parseInt(sosao) === 5) {
                filter.soSao = {'$lte': 5, '$gte': 4.7}
            }
        }

        req.filter = filter;
        req.page = page;
        req.pagesize = pagesize;

        next();
    },

    Validate_SanPham_Khi_Them_Sua: function (req, res, next) {
        const {tenSanPham, tiLeSale, thuongHieu, moTa, chiTietSanPham, anh, ID_DanhMuc} = req.body.infoSanPham;
        //console.log(JSON.stringify(req.body.infoSanPham));
        try {
            if ([tenSanPham, thuongHieu, moTa, anh, ID_DanhMuc].filter(item => !item).length > 0) {
                res.status(200).json({
                    status: 'fail',
                    message: 'Thông tin không được trống !'
                });
                return;
            }
            if (tenSanPham.length < 5 || tenSanPham.length > 100) {
                res.status(200).json({
                    status: 'fail',
                    message: 'Tên sản phẩm phải từ 5-100 ký tự !',
                    ref: 'tenSanPham'
                });
                return;
            }
            if (!/^[0-9][0-9]?$|^100$/.test(tiLeSale)) {
                res.status(200).json({
                    status: 'fail',
                    message: 'Tỉ lệ sale phải là số, thuộc [0-100] !'
                });
                return;
            }
            if (thuongHieu.length < 1 || thuongHieu.length > 60) {
                res.status(200).json({
                    status: 'fail',
                    message: 'Tên thương hiệu phải từ 1-60 ký tự !'
                });
                return;
            }
            if (moTa.length < 1 || moTa.length > 4000) {
                res.status(200).json({
                    status: 'fail',
                    message: 'Mô tả phải từ 1-4000 ký tự !',
                    ref: 'moTa'
                });
                return;
            }
            if (anh.length < 1 || anh.length > 10) {
                res.status(200).json({
                    status: 'fail',
                    message: 'Số lượng ảnh phải từ 1-10 ảnh !'
                });
                return;
            }
            if (chiTietSanPham.noiSanXuat > 100) {
                res.status(200).json({
                    status: 'fail',
                    message: 'Nơi sản xuất không được quá 100 ký tự !'
                });
                return;
            }
            if (chiTietSanPham.cheDoBaoHanh > 100) {
                res.status(200).json({
                    status: 'fail',
                    message: 'Nơi sản xuất không được quá 100 ký tự !'
                });
                return;
            }
            if (chiTietSanPham.quaTangKem > 100) {
                res.status(200).json({
                    status: 'fail',
                    message: 'Nơi sản xuất không được quá 100 ký tự !'
                });
                return;
            }

            next();
        } catch (err) {
            res.status(200).json({
                status: "fail",
                message: err.toString()
            });
        }
    },

    Validate_PhanLoai_Khi_Them_Sua: function (req, res, next) {
        let {tenPhanLoai, gia, soLuong} = req.body.inputPhanLoai;
        console.log(typeof gia);
        try {
            if (!tenPhanLoai) {
                res.status(200).json({
                    status: 'fail',
                    message: 'Thông tin không được trống !'
                });
                return;
            }
            if (!/^\d{1,12}$/.test(gia)) {
                res.status(200).json({
                    status: 'fail',
                    message: 'Giá phải là số dương, không được vượt quá 12 ký tự !'
                });
                return;
            }
            if (gia< 1000) {
                res.status(200).json({
                    status: 'fail',
                    message: 'Giá không được bé hơn 1000'
                });
                return;
            }
            if (!/^\d{1,12}$/.test(soLuong)) {
                res.status(200).json({
                    status: 'fail',
                    message: 'Số lượng phải là số dương, không được vượt quá 12 ký tự !'
                });
                return;
            }
            next();
        } catch (err) {
            res.status(200).json({
                status: "fail",
                message: err.toString()
            });
        }
    },

}