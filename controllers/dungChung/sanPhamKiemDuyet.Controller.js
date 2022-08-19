const {DbUrl, DbName} = require('../../configs/constant');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const {BoDau} = require('../../utils/hamHoTro');
module.exports = {
    //Thao tác CRUD sanpham của admin
    LaySanPhamTheoFilter: async function (req, res, next) {
        const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
        const {filter, page, pagesize} = req;
        //console.log(JSON.stringify({filter, page, pagesize}));
        try {
            await client.connect();
            const db = client.db(DbName);
            const colSanPham = db.collection('SanPham');
            let count = await colSanPham.find(filter).toArray();
            let soTrang = Math.ceil(parseInt(count.length) / pagesize);
            let arrSanPham = await colSanPham.find(filter).sort({_id: -1}).limit(parseInt(pagesize)).skip(parseInt(pagesize) * parseInt(page)).toArray();
            console.log(arrSanPham)
            client.close();
            res.status(200).json({
                status: "ok",
                data: arrSanPham,
                soTrang: soTrang,
                count: count.length
            });
        } catch (e) {
            console.log(e);
            res.status(200).json({
                status: "fail",
                message: e.toString()
            });
        }
    },

    LayChiTietSanPhamChoTrangPreview: async function (req, res, next) {
        const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
        try {
            let idSanPham = ObjectId(req.query.id);
            await client.connect();
            const db = client.db(DbName);
            const colSanPham = db.collection('SanPham');
            const colPhanLoai = db.collection('PhanLoai');
            const colDanhMuc = db.collection('DanhMuc');
            let resultSanPham = await colSanPham.find({_id: idSanPham, trangThaiXoa: false}).next();
            if (!resultSanPham) {
               // console.log('null')
                res.status(200).json({
                    status: "fail",
                    message: 'Sản phẩm không tồn tại !'
                });
                return;
            }

            let resSanPham = await colSanPham.find({_id: idSanPham, trangThaiXoa: false}).next();
            let resPhanLoai = await colPhanLoai.find({
                ID_SanPham: idSanPham,
                soLuong: {'$gt': 0},
                trangThaiXoa: false
            }).sort({gia: 1}).toArray();
            let resDanhMuc = await colDanhMuc.find({_id: ObjectId(resSanPham.ID_DanhMuc)}).next();

            client.close();
            res.status(200).json({
                status: "ok",
                dataSanPham: resSanPham,
                dataPhanLoai: resPhanLoai,
                dataDanhMuc: resDanhMuc
            });
        } catch (e) {
            res.status(200).json({
                status: "fail",
                message: e.toString()
            });
        }
    },


    ThemSanPham: async function (req, res, next) {
        const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
        const quyen = req.quyen;
        if (!quyen.includes(0)) {
            res.status(200).json({
                status: 'fail',
                message: 'Chức năng thêm đã bị khóa, xin vui lòng liên hệ quản trị viên để mở lại tài khoản !'
            });
            return;
        }
        try {
            const chuShopId = ObjectId(req.chuShopId);
            const {tenSanPham, tiLeSale, thuongHieu, moTa, chiTietSanPham, anh, kichThuoc, ID_DanhMuc} = req.body.infoSanPham;
            await client.connect();
            const db = client.db(DbName);
            const colSanPham = db.collection('SanPham');
            //Tạo parameter sanpham
            const idSP = ObjectId();
            let sanpham = {
                _id: idSP,
                tenSanPham: tenSanPham,
                lowerCase: BoDau(tenSanPham),
                gia: 0,
                tiLeSale: parseInt(tiLeSale),
                thuongHieu: thuongHieu,
                moTa: moTa,
                chiTietSanPham: chiTietSanPham,
                anh: anh,
                kichThuoc: {
                    nang: parseInt(kichThuoc.nang),
                    rong: parseInt(kichThuoc.rong),
                    dai: parseInt(kichThuoc.dai),
                    cao: parseInt(kichThuoc.cao),
                },
                soSao: 0,
                luotBan: 0,
                conHang: false,
                trangThaiKhoa: true,
                trangThaiXoa: false,
                ID_DanhMuc: ObjectId(ID_DanhMuc),
                ID_ChuShop: ObjectId(chuShopId)
            }
            let result = await colSanPham.insertOne(sanpham);
            client.close();
            res.status(200).json({
                status: 'ok',
                message: 'Thêm thành công !',
                idSP: idSP
            });

        } catch (e) {
            console.log(e)
            res.status(200).json({
                status: "fail",
                message: e.toString()
            });
        }
    },

    SuaSanPham: async function (req, res, next) {
        const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
        try {
            const chuShopId = ObjectId(req.chuShopId);
            const {_id, tenSanPham, tiLeSale, thuongHieu, moTa, chiTietSanPham, anh, kichThuoc, ID_DanhMuc} = req.body.infoSanPham;
            await client.connect();
            const db = client.db(DbName);
            const colSanPham = db.collection('SanPham');
            let result = await colSanPham.updateOne({_id: ObjectId(_id), ID_ChuShop: chuShopId}, {
                $set: {
                    tenSanPham: tenSanPham,
                    lowerCase: BoDau(tenSanPham),
                    tiLeSale: parseInt(tiLeSale),
                    thuongHieu: thuongHieu,
                    moTa: moTa,
                    chiTietSanPham: chiTietSanPham,
                    anh: anh,
                    kichThuoc: {
                        nang: parseInt(kichThuoc.nang),
                        rong: parseInt(kichThuoc.rong),
                        dai: parseInt(kichThuoc.dai),
                        cao: parseInt(kichThuoc.cao),
                    },
                    ID_DanhMuc: ObjectId(ID_DanhMuc),
                }
            });
            client.close();
            res.status(200).json({
                status: 'ok',
                message: 'Thay đổi thành công !',
            });
        } catch (e) {
            res.status(200).json({
                status: "fail",
                message: e.toString()
            });
        }
    },

    XoaSanPham: async function (req, res, next) {
        const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
        try {
            let ids = req.body.listid; //array

            await client.connect();
            const db = client.db(DbName);
            const colSanPham = db.collection('SanPham');
            let delResult = await colSanPham.updateMany({_id: {'$in': ids.map(item => ObjectId(item))}}, {$set: {trangThaiXoa: true}});
            client.close();
            res.status(200).json({
                status: "ok",
                message: `Đã xóa ${ids.length} sản phẩm !`
            });
        } catch (e) {
            res.status(200).json({
                status: "fail",
                message: e.toString()
            });
        }
    },

    Duyet_BoDuyetSanPham: async function (req, res, next) {
        const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
        try {
            let ids = req.body.listid; //array
            let type = req.body.type; //array

            await client.connect();
            const db = client.db(DbName);
            const colSanPham = db.collection('SanPham');
            let duyetResult = await colSanPham.updateMany({_id: {'$in': ids.map(item => ObjectId(item))}}, {
                $set: {
                    trangThaiDuyet: type,
                    trangThaiKhoa: type ? false : true,
                    trangThaiBaoCao:false
                }
            });
            client.close();
            res.status(200).json({
                status: "ok",
                message: `Đã ${type?'duyệt':'bỏ duyệt'} ${ids.length} sản phẩm !`
            });
        } catch (e) {
            res.status(200).json({
                status: "fail",
                message: e.toString()
            });
        }
    },

    BaoCaoSanPham: async function (req, res, next) {
        const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
        try {
            let ids = req.body.listid; //array

            await client.connect();
            const db = client.db(DbName);
            const colSanPham = db.collection('SanPham');
            let duyetResult = await colSanPham.updateMany({_id: {'$in': ids.map(item => ObjectId(item))}}, {
                $set: {
                    trangThaiBaoCao: true,
                }
            });
            client.close();
            res.status(200).json({
                status: "ok",
                message: `Báo cáo vi phạm thành công !`
            });
        } catch (e) {
            res.status(200).json({
                status: "fail",
                message: e.toString()
            });
        }
    },

}