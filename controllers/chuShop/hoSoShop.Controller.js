const jwt = require("jsonwebtoken");
const {DbUrl,DbName} = require('../../configs/constant');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const {BoDau} = require('../../utils/hamHoTro');
module.exports = {
    //Thao tác CRUD hồ sơ shop của chủ shop-------------------------------------

    LayHoSoShopTheoIdChuShop: async function (req, res, next) {
        const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
        try {
            const idChuShop =ObjectId(req.chuShopId);
            await client.connect();
            const db = client.db(DbName);
            const colNguoiDung = db.collection('NguoiDung');
            let resHoSo = await colNguoiDung.find({_id:idChuShop,trangThaiKhoa:false}).next();
            client.close();
            if(resHoSo === null){
                res.status(200).json({
                    status: "fail",
                    message: 'Không có dữ liệu !',
                }); return;
            }
            res.status(200).json({
                status: "ok",
                data: resHoSo.thongTinShop,
            });
        } catch (err) {
            res.status(200).json({
                status: "fail",
                message: err.toString()
            });
        }
    },

    SuaHoSoShopTheoIdChuShop: async function (req, res, next) {
        const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
        try {
            const idChuShop =ObjectId(req.chuShopId);
            let {inforHoSo} = req.body
            await client.connect();
            const db = client.db(DbName);
            const colNguoiDung = db.collection('NguoiDung');
            let resSuaHoSo = await colNguoiDung.updateOne({_id:idChuShop,trangThaiKhoa:false},{
                $set:{
                    'thongTinShop':inforHoSo
                }
            });
            client.close();
            res.status(200).json({
                status: "ok",
                message: 'Thay đổi thành công !',
            });
        } catch (err) {
            res.status(200).json({
                status: "fail",
                message: err.toString()
            });
        }
    },

    //Lấy thông tin mô tả shop tại trang tổng quan chủ shop
    LayThongTinMoTaShopTrangTongQuan: async function (req, res, next) {
        const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
        try {
            const idChuShop =  ObjectId(req.chuShopId);
            await client.connect();
            const db = client.db(DbName);
            const colNguoiDung = db.collection('NguoiDung');
            const colSanPham = db.collection('SanPham');
            const colDanhGia = db.collection('DanhGia');
            const colDonHang = db.collection('DonHang');
            let resThongTinShop = await colNguoiDung.find({_id:idChuShop}).next();
            if(resThongTinShop=== null){
                res.status(200).json({
                    status: "fail",
                    message: 'Người dùng không tồn tại !'
                }); return
            }
            let {_id}= resThongTinShop;
            let resSanPhamBanChay = await colSanPham.find({ID_ChuShop:ObjectId(_id),trangThaiXoa: false}).sort({luotBan: -1}).toArray();

            let soSanPhamBiKhoa = resSanPhamBanChay.filter(item=>item.trangThaiKhoa === true).length;
            let soSanPhamHetHang = resSanPhamBanChay.filter(item=>item.conHang === false).length;
            let tongLuotXemSanPham = resSanPhamBanChay.reduce((sum,item) => sum + item.luotXem, 0);
            //Biểu đồ sản phẩm bán chạy
            let topBanChay = resSanPhamBanChay.slice(0,10).filter(item=>item.luotBan>0);
            let bieuDoTopBanChay ={
                labels:topBanChay.map((item=>item.tenSanPham)),
                series:topBanChay.map((item=>item.luotBan))
            };

            //Biểu đồ sản phẩm tồn kho
            let topBanE = resSanPhamBanChay.reverse().filter(item=>item.luotBan>0).slice(0,10);
            let bieuDoTopBanE ={
                labels:topBanE.map((item=>item.tenSanPham)),
                series:topBanE.map((item=>item.luotBan))
            };
            //console.log(resSanPhamsChay);
            // console.log(resSanPhamsChay.reverse());

            let soSaoTrungBinhCuaShop;
            let resDanhGiaShops = await colDanhGia.find({ID_ChuShop:ObjectId(_id)}).toArray();
            if(resDanhGiaShops.length === 0){
                soSaoTrungBinhCuaShop = 'Chưa có';
            }else{
                let sanPhamDaLoc = resSanPhamBanChay.filter(item=>item.luotBan>0);
                soSaoTrungBinhCuaShop = (sanPhamDaLoc.reduce((sum,item)=>{return sum + item.soSao;},0)/sanPhamDaLoc.length).toFixed(1);
            }

            let resDonHang = await colDonHang.find({ID_ChuShop:idChuShop,trangThaiXoa:false}).toArray();
            // console.log(resDonHang);
            let donHangChoXuLy = resDonHang.filter(item=>item.trangThaiDonHang === 0).length;
            let donHangDangShip = resDonHang.filter(item=>item.trangThaiDonHang === 1).length;
            let arrDonHangDaHoanThanh = resDonHang.filter(item=>item.trangThaiDonHang === 2);
            let donHangDaHoanThanh = arrDonHangDaHoanThanh.length;
            let donHangDaHuy = resDonHang.filter(item=>item.trangThaiDonHang === 3).length;

            //Lấy doanh số theo năm
            let doanhThuNam = [];
            let t1= []; let t2= []; let t3= []; let t4= []; let t5= []; let t6= [];
            let t7= []; let t8= []; let t9= []; let t10= []; let t11= []; let t12= [];
            arrDonHangDaHoanThanh.map((item)=>{
                const date = new Date(item.ngayTaoDon);
                if((date.getMonth()+1 === 1)) {t1.push(item)}   if((date.getMonth()+1 === 2)) {t2.push(item)}
                if((date.getMonth()+1 === 3)) {t3.push(item)}   if((date.getMonth()+1 === 4)) {t4.push(item)}
                if((date.getMonth()+1 === 5)) {t5.push(item)}   if((date.getMonth()+1 === 6)) {t6.push(item)}
                if((date.getMonth()+1 === 7)) {t7.push(item)}   if((date.getMonth()+1 === 8)) {t8.push(item)}
                if((date.getMonth()+1 === 9)) {t9.push(item)}   if((date.getMonth()+1 === 10)) {t10.push(item)}
                if((date.getMonth()+1 === 11)) {t11.push(item)} if((date.getMonth()+1 === 12)) {t12.push(item)}
            });

            t1 = t1.reduce((sum,item)=>sum+item.tongGia,0);      t2 = t2.reduce((sum,item)=>sum+item.tongGia,0);
            t3 = t3.reduce((sum,item)=>sum+item.tongGia,0);      t4 = t4.reduce((sum,item)=>sum+item.tongGia,0);
            t5 = t5.reduce((sum,item)=>sum+item.tongGia,0);      t6 = t6.reduce((sum,item)=>sum+item.tongGia,0);
            t7 = t7.reduce((sum,item)=>sum+item.tongGia,0);      t8 = t8.reduce((sum,item)=>sum+item.tongGia,0);
            t9 = t9.reduce((sum,item)=>sum+item.tongGia,0);      t10 = t10.reduce((sum,item)=>sum+item.tongGia,0);
            t11 = t11.reduce((sum,item)=>sum+item.tongGia,0);    t12 = t12.reduce((sum,item)=>sum+item.tongGia,0);

            doanhThuNam.push(t1);doanhThuNam.push(t2);doanhThuNam.push(t3); doanhThuNam.push(t4);
            doanhThuNam.push(t5);doanhThuNam.push(t6);doanhThuNam.push(t7); doanhThuNam.push(t8);
            doanhThuNam.push(t9);doanhThuNam.push(t10);doanhThuNam.push(t11); doanhThuNam.push(t12);

            client.close();
            res.status(200).json({
                status: "ok",
                data:{
                    info: resThongTinShop,
                    soSao: soSaoTrungBinhCuaShop,
                    danhGia:resDanhGiaShops.length,
                    thamGia:ObjectId(_id).getTimestamp(),
                    donHang:{
                        choXuLy:donHangChoXuLy,
                        dangShip:donHangDangShip,
                        daHoanThanh:donHangDaHoanThanh,
                        daHuy:donHangDaHuy,
                    },
                    sanPham:{
                        tongSoLuong:resSanPhamBanChay.length,
                        biKhoa:soSanPhamBiKhoa,
                        hetHang:soSanPhamHetHang
                    },
                    tongLuotXemSP:tongLuotXemSanPham,
                    bieuDoBanChay:bieuDoTopBanChay,
                    bieuDoBanE:bieuDoTopBanE,
                    bieuDoDoanhThuNam:doanhThuNam
                }
            });
        } catch (err) {
            res.status(200).json({
                status: "fail",
                message: err.toString()
            });
        }
    },


    //Lấy thông tin mô tả shop tại trang người bán
    LayThongTinMoTaShop: async function (req, res, next) {
        const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
        try {
            const tuKhoa = req.query.tukhoa; //tenDangNhap
            const type = parseInt(req.query.type); // 0:tìm theo tên đang nhập , 1:tìm theo id
            let query;
            if(type === 0){
                query = {tenDangNhap:tuKhoa,trangThaiKhoa:false};
            }
            if(type === 1){
                query = {_id:ObjectId(tuKhoa),trangThaiKhoa:false};
            }
            await client.connect();
            const db = client.db(DbName);
            const colNguoiDung = db.collection('NguoiDung');
            const colSanPham = db.collection('SanPham');
            const colDanhGia = db.collection('DanhGia');
            let resThongTinShop = await colNguoiDung.find(query).next();
            if(resThongTinShop=== null){
                res.status(200).json({
                    status: "fail",
                    message: 'Người dùng không tồn tại'
                }); return
            }
            let {_id}= resThongTinShop;
            let tongSanPhams = await colSanPham.find({ID_ChuShop:ObjectId(_id),trangThaiXoa: false}).toArray();
            let resSanPhams = await colSanPham.find({ID_ChuShop:ObjectId(_id),soSao:{'$gt':0},trangThaiXoa: false}).toArray();
            let soSaoTrungBinhCuaShop;
            let resDanhGiaShops = await colDanhGia.find({ID_ChuShop:ObjectId(_id)}).toArray();
            if(resDanhGiaShops.length === 0){
                soSaoTrungBinhCuaShop = 'Chưa có';
            }else{
                soSaoTrungBinhCuaShop = (resSanPhams.reduce((sum,item)=>{return sum + item.soSao;},0)/resSanPhams.length).toFixed(1);
            }
            client.close();
            res.status(200).json({
                status: "ok",
                info: resThongTinShop,
                soSao: soSaoTrungBinhCuaShop,
                danhGia:resDanhGiaShops.length,
                sanPham:tongSanPhams.length,
                thamGia:ObjectId(_id).getTimestamp()
            });
        } catch (err) {
            res.status(200).json({
                status: "fail",
                message: err.toString()
            });
        }
    },


    //Chỉnh sửa địa chỉ chủ shop ------------------------------------------------

    LayDiaChiShop: async function (req, res, next) {
        const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
        try {
            const {chuShopId} = req;

            await client.connect();
            const db = client.db(DbName);
            const colNguoiDung = db.collection('NguoiDung');
            let resDiaChi = await colNguoiDung.find({_id:ObjectId(chuShopId),trangThaiKhoa:false}).next();
            client.close();
            if(resDiaChi === null){
                res.status(200).json({
                    status: "fail",
                    message: 'Không tìm thấy địa chỉ chủ shop !',
                }); return;
            }
            res.status(200).json({
                status: "ok",
                data:resDiaChi.diaChi,
            });
        } catch (e) {
            res.status(200).json({
                status: "fail",
                message: e.toString()
            });
        }
    },

    SuaDiaChiShop: async function (req, res, next) {
        const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
        try {
            let {infoDiaChi} = req.body;
            const {chuShopId} = req;
            await client.connect();
            const db = client.db(DbName);
            const colNguoiDung = db.collection('NguoiDung');
            const colSanPham = db.collection('SanPham');
            let resSuaDiaChi = await colNguoiDung.updateOne({_id:ObjectId(chuShopId),trangThaiKhoa:false},{
                $set:{
                    diaChi:infoDiaChi
                }
            });
            let suaDiaChiSanPham = await colSanPham.updateMany({ID_ChuShop: ObjectId(chuShopId)}, {
                $set: {
                    ID_TinhThanh: infoDiaChi.ID_Tinh
                }
            });

            client.close();
            res.status(200).json({
                status: "ok",
                message: 'Thay đổi địa chỉ thành công !',
            });
        } catch (err) {
            res.status(200).json({
                status: "fail",
                message: err.toString()
            });
        }
    },


    //Quản lý phương thức thanh toán của shop -----------------------------------

    LayDataThanhToanOnline: async function (req, res, next) {
        const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
        try {
            const {chuShopId} = req;

            await client.connect();
            const db = client.db(DbName);
            const colNguoiDung = db.collection('NguoiDung');
            let resThanhToan = await colNguoiDung.find({_id:ObjectId(chuShopId),trangThaiKhoa:false}).next();
            client.close();
            if(resThanhToan === null){
                res.status(200).json({
                    status: "fail",
                    message: 'Không tìm thấy thông tin thanh toán online của chủ shop !',
                }); return;
            }
            res.status(200).json({
                status: "ok",
                data:resThanhToan.ppThanhToan,
            });
        } catch (e) {
            res.status(200).json({
                status: "fail",
                message: e.toString()
            });
        }
    },

    LuuDataThanhToanOnline: async function (req, res, next) {
        const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
        try {
            let {ppThanhToan} = req.body;
            const {chuShopId} = req;
            await client.connect();
            const db = client.db(DbName);
            const colNguoiDung = db.collection('NguoiDung');
            let resSThanhToan = await colNguoiDung.updateOne({_id:ObjectId(chuShopId),trangThaiKhoa:false},{
                $set:{
                    ppThanhToan:ppThanhToan
                }
            });

            client.close();
            res.status(200).json({
                status: "ok",
                message: 'Thay đổi thành công !',
            });
        } catch (e) {
            client.close();
            res.status(200).json({
                status: "fail",
                message: e.toString()
            });
        }
    },

    KhoaPhuongThucThanhToanOnline: async function (req, res, next) {
        const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
        try {
            let {ppThanhToan} = req.body;
            const {chuShopId} = req;
            await client.connect();
            const db = client.db(DbName);
            const colNguoiDung = db.collection('NguoiDung');
            let resSThanhToan = await colNguoiDung.updateOne({_id:ObjectId(chuShopId),trangThaiKhoa:false},{
                $set:{
                    ppThanhToan:ppThanhToan
                }
            });

            client.close();
            res.status(200).json({
                status: "ok",
                message: 'Thay đổi thành công !',
            });
        } catch (e) {
            client.close();
            res.status(200).json({
                status: "fail",
                message: e.toString()
            });
        }
    },
}