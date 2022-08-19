const {DbUrl,DbName} = require('../../configs/constant');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const Double = require('mongodb').Double;
const {BoDau} = require('../../utils/hamHoTro');
const shortId = require('short-id');
const socketApi = require("../../socketApi");
module.exports = {
    //Thao tác CRUD sanpham của chủ shop
    LaySanPhamTheoFilter: async function (req, res, next) {
        const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
        const {filter,page, pagesize }= req;
        console.log(  JSON.stringify({filter,page, pagesize }));
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

    LaySanPhamTheoId: async function (req, res, next) {
        const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
        try {
            const idSP = ObjectId(req.params.id);
            const chuShopId = ObjectId(req.chuShopId);
            await client.connect();
            const db = client.db(DbName);
            const colSanPham = db.collection('SanPham');
            const colPhanLoai = db.collection('PhanLoai');
            let resultSanPham = await colSanPham.find({_id: idSP,ID_ChuShop:chuShopId,trangThaiXoa:false}).next();
            if(!resultSanPham){
                res.status(200).json({
                    status: "fail",
                    message: 'Sản phẩm không tồn tại !'
                }); return;
            }
            let resultPhanLoai = await colPhanLoai.find({ID_SanPham: idSP,trangThaiXoa:false}).toArray();
            client.close();
            res.status(200).json({
                status: 'ok',
                dataSP:resultSanPham,
                dataPL:resultPhanLoai
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
        if(!quyen.includes(0)){
            res.status(200).json({
                status: 'fail',
                message: 'Chức năng thêm đã bị khóa, xin vui lòng liên hệ quản trị viên để bật chức năng thêm !'
            });return;
        }
        try {
            const chuShopId = ObjectId(req.chuShopId);
            const {tenSanPham,tiLeSale,thuongHieu,moTa,chiTietSanPham,anh,ID_DanhMuc} = req.body.infoSanPham;
            await client.connect();
            const db = client.db(DbName);
            const colSanPham = db.collection('SanPham');
            const colNguoiDung = db.collection('NguoiDung');
            const resDiaChi = await colNguoiDung.find({_id:chuShopId,trangThaiKhoa:false}).next();

            //Tạo parameter sanpham
            const idSP = ObjectId();
            let sanpham = {
                _id: idSP,
                id: shortId.generate().toUpperCase(),
                tenSanPham: tenSanPham,
                lowerCase: BoDau(tenSanPham),
                gia:0,
                tiLeSale: parseInt(tiLeSale),
                thuongHieu: thuongHieu.toUpperCase(),
                moTa: moTa,
                chiTietSanPham: chiTietSanPham,
                anh: anh,
                soSao: Double(0),
                luotBan: 0,
                luotXem: 0,
                diemXepHang: 0,
                conHang: false,
                trangThaiDuyet: null,
                trangThaiKhoa: true,
                trangThaiXoa: false,
                trangThaiBaoCao: false,
                ID_TinhThanh: resDiaChi.diaChi.ID_Tinh,
                ID_DanhMuc: ObjectId(ID_DanhMuc),
                ID_ChuShop: ObjectId(chuShopId)
            }
            let result = await colSanPham.insertOne(sanpham);
            client.close();
            res.status(200).json({
                status: 'ok',
                message: 'Thêm thành công !',
                idSP:idSP
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
        const quyen = req.quyen;
        if(!quyen.includes(1)){
            res.status(200).json({
                status: 'fail',
                message: 'Chức năng sửa đã bị khóa, xin vui lòng liên hệ quản trị viên để bật chức năng sửa !'
            });return;
        }
        try {
            const chuShopId = ObjectId(req.chuShopId);
            const {_id,tenSanPham,tiLeSale,thuongHieu,moTa,chiTietSanPham,anh,ID_DanhMuc} = req.body.infoSanPham;
            await client.connect();
            const db = client.db(DbName);
            const colSanPham = db.collection('SanPham');
            const colPhanLoai = db.collection('PhanLoai');
            let result = await colSanPham.updateOne({_id:ObjectId(_id),ID_ChuShop:chuShopId},{
                $set:{
                    tenSanPham: tenSanPham,
                    lowerCase: BoDau(tenSanPham),
                    tiLeSale: parseInt(tiLeSale),
                    thuongHieu:thuongHieu.toUpperCase(),
                    moTa:moTa,
                    chiTietSanPham:chiTietSanPham,
                    anh:anh,
                    // kichThuoc:{
                    //     nang:parseInt(kichThuoc.nang),
                    //     rong:parseInt(kichThuoc.rong),
                    //     dai:parseInt(kichThuoc.dai),
                    //     cao:parseInt(kichThuoc.cao),
                    // },
                    ID_DanhMuc:ObjectId(ID_DanhMuc),
                }
            });

            res.status(200).json({
                status: 'ok',
                message: 'Thay đổi thành công !',
            });

            let resPhanLoai= await colPhanLoai.find({ID_SanPham:ObjectId(_id),trangThaiXoa: false,soLuong:{'$gt':0}}).sort({gia:1}).toArray();
            let updateGiaSP = await colSanPham.updateOne({_id:ObjectId(_id)},{
                $set:{
                    gia:resPhanLoai[0].gia - (resPhanLoai[0].gia/100* parseInt(tiLeSale)),
                }
            });
        } catch (e) {
            res.status(200).json({
                status: "fail",
                message: e.toString()
            });
        }
        socketApi.CapNhatSoLuongHang();
        client.close();
    },

    XoaSanPham: async function (req, res, next) {
        const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
        const quyen = req.quyen;
        if(!quyen.includes(2)){
            res.status(200).json({
                status: 'fail',
                message: 'Chức năng xóa đã bị khóa, xin vui lòng liên hệ quản trị viên để bật chức năng xóa !'
            });return;
        }
        try {
            let ids = req.body.listid; //array

            await client.connect();
            const db = client.db(DbName);
            const colSanPham = db.collection('SanPham');
            let delResult = await colSanPham.updateMany({_id: {'$in':ids.map(item => ObjectId(item) )}}, {$set: {trangThaiXoa: true}});
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

    ThemPhanLoai: async function (req, res, next) {
        const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
        try {
            const chuShopId = ObjectId(req.chuShopId);
            const idSP = ObjectId(req.body.idSP);
            const {tenPhanLoai,gia,soLuong} = req.body.inputPhanLoai;
            await client.connect();
            const db = client.db(DbName);
            const colPhanLoai = db.collection('PhanLoai');
            const colSanPham = db.collection('SanPham');

            let resPL= await colPhanLoai.find({ID_SanPham:ObjectId(idSP),trangThaiXoa: false}).toArray();
            if(resPL.length === 20){
                client.close();
                res.status(200).json({
                    status: "fail",
                    message: 'Chỉ được tạo tối đa 20 phân loại !'
                }); return;
            }
            if(resPL.filter(item=>BoDau(item.tenPhanLoai)=== BoDau(tenPhanLoai)).length>0){
                client.close();
                res.status(200).json({
                    status: "fail",
                    message: 'Tên phân loại đã tồn tại, vui lòng tạo tên khác !'
                }); return;
            }
            //Tạo parameter phân laoi
            let phanLoai = {
                tenPhanLoai: tenPhanLoai,
                gia: parseInt(gia),
                soLuong: parseInt(soLuong),
                trangThaiXoa:false,
                ID_SanPham:idSP,
                ID_ChuShop:chuShopId
            }
            let r = await colPhanLoai.insertOne(phanLoai);

            res.status(200).json({
                status: 'ok',
                message: 'Thêm phân loại thành công !',
                idSP:idSP
            });
            let resPhanLoai= await colPhanLoai.find({ID_SanPham:ObjectId(idSP),trangThaiXoa: false,soLuong:{'$gte':0}}).sort({gia:1}).toArray();
            let resSanPham = await colSanPham.updateOne({_id:ObjectId(idSP)},{
                $set:{
                    gia:resPhanLoai[0].gia,
                    conHang:resPhanLoai.reduce((sum, item) => {return sum + item.soLuong}, 0) > 0,
                    //trangThaiDuyet:true
                }
            });
            socketApi.CapNhatSoLuongHang();
            client.close();

        } catch (e) {
            console.log(e);
            res.status(200).json({
                status: "fail",
                message: e.toString()
            });
        }
    },

    SuaPhanLoai: async function (req, res, next) {
        const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
        try {
             const chuShopId = ObjectId(req.chuShopId);
            const idSP = req.body.idsanpham;
            const {_id,tenPhanLoai,gia,soLuong} = req.body.inputPhanLoai;
            await client.connect();
            const db = client.db(DbName);
            const colPhanLoai = db.collection('PhanLoai');
            const colSanPham = db.collection('SanPham');

            let resKiemTraPLThuocTaiKhoan= await colPhanLoai.find({_id:ObjectId(_id),ID_ChuShop:chuShopId,trangThaiXoa: false}).next();
            if(!resKiemTraPLThuocTaiKhoan) {
                client.close();
                res.status(200).json({
                    status: "fail",
                    message: 'Phân loại đang sửa không thuộc tài khoản này !'
                }); return;
            }

            let resKiemTraPLTrungTen= await colPhanLoai.find({ID_SanPham:ObjectId(idSP),_id:{$ne:ObjectId(_id)},tenPhanLoai:tenPhanLoai,trangThaiXoa: false}).next();
            if(resKiemTraPLTrungTen){
                client.close();
                res.status(200).json({
                    status: "fail",
                    message: 'Tên phân loại đã tồn tại, vui lòng đặt tên khác !'
                }); return;
            }

            let result = await colPhanLoai.updateOne({_id:ObjectId(_id)},{
                $set:{
                    tenPhanLoai: tenPhanLoai,
                    gia: parseInt(gia),
                    soLuong: parseInt(soLuong),
                }
            });

            res.status(200).json({
                status: 'ok',
                message: 'Sửa phân loại thành công !',
            });

            let resPhanLoai= await colPhanLoai.find({ID_SanPham:ObjectId(idSP),trangThaiXoa: false,soLuong:{'$gte':0}}).sort({gia:1}).toArray();
            let resSanPham = await colSanPham.find({_id:ObjectId(idSP)}).next();
            let tiLeSale = resSanPham.tiLeSale;
            let updateGiaSP = await colSanPham.updateOne({_id:ObjectId(idSP)},{
                $set:{
                    gia:resPhanLoai[0].gia - (resPhanLoai[0].gia/100*tiLeSale),
                    conHang:resPhanLoai.reduce((sum, item) => {return sum + item.soLuong}, 0) > 0,
                }
            });
        } catch (e) {
            console.log(e);
            res.status(200).json({
                status: "fail",
                message: e.toString()
            });
        }
        socketApi.CapNhatSoLuongHang();
        client.close();
    },

    XoaPhanLoai: async function (req, res, next) {
        const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
        try {
            // const chuShopId = ObjectId(req.chuShopId);
            const idPL = ObjectId(req.body.idPL);
            await client.connect();
            const db = client.db(DbName);
            const colPhanLoai = db.collection('PhanLoai');
            const colSanPham = db.collection('SanPham');
            let result = await colPhanLoai.updateOne({_id:idPL},{
                $set:{
                    trangThaiXoa: true,
                }
            });

            const resIDSanPham = await colPhanLoai.find({_id: idPL}).next();  // Lấy id sản phẩm từ col phân loại
            const {ID_SanPham} = resIDSanPham;
            const resKiemTraItemCuoiCung = await colPhanLoai.find({ID_SanPham: ObjectId(ID_SanPham),trangThaiXoa: false}).next();
            if(resKiemTraItemCuoiCung === null ){
             const r = await colSanPham.updateOne({_id:ObjectId(ID_SanPham)},{
                 $set:{
                     trangThaiKhoa:true,
                     trangThaiDuyet:false
                 }
             });
            }
            res.status(200).json({
                status: 'ok',
                message: 'Xóa phân loại thành công !'
            });

            let resPhanLoai= await colPhanLoai.find({ID_SanPham:ObjectId(ID_SanPham),trangThaiXoa: false,soLuong:{'$gte':0}}).sort({gia:1}).toArray();
            let resSanPham = await colSanPham.updateOne({_id:ObjectId(ID_SanPham)},{
                $set:{
                    gia:resPhanLoai[0].gia,
                    conHang:resPhanLoai.reduce((sum, item) => {return sum + item.soLuong}, 0) > 0,
                }
            });
            socketApi.CapNhatSoLuongHang();
            client.close();
        } catch (e) {
            console.log(e);
            res.status(200).json({
                status: "fail",
                message: e.toString()
            });
        }
    },

    LockSanPham: async function (req, res, next) {
        const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
        try {
            const chuShopId = ObjectId(req.chuShopId);
            const idSP = ObjectId(req.body.idSP);
            const type = req.body.type; // true:khóa sp , false:mở khóa sp
            await client.connect();
            const db = client.db(DbName);
            const colSanPham = db.collection('SanPham');
            const colPhanLoai = db.collection('PhanLoai');

            if(!type) {
                let resPhanLoai = await colPhanLoai.find({ID_SanPham: idSP,trangThaiXoa:false}).toArray();
                if(resPhanLoai.length === 0 ){
                    res.status(200).json({
                        status: "fail",
                        message: 'Vui lòng thêm ít nhất một phân loại trước khi mở khóa sản phẩm !'
                    }); return;
                }

                let resSanPham = await colSanPham.find({_id: idSP,trangThaiDuyet:true, trangThaiXoa:false}).next();
                if(resSanPham === null ){
                    res.status(200).json({
                        status: "fail",
                        message: 'Sản phẩm đang được chờ duyệt, sau khi được duyệt sản phẩm sẽ được mở bán !'
                    }); return;
                }



            }

            let r = await colSanPham.updateOne({_id:idSP,ID_ChuShop:chuShopId},{
                $set:{
                   trangThaiKhoa: type
                }
            });
            client.close();
            res.status(200).json({
                status: 'ok',
                message: `${type ? 'Khóa' : 'Mở khóa'} sản phẩm thành công !`,
            });
        } catch (e) {
            res.status(200).json({
                status: "fail",
                message: e.toString()
            });
        }
    },

}