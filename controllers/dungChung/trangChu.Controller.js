const {DbUrl, DbName} = require('../../configs/constant');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const {BoDau} = require('../../utils/hamHoTro');
const jwt = require("jsonwebtoken");

module.exports = {
    //Trang chủ
    LayTatCaDanhMuc: async function (req, res, next) {
        const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
        try {
            await client.connect();
            const db = client.db(DbName);
            const colDanhMuc = db.collection('DanhMuc');

            let allDanhMuc = await colDanhMuc.find({trangThaiKhoa: false}).sort({_id: -1}).toArray();

            client.close();
            res.status(200).json(allDanhMuc);
        } catch (e) {
            res.status(200).json({
                status: "fail",
                message: e.toString()
            });
        }
    },

    LayTatCaCarousel: async function (req, res, next) {
        const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
        try {
            await client.connect();
            const db = client.db(DbName);
            const colCarousel = db.collection('Carousel');

            let allCarousel = await colCarousel.find({trangThaiXoa: false}).sort({_id: -1}).toArray();
            client.close();
            res.status(200).json(allCarousel);
        } catch (e) {
            res.status(200).json({
                status: "fail",
                message: e.toString()
            });
        }
    },

    LaySanPhamHotTheoTrang: async function (req, res, next) {
        const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
        const page = req.params.page;
        try {
            await client.connect();
            const db = client.db(DbName);
            const colSanPham = db.collection('SanPham');
            let allSanPham = await colSanPham.find({
                trangThaiXoa: false,
                trangThaiKhoa: false,
               // soSao: {'$gte': 3},
                gia: {'$lte': 90000000},
            }).sort({diemXepHang: -1}).limit(12).skip(12 * page).toArray();
            client.close();
            res.status(200).json(shuffle(allSanPham));
        } catch (e) {
            res.status(200).json({
                status: "fail",
                message: e.toString()
            });
        }
    },

    LaySanPhamGoiYTheoTrang: async function (req, res, next) {
        const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
        const page = req.params.page;
        const token = req.header('token');
        //console.log(token);
        try {

            await client.connect();
            const db = client.db(DbName);
            const colSanPham = db.collection('SanPham');
            const colLichSuTK = db.collection('LichSuTimKiem');
            if(token !== 'undefined'){
                const resultToken = await jwt.verify(req.header('token'), process.env.SECRET_KEY);
                const nguoiDungId = ObjectId(resultToken.payload.userId);
                let resLSTK = await colLichSuTK.find(
                    {
                        ID_NguoiDung:nguoiDungId,
                    }).sort({updateAt:-1}).limit(100).project({'_id':0,'tuKhoaTimKiem':0,'luotTimKiem':0,'updateAt':0,'ID_NguoiDung':0}).toArray();
                //console.log('resLSTK.length');
                //console.log(resLSTK.length);
                if(resLSTK.length===0){
                    resLSTK = await colLichSuTK.find({}).sort({updateAt:-1}).limit(100)
                        .project({'_id':0,'tuKhoaTimKiem':0,'luotTimKiem':0,'updateAt':0,'ID_NguoiDung':0}).toArray();
                }
               // console.log(resLSTK);
                let arrTuKhoa = resLSTK.map(item => new RegExp(item.lowerCase,'i'));

                const allSanPham = await colSanPham.find({
                    trangThaiXoa: false,
                    trangThaiKhoa: false,
                    lowerCase:{'$in':arrTuKhoa},
                  //  soSao: {'$gte': 3}
                }).sort({diemXepHang: -1}).limit(12).skip(12 * page).toArray();


                res.status(200).json(shuffle(allSanPham));
            }

            if(token === 'undefined'){
               // console.log('bi undefind')
                const resLSTK = await colLichSuTK.find({}).sort({luouTimKiem:-1}).limit(25)
                    .project({'_id':0,'tuKhoaTimKiem':0,'luotTimKiem':0,'updateAt':0,'ID_NguoiDung':0}).toArray();
                //console.log(resLSTK);
                let arrTuKhoa = resLSTK.map(item => new RegExp(item.lowerCase,'i'));
                const allSanPham = await colSanPham.find({
                    trangThaiXoa: false,
                    trangThaiKhoa: false,
                    lowerCase:{'$in':arrTuKhoa},
                    //soSao: {'$gte': 3}
                }).sort({diemXepHang: -1}).limit(12).skip(12 * page).toArray();
                res.status(200).json(shuffle(allSanPham));
            }
            client.close();
        } catch (e) {
            console.log(e);
            res.status(200).json({
                status: "fail",
                message: e.toString()
            });
        }
    },

    LayDanhSachXuHuong: async function (req, res, next) {
        const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
        try {
            await client.connect();
            const db = client.db(DbName);
            const colLichSuTK = db.collection('LichSuTimKiem');
            colLichSuTK.aggregate([
                {
                    '$group': {
                        '_id': '$lowerCase',
                        'tuKhoa': {'$first': '$tuKhoaTimKiem'},
                        'sum': {'$sum': "$luotTimKiem"}
                    }
                }
            ], function (err, cursor) {
                //Lấy ra danh sách các từ khóa được tìm kiếm nhiều nhất
                cursor.toArray(async function (err, documents) {
                    // console.log(documents);
                    //Lấy 20 từ và trộn lại
                    let resultShuffle = shuffle(documents.sort(compare).slice(0, 20));
                     //console.log(resultShuffle);
                    let dataTimKiem = [];
                    let count = 0;
                    let arrAnh =[] //Array ảnh dùng để lọc ảnh bị trùng
                    const colSanPham = db.collection('SanPham');

                    for (const item of resultShuffle) {
                        if (count == 5) {
                            client.close();
                            res.status(200).json(dataTimKiem); return;
                        }
                        let itemSanPham = await colSanPham.find({
                            lowerCase: {'$regex': item._id, '$options': '$i'}
                        }).next();

                        if (itemSanPham !== null && !arrAnh.includes(itemSanPham.anh[0])) {
                            let itemXuHuong = {
                                tenTuKhoa: item.tuKhoa,
                                anh: itemSanPham.anh[0]
                            }
                            dataTimKiem.push(itemXuHuong);
                            arrAnh.push(itemSanPham.anh[0]);
                            count = count + 1;
                        }
                    }
                    // console.log(dataTimKiem);
                    //res.status(200).json(dataTimKiem);
                })
            });

        } catch (e) {
            client.close();
            res.status(200).json({
                status: "fail",
                message: e.toString()
            });
        }

    },

    ThemTuKhoaTimKiem: async function (req, res, next) {
        const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
        try {
            const tuKhoa = req.body.tukhoa;
            const token = req.header('token');
            let userId;
            if(token !== 'undefined' ){
                const resultToken = await jwt.verify(req.header('token'), process.env.SECRET_KEY);
                userId = resultToken.payload.userId;
                if(resultToken.payload.vaiTro !== 2){return}
            }else{
                userId = null;
            }
            await client.connect();
            const db = client.db(DbName);
            const colLichSuTimKiem = db.collection('LichSuTimKiem');

            if(userId === null){
                let result = await colLichSuTimKiem.find({lowerCase: BoDau(tuKhoa), ID_NguoiDung: null}).next();
                if (result === null || result === undefined) {
                    let r = await db.collection('LichSuTimKiem').insertOne({
                        tuKhoaTimKiem: tuKhoa.replace(/[-!$%^&*()_+|~=`{}\[\]:";'<>?,.\/]/gi, ""),
                        lowerCase: BoDau(tuKhoa),
                        luotTimKiem: 1,
                        updateAt: new Date()
                    });
                    res.status(200).json(r);
                } else {
                    let r = await colLichSuTimKiem.updateOne({
                            lowerCase: BoDau(tuKhoa),
                            ID_NguoiDung: null
                        },
                        {
                            $set: {luotTimKiem: result.luotTimKiem + 1, updateAt: new Date()}
                        });
                    res.status(200).json(r);
                } return;
            }
            if(userId !== null ){
                console.log('khac null')
                let result = await colLichSuTimKiem.find({tuKhoaTimKiem: tuKhoa,ID_NguoiDung:ObjectId(userId)}).next();
                //Nếu từ khóa chưa có thì thêm vào
                if (result === null ) {
                    console.log('chua co')
                    let r = await colLichSuTimKiem.insertOne({
                        tuKhoaTimKiem:tuKhoa,
                        lowerCase:BoDau(tuKhoa),
                        luotTimKiem:1,
                        updateAt:new Date(),
                        ID_NguoiDung:ObjectId(userId)
                    });
                    res.status(200).json(r);
                }
                else {   //Nếu từ khóa đã có thì update lại ngày search và số lượng
                    console.log('da co')
                    let r = await colLichSuTimKiem.updateOne({
                            tuKhoaTimKiem:tuKhoa,
                            ID_NguoiDung:ObjectId(userId)
                        },
                        {$set: {luotTimKiem: result.luotTimKiem+1,updateAt:new Date()}
                        });
                    res.status(200).json(r);
                }
            }

            client.close();
        } catch (e) {
            console.log('loi ne')
            console.log(e)
            res.status(200).json({
                status: "fail",
                message: e.toString()
            });
        }
    },

    LayChiTietSanPham: async function (req, res, next) {
        const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
        try {
            let idSanPham = ObjectId(req.query.id);
            await client.connect();
            const db = client.db(DbName);
            const colSanPham = db.collection('SanPham');
            const colPhanLoai = db.collection('PhanLoai');
            const colDanhMuc = db.collection('DanhMuc');
            const colDanhGia = db.collection('DanhGia');
            let resSanPham = await colSanPham.find({_id:idSanPham,trangThaiDuyet:true,trangThaiKhoa:false,trangThaiXoa: false}).next();
          //  console.log('resSanPham')
         //   console.log(resSanPham)
            if(resSanPham === null){

                res.status(200).json({
                    status: "fail",
                    message:'Sản phẩm không tồn tại',
                }); return;
            }
            let resPhanLoai = await colPhanLoai.find({ID_SanPham:idSanPham,soLuong:{'$gt':0},trangThaiXoa:false}).sort({gia:1}).toArray();
            let resDanhMuc = await colDanhMuc.find({_id:ObjectId(resSanPham.ID_DanhMuc)}).next();
            //console.log(resDanhMuc);
            let resDanhGia= await colDanhGia.find({ID_SanPham:ObjectId(idSanPham)}).toArray();

            client.close();
            res.status(200).json({
                status: "ok",
                dataSanPham:resSanPham,
                dataPhanLoai:resPhanLoai,
                dataDanhMuc:resDanhMuc,
                luotDanhGia:resDanhGia.length
            });
        } catch (e) {
            res.status(200).json({
                status: "fail",
                message: e.toString()
            });
        }
    },



    /*Trang chi tiết sản phẩm---------------------------------------------------------------------*/
    LaySanPhamKhacCuaShop: async function (req, res, next) {
        const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
        try {
            let idSanPham = ObjectId(req.query.id);
            await client.connect();
            const db = client.db(DbName);
            const colSanPham = db.collection('SanPham');
            let resSanPham = await colSanPham.find({_id:idSanPham,trangThaiKhoa:false,trangThaiXoa: false}).next();
            const {ID_ChuShop} =resSanPham;
            let resSanPhamLienQuan = await colSanPham.find({_id:{'$ne':idSanPham},ID_ChuShop:ObjectId(ID_ChuShop),trangThaiKhoa:false,trangThaiXoa: false}).limit(100).toArray();
            shuffle(resSanPhamLienQuan);
            let sanPhamKhacs = [...resSanPhamLienQuan].slice(0,6);
          //  console.log(sanPhamKhacs.length)
            client.close();
            res.status(200).json({
                status:'ok',
                data:sanPhamKhacs
            });
        } catch (err) {
            res.status(200).json({
                status: "fail",
                message: err.toString()
            });
        }
    },

    LaySanPhamTuongTu: async function (req, res, next) {
        const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
        try {
            let idSanPham = ObjectId(req.query.id);
            await client.connect();
            const db = client.db(DbName);
            const colSanPham = db.collection('SanPham');
            let resSanPham = await colSanPham.find({_id:idSanPham,trangThaiKhoa:false,trangThaiXoa: false}).next();
            const {lowerCase,thuongHieu,ID_DanhMuc} = resSanPham;
            let resSanPhamTuongTu = await colSanPham.find({
                '$or': [
                    {
                        _id:{'$ne':idSanPham},
                        trangThaiKhoa: false,
                        trangThaiXoa: false,
                        lowerCase: {'$regex': lowerCase, '$options': '$i'}
                    },
                    {
                        _id:{'$ne':idSanPham},
                        trangThaiKhoa: false,
                        trangThaiXoa: false,
                        ID_DanhMuc: ObjectId(ID_DanhMuc)
                    },
                    {
                        _id:{'$ne':idSanPham},
                        trangThaiKhoa: false,
                        trangThaiXoa: false,
                        thuongHieu: {'$regex': thuongHieu, '$options': '$i'}
                    },
                ]
            }).limit(100).toArray();
            shuffle(resSanPhamTuongTu);
            let sanPhamLienQuans = [...resSanPhamTuongTu].slice(0,6);
            client.close();
            res.status(200).json({
                status:'ok',
                data:sanPhamLienQuans
            });
        } catch (err) {
            res.status(200).json({
                status: "fail",
                message: err.toString()
            });
        }
    },

    LayDanhGiaSanPhamTheoTrang: async function(req, res,next){
        const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
        try {
            const idSP = ObjectId(req.query.id);
         //   console.log(idSP);
            const filter = JSON.parse(req.query.filter);
         //   console.log(filter);
            filter.ID_SanPham = idSP;
            const page = parseInt(req.query.page);
        //    console.log(page);
            await client.connect();
            const db = client.db(DbName);
            const colDanhGia = db.collection('DanhGia');

            let count = await colDanhGia.find(filter).toArray();
            let soTrang = Math.ceil(count.length / 6);
          //  console.log(soTrang);
           // let allDanhGia = await colDanhGia.find(JSON.parse(filter)).sort({_id: -1}).limit(6).skip(6 * page).toArray();
            colDanhGia.aggregate([
                {
                    $lookup: {
                        from: 'NguoiDung',
                        localField: 'ID_KhachHang',
                        foreignField: '_id',
                        as: 'ThongTinNguoiDung'
                    }
                },
                {
                    $match:{...filter},
                },
                {
                    $sort:{_id:-1}
                },
                {$skip:6*page},
                {$limit:6},
                ],async function (err,data) {
               /* if (err) {
                    console.log(err);
                }*/
              /*  res.toArray((err,documents)=>{
                    documents.forEach((item)=>{console.log(item);});
                });*/
                const allDanhGia = await data.toArray();
               // console.log(JSON.stringify(allDanhGia,null,2));
                //console.log(allDanhGia.length)
                client.close();
                res.status(200).json({
                    data:allDanhGia,
                    soTrang:soTrang
                });
            });
        } catch (err) {
            res.status(200).json({
                status: "fail",
                message: err.toString()
            });
        }
    },

    /*Lấy các thông tin chung của khách hàng------------------------------------------*/

    LayThongBaoHeThong_Index: async function (req, res, next) {
        const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
        const page = req.params.page;
        try {
            await client.connect();
            const db = client.db(DbName);
            const colThongBao = db.collection('ThongBao');

            let resultThongBao = await colThongBao.find({trangThaiXoa: false}).sort({_id: -1}).limit(5).toArray();
            client.close();
            res.status(200).json(resultThongBao);
        } catch (err) {
            res.status(200).json({
                status: "fail",
                message: err.toString()
            });
        }
    },

    LayThongBaoHeThong_TheoTrang: async function (req, res, next) {
        const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
        const page = req.params.page;
        try {
            await client.connect();
            const db = client.db(DbName);
            const colThongBao = db.collection('ThongBao');

            let resultThongBao = await colThongBao.find({trangThaiXoa: false}).sort({_id: -1}).limit(5).skip(5* page).toArray();
            client.close();
            //console.log(resultThongBao);
            res.status(200).json(resultThongBao);
        } catch (err) {
            res.status(200).json({
                status: "fail",
                message: err.toString()
            });
        }
    },

    LayDanhSachDanhMuc: async function(req, res,next){
        const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
        try {
            await client.connect();
            const db = client.db(DbName);
            const colDanhMuc = db.collection('DanhMuc');

            let resultThongBao = await colDanhMuc.find({trangThaiKhoa: false}).sort({_id: -1}).toArray();
            client.close();
            //console.log(resultThongBao);
            res.status(200).json({
                status:'ok',
                data:resultThongBao,
            });
        } catch (err) {
            res.status(200).json({
                status: "fail",
                message: err.toString()
            });
        }
    },

    TangLuotXemKhiVaoTrangCuaShop: async function(req, res,next){
        const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
        try {
            const {tenDangNhap} = req.body;
            await client.connect();
            const db = client.db(DbName);
            const colNguoiDung = db.collection('NguoiDung');

            let tangLuotXemShop = await colNguoiDung.updateOne({tenDangNhap:tenDangNhap,trangThaiKhoa: false},{
                $inc:{
                    luotXem:1
                }
            });
            res.status(200).json({
                status:'ok',
            });
        } catch (err) {
            res.status(200).json({
                status: "fail",
                message: err.toString()
            });
        }   client.close();
    },

    TangLuotXemKhiVaoTrangSanPham: async function(req, res,next){
        const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
        try {
            const idSP = ObjectId(req.body.idSP);
            await client.connect();
            const db = client.db(DbName);
            const colSanPham = db.collection('SanPham');

            let tangLuotXemSanPham = await colSanPham.updateOne({_id:idSP,trangThaiKhoa: false},{
                $inc:{
                    luotXem:1,
                    diemXepHang:2
                }
            });
            res.status(200).json({
                status:'ok',
            });
        } catch (err) {
            res.status(200).json({
                status: "fail",
                message: err.toString()
            });
        }   client.close();
    }

}


/*Hàm nội bộ------------------------------------------------------------------------------------*/
//Hàm trộn data
function shuffle(data) {
    for (let i = data.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [data[i], data[j]] = [data[j], data[i]];
    }
    return data;
}

//Hàm sắp xếp mảng đối tượng
function compare(a, b) {
    const sumA = a.sum;
    const sumB = b.sum;

    let comparison = 0;
    if (sumA > sumB) {
        comparison = -1;
    } else if (sumA < sumB) {
        comparison = 1;
    }
    return comparison;
}