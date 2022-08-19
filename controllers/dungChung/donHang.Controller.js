const {DbUrl, DbName} = require('../../configs/constant');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const Double = require('mongodb').Double;
const axios = require('axios');
const {mapAsync, filterAsync} = require('lodasync');
const qs = require('qs');
const shortId = require('short-id');
const moment = require('moment');
const socketApi = require("../../socketApi");
module.exports = {
    /*Thao tác của khách hàng----------------------------------------------------------------------------------*/
    DatHang: async function (req, res, next) {
        const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
        try {
            const khachHangId = ObjectId(req.khachHangId);
            const {donHang, infoNguoiNhan, magiamgia, trangThaiThanhToan} = req.body;
            //console.log(JSON.stringify(donHang, null, 2));
            const {diaChi, ghiChu} = infoNguoiNhan;
            await client.connect();
            const db = client.db(DbName);
            const colNguoiDung = db.collection('NguoiDung');
            const colDonHang = db.collection('DonHang');
            const colPhanLoai = db.collection('PhanLoai');
            const colMaGiamGia = db.collection('MaGiamGia');
            const colSanPham = db.collection('SanPham');

            let kiemTraMGG = await colMaGiamGia.find({tenMGG:magiamgia,soLuong:{'$gt':0},ID_ChuShop:ObjectId(donHang.ID_ChuShop)}).next();

            let {phiBanHang} = await colNguoiDung.find({_id: ObjectId(donHang.ID_ChuShop)}).next();
            //console.log(phiBanHang);
            let resKhachHang = await colNguoiDung.find({_id: khachHangId}).next();

            //console.log(JSON.stringify(donHang, null, 2));
            // Tạo chi tiết đơn hàng rút gọn
            const chiTietDonHang = donHang.danhSach.map(item => {
                return {
                    ID_SanPham: ObjectId(item.ID_SanPham),
                    ID_PhanLoai: ObjectId(item.ID_PhanLoai),
                    tenSanPham: item.infoSP.tenSanPham,
                    tenPhanLoai: item.infoPL.tenPhanLoai,
                    anh: item.infoSP.anh[0],
                    soLuong: item.soLuong,
                    gia: item.infoPL.gia,
                    tiLeSale: item.infoSP.tiLeSale,
                }
            });
            const tongGiaDonHang = chiTietDonHang.reduce((sum, item) => sum + (item.gia - (item.gia / 100 * item.tiLeSale)) * item.soLuong, 0);

            const idDonHang = shortId.generate().toUpperCase();
            //Lưu đơn hàng vào db
            let tongGia = kiemTraMGG ? tongGiaDonHang-(tongGiaDonHang/100*parseInt(kiemTraMGG.tiLeSale)): tongGiaDonHang;
            let resDonHang = await colDonHang.insertOne({
                id: idDonHang,
                tenDangNhapKhachHang: resKhachHang.tenDangNhap,
                hoTen: resKhachHang.hoTen,
                lowerCase: resKhachHang.lowerCase,
                sdt: resKhachHang.sdt,
                email: resKhachHang.email,
                diaChi: diaChi,
                ghiChu: ghiChu,
                ngayTaoDon: moment().startOf('day').toDate(),
                chiTietDonHang: chiTietDonHang,
                tongGia: tongGia-(tongGia/100*phiBanHang),
                phiBanHang: trangThaiThanhToan?0:tongGia/100*phiBanHang,
                maGiamGia:{
                    tenMGG:kiemTraMGG ? kiemTraMGG.tenMGG:false,
                    tiLeSale:kiemTraMGG ? parseInt(kiemTraMGG.tiLeSale):0,
                    giaTruocKhiGiam:tongGiaDonHang
                },
                trangThaiThuPhi:trangThaiThanhToan === 1,
                trangThaiDonHang: 0,
                trangThaiThanhToan: trangThaiThanhToan,
                trangThaiDanhGia: false,
                trangThaiXoa: false,
                ID_KhachHang: ObjectId(khachHangId),
                ID_ChuShop: ObjectId(donHang.ID_ChuShop)
            });
            socketApi.CapNhatSoLuongHang();
            res.status(200).json({
                status: 'ok',
                message: 'Đặt hàng thành công !',
                idDonHang: idDonHang
            });

            //Trừ số lượng mã gảm giá của shop
            const result = await colMaGiamGia.updateOne({tenMGG: magiamgia,ID_ChuShop:ObjectId(donHang.ID_ChuShop)}, {
                $inc: {
                    soLuong: -1
                }
            });

            //Trừ số lượng sản phẩm đã đặt tại col Phân loại(khi nào khách hủy thì cộng lại) và cập nhật trạng thái còn hàng
            let capNhatSoLuongSanPham = await mapAsync(async(item)=>{
                //Trừ số lượng sản phẩm đã đặt
                const result = await colPhanLoai.updateOne({_id: ObjectId(item.ID_PhanLoai)}, {
                    $inc: {
                        soLuong: -Math.abs(item.soLuong)
                    }
                });
                //Cập nhật trạng thái còn hàng
                let resPhanLoai= await colPhanLoai.find({ID_SanPham:ObjectId(item.ID_SanPham),trangThaiXoa: false,soLuong:{'$gt':0}}).sort({gia:1}).toArray();
                //console.log(resPhanLoai.length);
                let resSanPham = await colSanPham.updateOne({_id:ObjectId(item.ID_SanPham)},{
                    $set:{
                        conHang:resPhanLoai.reduce((sum, item) => {return sum + item.soLuong}, 0) > 0
                    }
                });
            },donHang.danhSach);
        socketApi.CapNhatSoLuongHang();
        } catch (err) {
            res.status(200).json({
                status: "fail",
                message: err.toString()
            });
        }
        client.close();
    },


    ThanhToanPaypalKhiTraTruoc: async function (req, res, next) {
        const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
        try {
            const {chuShopId,soTien} = req.body;
           // console.log('JSON.stringify(req.body)');
           // console.log(JSON.stringify(req.body));
            await client.connect();
            const db = client.db(DbName);
            const colNguoiDung = db.collection('NguoiDung');
            let resNguoiDung = await colNguoiDung.find({_id:ObjectId(chuShopId)}).next();
            let phiBanHang = resNguoiDung.phiBanHang;
            let tienGuiChoChuShop = soTien - (soTien/100*phiBanHang);
            tienGuiChoChuShop = (tienGuiChoChuShop/ 23313.99).toFixed(2).toString();
           // console.log(tienGuiChoChuShop)
            let emailThanhToan = resNguoiDung.ppThanhToan[0].email;

            let resToken = await axios({
                method: 'post',
                headers: {
                    'content-type': 'application/x-www-form-urlencoded',
                    'Access-Control-Allow-Credentials':true
                },
                url: 'https://api.sandbox.paypal.com/v1/oauth2/token',
                auth:{
                    username: "AV7XdAMCJDmQ6iFbIltAi3d74th3fJ6ll6WRdA3Os32KqPBr61BO3THxCpm1ZyeJFNcJnQmBIAZhW6rW",
                    password: "EG_XMiUeLWbpyGUZ2aALooCev9jYYZjlFnkz-DbMYOq7RiZbaBtqbatbwm7XEntrnssHMzQIj6S6ePqj"
                },
                data: qs.stringify({grant_type:'client_credentials'})
            });
            const token = resToken.data.access_token;
            //console.log('token');
            // console.log(token);
            let resGuiTienChuShop = await axios({
                method: 'post',
                headers: { Authorization: `Bearer ${token}`},
                url: 'https://api.sandbox.paypal.com/v1/payments/payouts',
                data: {
                    "sender_batch_header": {
                        "sender_batch_id": `Payouts_${Math.random().toString(36).substring(9)}`,
                        "email_subject": "Bạn nhận được thanh toán từ bestbuy!",
                        "email_message": "Bạn nhận được thanh toán từ bestbuy! Cảm ơn vì đã sử dụng dịch vụ của chúng tôi !"
                    },
                    "items": [
                        {
                            "recipient_type": "EMAIL",
                            "amount": {
                                "value": `${tienGuiChoChuShop}`,
                                "currency": "USD"
                            },
                            "note": "Thanks for your patronage!",
                            "sender_item_id": "201403140001",
                            "receiver": `${emailThanhToan}`,
                        }
                    ]
                }
            });
            //console.log('resGuiTienChuShop');
            //console.log(resGuiTienChuShop.data);
            client.close();
            res.status(200).json({
                status: "ok",
                message: 'Đã gửi tiền cho chủ shop !'
            });
        } catch (e) {
            console.log(e);
            res.status(200).json({
                status: "fail",
                message: e.toString()
            });
        }
    },

    DanhGiaDonHang: async function (req, res, next) {
        const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
        try {
            const khachHangId = ObjectId(req.khachHangId);
            const {idDonHang, idChuShop, listId, soSao, noiDung} = req.body;
            await client.connect();
            const db = client.db(DbName);
            const colDanhGia = db.collection('DanhGia');
            const colDonHang = db.collection('DonHang');
            // console.log(req.body);
            const arrDanhGia = listId.map(item => {
                return {
                    soSao: soSao,
                    noiDung: noiDung,
                    ngayDanhGia: new Date(),
                    ID_SanPham: ObjectId(item.ID_SanPham),
                    ID_ChuShop: ObjectId(idChuShop),
                    ID_KhachHang: khachHangId
                }
            });
            //console.log(arrDanhGia);
            let themDanhGia = await colDanhGia.insertMany(arrDanhGia);
            let editDonHang = await colDonHang.updateOne({_id: ObjectId(idDonHang)}, {
                $set: {
                    noiDungDanhGia: {
                        soSao: soSao,
                        noiDung: noiDung,
                    },
                    trangThaiDanhGia: true
                }
            }, {upsert: true});
            CapNhatSoSaoSauKhiDanhGia(arrDanhGia);
            // console.log(arrDonHang)
            client.close();
            res.status(200).json({
                status: "ok",
                message: 'Đánh giá đơn hàng thành công !'
            });
        } catch (e) {
            console.log(e);
            res.status(200).json({
                status: "fail",
                message: e.toString()
            });
        }
    },


    /*Thao tác quản lý đơn hàng của chủ shop----------------------------------------------------------------------------------*/
    LayDonHangTheoFilter: async function (req, res, next) {
        const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
        const {filter, page, pagesize, sort} = req;
        //console.log(  JSON.stringify({filter,page, pagesize,sort },null,2));
        try {
            await client.connect();
            const db = client.db(DbName);
            const DonHang = db.collection('DonHang');
            let count = await DonHang.find(filter).toArray();
            let tongDoanhThu = count.reduce((sum,item)=>sum+item.tongGia,0);
            let tongPhi = count.reduce((sum,item)=>sum+item.phiBanHang,0);
            let soTrang = Math.ceil(parseInt(count.length) / pagesize);
            let arrDonHang = await DonHang.find(filter).sort(sort).limit(parseInt(pagesize)).skip(parseInt(pagesize) * parseInt(page)).toArray();
            // console.log(arrDonHang)
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

    LayDonHangTheoId: async function (req, res, next) {
        const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
        const {filter, page, pagesize} = req;
        console.log(JSON.stringify({filter, page, pagesize}));
        try {
            await client.connect();
            const db = client.db(DbName);
            const colSanPham = db.collection('SanPham');
            let count = await colSanPham.find(filter).toArray();
            let soTrang = Math.ceil(parseInt(count.length) / pagesize);
            let arrSanPham = await colSanPham.find(filter).sort({_id: -1}).limit(parseInt(pagesize)).skip(parseInt(pagesize) * parseInt(page)).toArray();
            console.log(arrSanPham);
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

    ChuyenTrangThaiDonHang: async function (req, res, next) {
        const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
        try {
            let listId = req.body.listid; //array
            let type = req.body.type; //number  '1':đang ship;  '2':đã hoàn thành;   '3':đã hủy
            let traLaiLuotBan = req.body.traLaiLuotBan; //  'true':trả lại lượt bán của đơn bị hủy;  'undefind':không làm gì;


            await client.connect();
            const db = client.db(DbName);

            const colPhanLoai = db.collection('PhanLoai');
            const colDonHang = db.collection('DonHang');
            const colSanPham = db.collection('SanPham');
            let duyetResult = await colDonHang.updateMany({_id: {'$in': listId.map(item => ObjectId(item))}},  {
                $set: {
                    trangThaiDonHang: type,
                }
            });
            let typeNoti;
            if (type === 1) {
                typeNoti = `Đã chuyển ${listId.length} đơn hàng sang trạng thái ship !`
            }
            if (type === 2) {
                typeNoti = `Đã chuyển ${listId.length} đơn hàng sang trạng thái hoàn tất !`
            }
            if (type === 3) {
                typeNoti = `Đã hủy ${listId.length} đơn hàng !`
            }
            res.status(200).json({
                status: "ok",
                message: typeNoti
            });

            //Chuyển đơn sang thạng thái hoàn thành, cộng thêm số sản phẩm vào lượt bán
            if(type === 2){
               // console.log(type);
                CapNhatLuotBanSauKhiChuyenTrangThai(listId,'tang');
                CapNhatSoTienPhiDonHangSauKhiHoanThanh(listId);
            }

            //Chuyển đơn sang thạng thái hủy, cộng lại số sản phẩm phân loại đã đã trừ khi đặt hàng
            if(type===3){
                //console.log('bat dau lap');
                let danhSachPhanLoai = [];
                //Lấy thông tin số lượng sản phẩm từ list id được gửi
                let lapDonHang = await mapAsync (async(item)=>{
                    const resDonHang = await colDonHang.find({_id:ObjectId(item)}).next();
                    const lapChiTietDonHang = await mapAsync(async(item) =>{
                        danhSachPhanLoai.push({
                            ID_PhanLoai:item.ID_PhanLoai,
                            soLuong:item.soLuong
                        })
                    },resDonHang.chiTietDonHang);
                },listId);

                let capNhatSoLuongSanPham = await mapAsync(async(item)=>{
                    const result = await colPhanLoai.updateOne({_id: ObjectId(item.ID_PhanLoai)}, {
                        $inc: {
                            soLuong: item.soLuong
                        }
                    });
                },danhSachPhanLoai);

                let capNhatTrangThaiConHang = await mapAsync (async(item)=>{
                    const resDonHang = await colDonHang.find({_id:ObjectId(item)}).next();
                    const lapChiTietDonHang = await mapAsync(async(item) =>{
                        let resPhanLoai= await colPhanLoai.find({ID_SanPham:ObjectId(item.ID_SanPham),trangThaiXoa: false,soLuong:{'$gt':0}}).sort({gia:1}).toArray();
                        let resSanPham = await colSanPham.updateOne({_id:ObjectId(item.ID_SanPham)},{
                            $set:{
                                conHang:resPhanLoai.reduce((sum, item) => {return sum + item.soLuong}, 0) > 0
                            }
                        });
                    },resDonHang.chiTietDonHang);
                },listId);
            }
            socketApi.CapNhatSoLuongHang();
            //Khi chủ shop hủy đơn hàng đã hoàn thành, trả lại số lượt bán cho sản phẩm
            if(type === 3  && traLaiLuotBan){
                CapNhatLuotBanSauKhiChuyenTrangThai(listId,'giam');
            }
        } catch (e) {
            console.log(e);
            res.status(200).json({
                status: "fail",
                message: e.toString()
            });
        }
        client.close();
    },

    XoaDonHang: async function (req, res, next) {
        const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
        try {
            let ids = req.body.listid; //array
            let type = req.body.type; //number

            await client.connect();
            const db = client.db(DbName);
            const colSanPham = db.collection('DonHang');
            let duyetResult = await colSanPham.updateMany({_id: {'$in': ids.map(item => ObjectId(item))}}, {
                $set: {
                    trangThaiXoa: true,
                }
            });
            client.close();

            res.status(200).json({
                status: "ok",
                message: `Đã xóa ${ids.length} đơn hàng !`
            });
        } catch (e) {
            res.status(200).json({
                status: "fail",
                message: e.toString()
            });
        }
    },

};

async function CapNhatSoSaoSauKhiDanhGia(arrDanhGia) {
    //console.log(arrDanhGia);
    const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
    try {
        await client.connect();
        const db = client.db(DbName);
        const colSanPham = db.collection('SanPham');
        const colDanhGia = db.collection('DanhGia');
        const updateGiaSP = await mapAsync(async item => {
            const danhSachDanhGia = await colDanhGia.find({ID_SanPham: ObjectId(item.ID_SanPham)}).toArray();
            const danhSachMoi = [...danhSachDanhGia, {soSao: item.soSao}];
          //  console.log(danhSachMoi);
          //  console.log(danhSachMoi.reduce((sum, item) => sum + item.soSao, 0) / danhSachMoi.length);
          //  console.log(typeof (danhSachMoi.reduce((sum, item) => sum + item.soSao, 0) / danhSachMoi.length));
            const soSaoTrungBinhSP = danhSachMoi.reduce((sum, item) => sum + item.soSao, 0) / danhSachMoi.length;
          //  console.log(soSaoTrungBinhSP)
            let diemXepHang;
            if(item.soSao === 5){diemXepHang =10}if(item.soSao === 4){diemXepHang =8}
            if(item.soSao === 3){diemXepHang =6}if(item.soSao === 2){diemXepHang =-4}
            if(item.soSao === 1){diemXepHang =-10}
            const result = await colSanPham.updateOne({_id: ObjectId(item.ID_SanPham)}, {
                $set: {
                    soSao: Double(soSaoTrungBinhSP.toFixed(1)),
                },
                $inc: {
                    diemXepHang: diemXepHang
                }
            });
           // console.log('da update');
        }, arrDanhGia);
        client.close();

    } catch (e) {
        console.log(e);
    }
}

//Function trigger
//(type)  'giam':giảm sản phẩm nếu trạng thái là 3(hủy);   'tang':tăng sản phẩm nếu trạng thái là 2(hoàn thành)
const CapNhatLuotBanSauKhiChuyenTrangThai = async (listId,type) => {
    //console.log(listId);
    const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
    try {
        await client.connect();
        const db = client.db(DbName);
        const colSanPham = db.collection('SanPham');
        const colDonHang = db.collection('DonHang');
        let lapDonHang = await mapAsync (async(item)=>{
            const resDonHang = await colDonHang.find({_id:ObjectId(item)}).next();
            //Lặp qua danh sách id sản phẩm
            const lapChiTietDonHang = await mapAsync(async(item) =>{
                //Tăng hoặc giảm lượt bán sp tại bảng sản phẩm theo type
                if(type === 'tang'){
                    const result = await colSanPham.updateOne({_id: ObjectId(item.ID_SanPham)}, {
                        $inc: {
                            luotBan: item.soLuong,
                            diemXepHang:15
                        }
                    });
                }
                if(type === 'giam'){
                    const result = await colSanPham.updateOne({_id: ObjectId(item.ID_SanPham)}, {
                        $inc: {
                            luotBan: -Math.abs(item.soLuong)
                        }
                    });
                }

            },resDonHang.chiTietDonHang); //lặp qua danh sách đơn hàng
        },listId); //Lặp qua danh sách id

    } catch (e) {
        console.log(e);
    }
    client.close();
};

const CapNhatSoTienPhiDonHangSauKhiHoanThanh = async (listId) =>{
    console.log('listId');
    console.log(listId);
    const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
    try {
        await client.connect();
        const db = client.db(DbName);
        const colNguoiDung = db.collection('NguoiDung');
        const colDonHang = db.collection('DonHang');
        const resDonHang = await colDonHang.find({_id: {'$in': listId.map(item => ObjectId(item))}}).toArray();
        console.log('resDonHang'); console.log(resDonHang);
        const idChuShop = resDonHang[0].ID_ChuShop;
        console.log('idChuShop');   console.log(idChuShop);
        const tongTienPhi = resDonHang.reduce((sum,item)=>{return sum + item.phiBanHang},0);
        console.log('tongTienPhi');console.log(tongTienPhi);
        const updatePhi = colNguoiDung.updateOne({_id:ObjectId(idChuShop)},{
            $inc:{
                phiNoHienTai:parseInt(tongTienPhi)
            }
        });
    } catch (e) {
        console.log(e);
    }
    client.close();
};