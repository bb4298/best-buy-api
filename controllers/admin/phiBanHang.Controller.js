const {DbUrl,DbName} = require('../../configs/constant');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const ids = require('short-id');
const {mapAsync,filterAsync} = require('lodasync');
module.exports = {
    // Quản lý phí bán hàng của các shop
    LayPhiBanHangMacDinh: async function (req, res, next) {
        const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
        try {
            await client.connect();
            const db = client.db(DbName);
            const colCauHinh = db.collection('CauHinh');
            const resPhiBanHangMacDinh = await colCauHinh.find({type:0}).next();
            const {phiBanHangMacDinh} = resPhiBanHangMacDinh;

            client.close();
            res.status(200).json(phiBanHangMacDinh);
        } catch (e) {
            res.status(200).json({
                status: "fail",
                message: e.toString()
            });
        }
    },

    SuaPhiBanHangMacDinh: async function (req, res, next) {
        const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
        try {
            const {phiBanHangMacDinh} = req.body;
            await client.connect();
            const db = client.db(DbName);
            const colCauHinh = db.collection('CauHinh');
            let resThongTinTinh = await colCauHinh.updateOne({type:0},{
                $set:{
                    phiBanHangMacDinh: parseInt(phiBanHangMacDinh)
                }
            });
            client.close();
            res.status(200).json({
                status: 'ok',
                message:'Thay đổi thành công !'
            });
        } catch (e) {
            res.status(200).json({
                status: "fail",
                message: e.toString()
            });
        }
    },

    LayThongTinShopVaPhiBanHangTheoFilter: async function (req, res, next) {
        const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
        const {filter,page, pagesize,sort }= req;
      //  console.log(  JSON.stringify({filter,page, pagesize,sort }));
        try {
            await client.connect();
            const db = client.db(DbName);
            const colNguoiDung = db.collection('NguoiDung');
            let count = await colNguoiDung.find(filter).toArray();
            let soTrang = Math.ceil(parseInt(count.length) / pagesize);
            let arrShopVaPhiBanHang = await colNguoiDung.find(filter).sort(sort).limit(parseInt(pagesize)).skip(parseInt(pagesize) * parseInt(page)).toArray();
            //console.log(arrShopVaPhiBanHang);
            client.close();
            res.status(200).json({
                status: "ok",
                data: arrShopVaPhiBanHang,
                soTrang: soTrang,
                count:count.length
            });

        } catch (e) {
            console.log(e);
            res.status(200).json({
                status: "fail",
                message: e.toString()
            });
        }
    },

    DanhDauDaThuPhiDonHangCuaShop: async function (req, res, next) {
        const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
        try {
            const {listid} = req.body;
            await client.connect();
            const db = client.db(DbName);
            const colNguoiDung = db.collection('NguoiDung');
            const colDonHang = db.collection('DonHang');
            console.log(listid);
            const updatePhiNguoiDung = await colNguoiDung.updateMany({_id:{'$in':listid.map(item=>ObjectId(item))}},{
                $set:{
                    phiNoHienTai:0
                }
            });

            let duyetVaUpdateTungDonHang = await mapAsync(async (item)=>{
                let updateDonHang = await colDonHang.updateMany({ID_ChuShop:ObjectId(item)},{
                    $set:{
                        trangThaiThuPhi:true
                    }
                });
            },listid);

            client.close();
            res.status(200).json({
                status: 'ok',
                message:`Đã thu phí của ${listid.length} shop !`
            });
        } catch (e) {
            res.status(200).json({
                status: "fail",
                message: e.toString()
            });
        }
    },

    LayThongTinShopTrangChiTietPhiThue: async function (req, res, next) {
        const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
        try {
            //const idChuShop =  ObjectId(req.chuShopId);
            const {idshop} = req.body;
            await client.connect();
            const db = client.db(DbName);
            const colNguoiDung = db.collection('NguoiDung');
            const colSanPham = db.collection('SanPham');
            const colDanhGia = db.collection('DanhGia');
            const colDonHang = db.collection('DonHang');
            let resThongTinShop = await colNguoiDung.find({_id:ObjectId(idshop)}).next();
            if(resThongTinShop=== null){
                res.status(200).json({
                    status: "fail",
                    message: 'Người dùng không tồn tại !'
                }); return
            }
            let {_id}= resThongTinShop;
            let resSanPhamsChay = await colSanPham.find({ID_ChuShop:ObjectId(_id),trangThaiXoa: false}).sort({luotBan: -1}).toArray();
            let soSaoTrungBinhCuaShop;
            let resDanhGiaShops = await colDanhGia.find({ID_ChuShop:ObjectId(_id)}).toArray();
            if(resDanhGiaShops.length === 0){
                soSaoTrungBinhCuaShop = 0;
            }else{
                soSaoTrungBinhCuaShop = (resSanPhamsChay.reduce((sum,item)=>{return sum + item.soSao;},0)/resSanPhamsChay.length).toFixed(1);
            }

            const resDonHang = await colDonHang.find({ID_ChuShop:ObjectId(_id),trangThaiDonHang:2,trangThaiThuPhi:true}).toArray();
           /* console.log('resDonHang');
            console.log(resDonHang);*/
            const tongPhiDaThu = resDonHang.reduce((sum,item)=>{return sum + item.phiBanHang},0);
            client.close();
            res.status(200).json({
                status: "ok",
                data:{
                    info: resThongTinShop,
                    soSao: soSaoTrungBinhCuaShop,
                    danhGia:resDanhGiaShops.length,
                    thamGia:ObjectId(_id).getTimestamp(),
                    sanPham:{
                        tongSoLuong:resSanPhamsChay.length,
                    },
                    phiDaThu:tongPhiDaThu
                }
            });
        } catch (e) {
            res.status(200).json({
                status: "fail",
                message: e.toString()
            });
        }
    },

    LayDonHangVaPhiBanHangCuaShopTheoFilter: async function (req, res, next) {
        const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
        const {filter, page, pagesize, sort} = req;
        try {
            await client.connect();
            const db = client.db(DbName);
            const DonHang = db.collection('DonHang');
            let count = await DonHang.find(filter).toArray();
            let tongDoanhThu = count.reduce((sum,item)=>sum+item.tongGia,0);
            let tongPhi = count.reduce((sum,item)=>sum+item.phiBanHang,0);
            let soTrang = Math.ceil(parseInt(count.length) / pagesize);
            let arrDonHang = await DonHang.find(filter).sort(sort).limit(parseInt(pagesize)).skip(parseInt(pagesize) * parseInt(page)).toArray();

            client.close();
            res.status(200).json({
                status: "ok",
                data: arrDonHang,
                soTrang: soTrang,
                count: count.length,
                tongDoanhThu:tongDoanhThu,
                tongPhi:tongPhi
            });
        } catch (e) {
            console.log(e);
            res.status(200).json({
                status: "fail",
                message: e.toString()
            });
        }
    },

    ThuPhiBanHangTheoLisstItem: async function (req, res, next) {
        const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
        try {
            let listId = req.body.listid; //array

            await client.connect();
            const db = client.db(DbName);

            const colDonHang = db.collection('DonHang');
            const colNguoiDung = db.collection('NguoiDung');
            const danhSachDonHang = await colDonHang.find({_id:{'$in':listId.map(item => ObjectId(item))}}).toArray();
            const idChuShop = ObjectId(danhSachDonHang[0].ID_ChuShop);
            const tongTienPhi = danhSachDonHang.reduce((sum, item) =>sum+item.phiBanHang,0);
            let capNhatDonHang = await colDonHang.updateMany({_id: {'$in': listId.map(item => ObjectId(item))}},  {
                $set: {
                    trangThaiThuPhi: true,
                }
            });

            let capNhatChuShop = await colNguoiDung.updateOne({_id: idChuShop},  {
                $inc: {
                    phiNoHienTai: -Math.abs(parseInt(tongTienPhi)),
                }
            });
            res.status(200).json({
                status: "ok",
                message: `Đã thu phí ${listId.length} đơn hàng !`
            });

        } catch (e) {
            console.log('e')
            console.log(e)
            res.status(200).json({
                status: "fail",
                message: e.toString()
            });
        }
        client.close();
    },

}