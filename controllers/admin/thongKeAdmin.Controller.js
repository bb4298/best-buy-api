const {DbUrl,DbName} = require('../../configs/constant');
const MongoClient = require('mongodb').MongoClient;
const moment =require('moment');
const {tinhNamNhuan} = require('../../utils/hamHoTro');
module.exports = {
    //Lấy thông tin tổng quan sàn tại trang tổng quan admin
    LayThongTinSanTaiTrangTongQuan: async function (req, res, next) {
        const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
        try {
            await client.connect();
            const db = client.db(DbName);

            const colCauHinh = db.collection('CauHinh');
            const colSanPham = db.collection('SanPham');
            const colDanhGia = db.collection('DanhGia');
            const colDonHang = db.collection('DonHang');
            const colDanhMuc = db.collection('DanhMuc');
            const colCarousel = db.collection('Carousel');
            const colBaiViet = db.collection('BaiViet');
            const colThongBao = db.collection('ThongBao');
            const colNguoiDung = db.collection('NguoiDung');
            //Tính tổng lượt xem sàn
            const resCauHinh = await colCauHinh.find({type:0}).next();
            const {tongLuotTruyCap,tenBrand} = resCauHinh;

            //Tính số lượng khách hàng
            const tongKhachHang = await colNguoiDung.countDocuments({vaiTro:2});

            //Tính số lượng menu
            const tongDanhMuc = await colDanhMuc.countDocuments();
            const tongBanner = await colCarousel.countDocuments({trangThaiXoa:false});
            const tongBaiViet = await colBaiViet.countDocuments({trangThaiXoa:false});
            const tongThongBao = await colThongBao.countDocuments({trangThaiXoa:false});
            const tongShop = await colNguoiDung.countDocuments({vaiTro:1});
            const tongKiemDuyetVien = await colNguoiDung.countDocuments({vaiTro:3});

            let resSanPhamBanChay = await colSanPham.find({trangThaiXoa: false}).sort({luotBan: -1}).toArray();
            let tongLuotXemSanPham = resSanPhamBanChay.reduce((sum,item) => sum + item.luotXem, 0);
            let tongLuotMuaSanPham = resSanPhamBanChay.reduce((sum,item) => sum + item.luotBan, 0);

            //Biểu đồ sản phẩm bán chạy
            let topBanChay = resSanPhamBanChay.slice(0,10).filter(item=>item.luotBan>0);
            let bieuDoTopBanChay ={
                labels:topBanChay.map((item=>item.tenSanPham)),
                series:topBanChay.map((item=>item.luotBan))
            };

            //Biểu đồ sản phẩm tồn kho
            let topBanE = resSanPhamBanChay.reverse().slice(0,10).filter(item=>item.luotBan>0);
            let bieuDoTopBanE ={
                labels:topBanE.map((item=>item.tenSanPham)),
                series:topBanE.map((item=>item.luotBan))
            };
            //console.log(resSanPhamsChay);
            // console.log(resSanPhamsChay.reverse());

            let soSaoTrungBinhCuaSan;
            let resDanhGiaShops = await colDanhGia.find({}).toArray();
            if(resDanhGiaShops.length === 0){
                soSaoTrungBinhCuaSan = 0;
            }else{
                let sanPhamDaLoc = resSanPhamBanChay.filter(item=>item.luotBan>0);
                soSaoTrungBinhCuaSan = (sanPhamDaLoc.reduce((sum,item)=>{return sum + item.soSao;},0)/sanPhamDaLoc.length).toFixed(1);
            }

            let resDonHang = await colDonHang.find({trangThaiXoa:false}).toArray();

            // console.log(resDonHang);
            let donHangChoXuLy = resDonHang.filter(item=>item.trangThaiDonHang === 0).length;
            let donHangDangShip = resDonHang.filter(item=>item.trangThaiDonHang === 1).length;
            let arrDonHangDaHoanThanh = resDonHang.filter(item=>item.trangThaiDonHang === 2);
            let donHangDaHoanThanh = arrDonHangDaHoanThanh.length;
            let donHangDaHuy = resDonHang.filter(item=>item.trangThaiDonHang === 3).length;

            //Lấy doanh số theo năm
            let doanhThuNam = [];
            let t1= []; let t2= []; let t3= []; let t4= []; let t5= []; let t6= [];let t7= []; let t8= []; let t9= []; let t10= []; let t11= []; let t12= [];
            arrDonHangDaHoanThanh.map((item)=>{
                const date = new Date(item.ngayTaoDon);
                if((date.getMonth()+1 === 1)) {t1.push(item)}   if((date.getMonth()+1 === 2)) {t2.push(item)}
                if((date.getMonth()+1 === 3)) {t3.push(item)}   if((date.getMonth()+1 === 4)) {t4.push(item)}
                if((date.getMonth()+1 === 5)) {t5.push(item)}   if((date.getMonth()+1 === 6)) {t6.push(item)}
                if((date.getMonth()+1 === 7)) {t7.push(item)}   if((date.getMonth()+1 === 8)) {t8.push(item)}
                if((date.getMonth()+1 === 9)) {t9.push(item)}   if((date.getMonth()+1 === 10)) {t10.push(item)}
                if((date.getMonth()+1 === 11)) {t11.push(item)} if((date.getMonth()+1 === 12)) {t12.push(item)}
            });

            t1 = t1.reduce((sum,item)=>sum+item.phiBanHang,0);      t2 = t2.reduce((sum,item)=>sum+item.phiBanHang,0);
            t3 = t3.reduce((sum,item)=>sum+item.phiBanHang,0);      t4 = t4.reduce((sum,item)=>sum+item.phiBanHang,0);
            t5 = t5.reduce((sum,item)=>sum+item.phiBanHang,0);      t6 = t6.reduce((sum,item)=>sum+item.phiBanHang,0);
            t7 = t7.reduce((sum,item)=>sum+item.phiBanHang,0);      t8 = t8.reduce((sum,item)=>sum+item.phiBanHang,0);
            t9 = t9.reduce((sum,item)=>sum+item.phiBanHang,0);      t10 = t10.reduce((sum,item)=>sum+item.phiBanHang,0);
            t11 = t11.reduce((sum,item)=>sum+item.phiBanHang,0);    t12 = t12.reduce((sum,item)=>sum+item.phiBanHang,0);

            doanhThuNam.push(t1);doanhThuNam.push(t2);doanhThuNam.push(t3); doanhThuNam.push(t4);
            doanhThuNam.push(t5);doanhThuNam.push(t6);doanhThuNam.push(t7); doanhThuNam.push(t8);
            doanhThuNam.push(t9);doanhThuNam.push(t10);doanhThuNam.push(t11); doanhThuNam.push(t12);

            client.close();
            res.status(200).json({
                status: "ok",
                data:{
                    soSao: soSaoTrungBinhCuaSan,
                    danhGia:resDanhGiaShops.length,
                    tongKhachHang:tongKhachHang,
                    donHang:{
                        choXuLy:donHangChoXuLy,
                        dangShip:donHangDangShip,
                        daHoanThanh:donHangDaHoanThanh,
                        daHuy:donHangDaHuy,
                    },
                    menu: {
                        danhMuc: tongDanhMuc,
                        banner: tongBanner,
                        baiViet: tongBaiViet,
                        thongBao: tongThongBao,
                        shop: tongShop,
                        kiemDuyetVien: tongKiemDuyetVien,
                    },
                    sanPham:{
                        tongSoLuong:resSanPhamBanChay.length,
                    },
                    tenBrand:tenBrand,
                    tongLuotXemSan:tongLuotTruyCap,
                    tongLuotXemSP:tongLuotXemSanPham,
                    tongLuotMuaSP:tongLuotMuaSanPham,
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
    //Lấy thông tin thống kê dài hạn và ngắn hạn tại trang tổng quan admin
    ThongKeNganHan_Admin: async function (req, res, next) {
        const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
        try {
            const {type} = req.body;    //'0':Tuần này;  '1':Tháng này;
            await client.connect();
            const db = client.db(DbName);
            const colDonHang = db.collection('DonHang');

            if(type === 0){  //Tuàn này
                const now = moment();
                let th2 = now.clone().weekday(1).startOf('day').toDate();
                let th3 = now.clone().weekday(2).startOf('day').toDate();
                let th4 = now.clone().weekday(3).startOf('day').toDate();
                let th5 = now.clone().weekday(4).startOf('day').toDate();
                let th6 = now.clone().weekday(5).startOf('day').toDate();
                let th7 = now.clone().weekday(6).startOf('day').toDate();
                let cn = now.clone().weekday(7).startOf('day').toDate();
                let resDonHang = await colDonHang.find({
                    trangThaiDonHang:2,
                    trangThaiXoa:false,
                    ngayTaoDon:{'$gte': th2, '$lte': cn}}).toArray();
                //Lấy thống kê tuần này
                let doanhThuShopTuanNay = []; //doanh thu của shop theo tuần
                let doanhThuSanTuanNay = [];     //doanh thu của sàn theo tuần
                let sanPhamTuanNay = [];
                let n1= []; let n2= []; let n3= []; let n4= []; let n5= []; let n6= [];let n7= [];
                resDonHang.map((item,index)=>{
                    const date = moment(item.ngayTaoDon);
                    if((date.isSame(moment(th2),'day'))) {n1.push(item)}   if((date.isSame(moment(th3),'day'))) {n2.push(item)}
                    if((date.isSame(moment(th4),'day'))) {n3.push(item)}   if((date.isSame(moment(th5),'day'))) {n4.push(item)}
                    if((date.isSame(moment(th6),'day'))) {n5.push(item)}   if((date.isSame(moment(th7),'day'))) {n6.push(item)}
                    if((date.isSame(moment(cn),'day'))) {n7.push(item)}
                });

                doanhThuShopTuanNay.push(n1.reduce((sum,item)=>sum+item.tongGia,0));    doanhThuShopTuanNay.push(n2.reduce((sum,item)=>sum+item.tongGia,0));
                doanhThuShopTuanNay.push(n3.reduce((sum,item)=>sum+item.tongGia,0));    doanhThuShopTuanNay.push(n4.reduce((sum,item)=>sum+item.tongGia,0));
                doanhThuShopTuanNay.push(n5.reduce((sum,item)=>sum+item.tongGia,0));    doanhThuShopTuanNay.push(n6.reduce((sum,item)=>sum+item.tongGia,0));
                doanhThuShopTuanNay.push(n7.reduce((sum,item)=>sum+item.tongGia,0));

                doanhThuSanTuanNay.push(n1.reduce((sum,item)=>sum+item.phiBanHang,0));    doanhThuSanTuanNay.push(n2.reduce((sum,item)=>sum+item.phiBanHang,0));
                doanhThuSanTuanNay.push(n3.reduce((sum,item)=>sum+item.phiBanHang,0));    doanhThuSanTuanNay.push(n4.reduce((sum,item)=>sum+item.phiBanHang,0));
                doanhThuSanTuanNay.push(n5.reduce((sum,item)=>sum+item.phiBanHang,0));    doanhThuSanTuanNay.push(n6.reduce((sum,item)=>sum+item.phiBanHang,0));
                doanhThuSanTuanNay.push(n7.reduce((sum,item)=>sum+item.phiBanHang,0));

                sanPhamTuanNay.push(n1.reduce((sum,item)=>sum+item.chiTietDonHang.reduce((subsum,subitem)=>subsum+subitem.soLuong,0),0));
                sanPhamTuanNay.push(n2.reduce((sum,item)=>sum+item.chiTietDonHang.reduce((subsum,subitem)=>subsum+subitem.soLuong,0),0));
                sanPhamTuanNay.push(n3.reduce((sum,item)=>sum+item.chiTietDonHang.reduce((subsum,subitem)=>subsum+subitem.soLuong,0),0));
                sanPhamTuanNay.push(n4.reduce((sum,item)=>sum+item.chiTietDonHang.reduce((subsum,subitem)=>subsum+subitem.soLuong,0),0));
                sanPhamTuanNay.push(n5.reduce((sum,item)=>sum+item.chiTietDonHang.reduce((subsum,subitem)=>subsum+subitem.soLuong,0),0));
                sanPhamTuanNay.push(n6.reduce((sum,item)=>sum+item.chiTietDonHang.reduce((subsum,subitem)=>subsum+subitem.soLuong,0),0));
                sanPhamTuanNay.push(n7.reduce((sum,item)=>sum+item.chiTietDonHang.reduce((subsum,subitem)=>subsum+subitem.soLuong,0),0));

                client.close();
                res.status(200).json({
                    status: "ok",
                    series:[{
                        name: 'Doanh thu sàn',
                        type: 'column',
                        data: doanhThuSanTuanNay
                    }, {
                        name: 'Doanh thu shop',
                        type: 'column',
                        data: doanhThuShopTuanNay
                    }, {
                        name: 'Số sản phẩm',
                        type: 'line',
                        data: sanPhamTuanNay
                    }],
                    categories:['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']
                });
            }

            if(type === 1){  //Tháng này(30 ngày)
                let loaiThang;
                if([1,3,5,7,8,10,12].includes(new Date().getMonth()+1)){loaiThang=31}
                if([4,6,9,11].includes(new Date().getMonth()+1)){loaiThang=30}
                if([2].includes(new Date().getMonth()+1)){
                    if(tinhNamNhuan(new Date().getFullYear())){
                        loaiThang = 29;
                    }
                    if(!tinhNamNhuan(new Date().getFullYear())){
                        loaiThang = 28;
                    }
                }


                let ng1 = moment().startOf('month').startOf('day').toDate();     let ng2 = moment().startOf('month').add(1,'day').startOf('day').toDate();
                let ng3 = moment().startOf('month').add(2,'day').startOf('day').toDate();     let ng4 = moment().startOf('month').add(3,'day').startOf('day').toDate();
                let ng5 = moment().startOf('month').add(4,'day').startOf('day').toDate();     let ng6 = moment().startOf('month').add(5,'day').startOf('day').toDate();
                let ng7 = moment().startOf('month').add(6,'day').startOf('day').toDate();     let ng8 = moment().startOf('month').add(7,'day').startOf('day').toDate();
                let ng9 = moment().startOf('month').add(8,'day').startOf('day').toDate();     let ng10 = moment().startOf('month').add(9,'day').startOf('day').toDate();
                let ng11 = moment().startOf('month').add(10,'day').startOf('day').toDate();   let ng12 = moment().startOf('month').add(11,'day').startOf('day').toDate();
                let ng13 = moment().startOf('month').add(12,'day').startOf('day').toDate();   let ng14 = moment().startOf('month').add(13,'day').startOf('day').toDate();
                let ng15 = moment().startOf('month').add(14,'day').startOf('day').toDate();   let ng16 = moment().startOf('month').add(15,'day').startOf('day').toDate();
                let ng17 = moment().startOf('month').add(16,'day').startOf('day').toDate();   let ng18 = moment().startOf('month').add(17,'day').startOf('day').toDate();
                let ng19 = moment().startOf('month').add(18,'day').startOf('day').toDate();   let ng20 = moment().startOf('month').add(29,'day').startOf('day').toDate();
                let ng21 = moment().startOf('month').add(20,'day').startOf('day').toDate();   let ng22 = moment().startOf('month').add(21,'day').startOf('day').toDate();
                let ng23 = moment().startOf('month').add(22,'day').startOf('day').toDate();   let ng24 = moment().startOf('month').add(23,'day').startOf('day').toDate();
                let ng25 = moment().startOf('month').add(24,'day').startOf('day').toDate();   let ng26 = moment().startOf('month').add(25,'day').startOf('day').toDate();
                let ng27 = moment().startOf('month').add(26,'day').startOf('day').toDate();   let ng28 = moment().startOf('month').add(27,'day').startOf('day').toDate();
                let ng29 = moment().startOf('month').add(28,'day').startOf('day').toDate();   let ng30 = moment().startOf('month').add(29,'day').startOf('day').toDate();
                let ng31 = moment().startOf('month').add(30,'day').startOf('day').toDate();

                let resDonHang = await colDonHang.find({
                    trangThaiDonHang:2,
                    trangThaiXoa:false,
                    ngayTaoDon:{'$gte': ng1, '$lte': ng31}}).toArray();
                console.log(resDonHang);
                //Lấy thống kê tháng này
                let doanhThuShopThangNay = [];
                let doanhThuSanThangNay = [];
                let sanPhamThangNay = [];
                let n1= [];let n2= []; let n3= []; let n4= []; let n5= [];let n6= []; let n7= []; let n8= []; let n9= []; let n10= [];
                let n11= [];let n12= []; let n13= []; let n14= []; let n15= [];let n16= []; let n17= []; let n18= []; let n19= []; let n20= [];
                let n21= [];let n22= []; let n23= []; let n24= []; let n25= [];let n26= []; let n27= []; let n28= []; let n29= []; let n30= []; let n31= [];

                resDonHang.map((item)=>{
                    const date = moment(item.ngayTaoDon);
                    console.log(date)
                    console.log(moment(ng18))
                    if((date.isSame(moment(ng1),'day'))) {n1.push(item)}       if((date.isSame(moment(ng2),'day'))) {n2.push(item)}
                    if((date.isSame(moment(ng3),'day'))) {n3.push(item)}       if((date.isSame(moment(ng4),'day'))) {n4.push(item)}
                    if((date.isSame(moment(ng5),'day'))) {n5.push(item)}       if((date.isSame(moment(ng6),'day'))) {n6.push(item)}
                    if((date.isSame(moment(ng7),'day'))) {n7.push(item)}       if((date.isSame(moment(ng8),'day'))) {n8.push(item)}
                    if((date.isSame(moment(ng9),'day'))) {n9.push(item)}       if((date.isSame(moment(ng10),'day'))) {n10.push(item)}
                    if((date.isSame(moment(ng11),'day'))) {n11.push(item)}      if((date.isSame(moment(ng12),'day'))) {n12.push(item)}
                    if((date.isSame(moment(ng13),'day'))) {n13.push(item)}      if((date.isSame(moment(ng14),'day'))) {n14.push(item)}
                    if((date.isSame(moment(ng15),'day'))) {n15.push(item)}      if((date.isSame(moment(ng16),'day'))) {n16.push(item)}
                    if((date.isSame(moment(ng17),'day'))) {n17.push(item)}      if((date.isSame(moment(ng18),'day'))) {n18.push(item)}
                    if((date.isSame(moment(ng19),'day'))) {n19.push(item)}      if((date.isSame(moment(ng20),'day'))) {n20.push(item)}
                    if((date.isSame(moment(ng21),'day'))) {n21.push(item)}      if((date.isSame(moment(ng22),'day'))) {n22.push(item)}
                    if((date.isSame(moment(ng23),'day'))) {n23.push(item)}      if((date.isSame(moment(ng24),'day'))) {n24.push(item)}
                    if((date.isSame(moment(ng25),'day'))) {n25.push(item)}      if((date.isSame(moment(ng26),'day'))) {n26.push(item)}
                    if((date.isSame(moment(ng27),'day'))) {n27.push(item)}      if((date.isSame(moment(ng28),'day'))) {n28.push(item)}
                    if((date.isSame(moment(ng29),'day'))) {n29.push(item)}      if((date.isSame(moment(ng30),'day'))) {n30.push(item)}
                    if((date.isSame(moment(ng31),'day'))) {n31.push(item)}

                });

                doanhThuShopThangNay.push(n1.reduce((sum,item)=>sum+item.tongGia,0));     doanhThuShopThangNay.push(n2.reduce((sum,item)=>sum+item.tongGia,0));
                doanhThuShopThangNay.push(n3.reduce((sum,item)=>sum+item.tongGia,0));     doanhThuShopThangNay.push(n4.reduce((sum,item)=>sum+item.tongGia,0));
                doanhThuShopThangNay.push(n5.reduce((sum,item)=>sum+item.tongGia,0));     doanhThuShopThangNay.push(n6.reduce((sum,item)=>sum+item.tongGia,0));
                doanhThuShopThangNay.push(n7.reduce((sum,item)=>sum+item.tongGia,0));     doanhThuShopThangNay.push(n8.reduce((sum,item)=>sum+item.tongGia,0));
                doanhThuShopThangNay.push(n9.reduce((sum,item)=>sum+item.tongGia,0));     doanhThuShopThangNay.push(n10.reduce((sum,item)=>sum+item.tongGia,0));
                doanhThuShopThangNay.push(n11.reduce((sum,item)=>sum+item.tongGia,0));    doanhThuShopThangNay.push(n12.reduce((sum,item)=>sum+item.tongGia,0));
                doanhThuShopThangNay.push(n13.reduce((sum,item)=>sum+item.tongGia,0));    doanhThuShopThangNay.push(n14.reduce((sum,item)=>sum+item.tongGia,0));
                doanhThuShopThangNay.push(n15.reduce((sum,item)=>sum+item.tongGia,0));    doanhThuShopThangNay.push(n16.reduce((sum,item)=>sum+item.tongGia,0));
                doanhThuShopThangNay.push(n17.reduce((sum,item)=>sum+item.tongGia,0));    doanhThuShopThangNay.push(n18.reduce((sum,item)=>sum+item.tongGia,0));
                doanhThuShopThangNay.push(n19.reduce((sum,item)=>sum+item.tongGia,0));    doanhThuShopThangNay.push(n20.reduce((sum,item)=>sum+item.tongGia,0));
                doanhThuShopThangNay.push(n21.reduce((sum,item)=>sum+item.tongGia,0));    doanhThuShopThangNay.push(n22.reduce((sum,item)=>sum+item.tongGia,0));
                doanhThuShopThangNay.push(n23.reduce((sum,item)=>sum+item.tongGia,0));    doanhThuShopThangNay.push(n24.reduce((sum,item)=>sum+item.tongGia,0));
                doanhThuShopThangNay.push(n25.reduce((sum,item)=>sum+item.tongGia,0));    doanhThuShopThangNay.push(n26.reduce((sum,item)=>sum+item.tongGia,0));
                doanhThuShopThangNay.push(n27.reduce((sum,item)=>sum+item.tongGia,0));    doanhThuShopThangNay.push(n28.reduce((sum,item)=>sum+item.tongGia,0));
                if(loaiThang ===29){
                    doanhThuShopThangNay.push(n29.reduce((sum,item)=>sum+item.tongGia,0));
                }
                if(loaiThang ===30){
                    doanhThuShopThangNay.push(n29.reduce((sum,item)=>sum+item.tongGia,0));   doanhThuShopThangNay.push(n30.reduce((sum,item)=>sum+item.tongGia,0));
                }
                if(loaiThang ===31){
                    doanhThuShopThangNay.push(n29.reduce((sum,item)=>sum+item.tongGia,0));   doanhThuShopThangNay.push(n30.reduce((sum,item)=>sum+item.tongGia,0));
                    doanhThuShopThangNay.push(n31.reduce((sum,item)=>sum+item.tongGia,0));
                }


                doanhThuSanThangNay.push(n1.reduce((sum,item)=>sum+item.phiBanHang,0));    doanhThuSanThangNay.push(n2.reduce((sum,item)=>sum+item.phiBanHang,0));
                doanhThuSanThangNay.push(n3.reduce((sum,item)=>sum+item.phiBanHang,0));    doanhThuSanThangNay.push(n4.reduce((sum,item)=>sum+item.phiBanHang,0));
                doanhThuSanThangNay.push(n5.reduce((sum,item)=>sum+item.phiBanHang,0));    doanhThuSanThangNay.push(n6.reduce((sum,item)=>sum+item.phiBanHang,0));
                doanhThuSanThangNay.push(n7.reduce((sum,item)=>sum+item.phiBanHang,0));    doanhThuSanThangNay.push(n8.reduce((sum,item)=>sum+item.phiBanHang,0));
                doanhThuSanThangNay.push(n9.reduce((sum,item)=>sum+item.phiBanHang,0));    doanhThuSanThangNay.push(n10.reduce((sum,item)=>sum+item.phiBanHang,0));
                doanhThuSanThangNay.push(n11.reduce((sum,item)=>sum+item.phiBanHang,0));   doanhThuSanThangNay.push(n12.reduce((sum,item)=>sum+item.phiBanHang,0));
                doanhThuSanThangNay.push(n13.reduce((sum,item)=>sum+item.phiBanHang,0));   doanhThuSanThangNay.push(n14.reduce((sum,item)=>sum+item.phiBanHang,0));
                doanhThuSanThangNay.push(n15.reduce((sum,item)=>sum+item.phiBanHang,0));   doanhThuSanThangNay.push(n16.reduce((sum,item)=>sum+item.phiBanHang,0));
                doanhThuSanThangNay.push(n17.reduce((sum,item)=>sum+item.phiBanHang,0));   doanhThuSanThangNay.push(n18.reduce((sum,item)=>sum+item.phiBanHang,0));
                doanhThuSanThangNay.push(n19.reduce((sum,item)=>sum+item.phiBanHang,0));   doanhThuSanThangNay.push(n20.reduce((sum,item)=>sum+item.phiBanHang,0));
                doanhThuSanThangNay.push(n21.reduce((sum,item)=>sum+item.phiBanHang,0));   doanhThuSanThangNay.push(n22.reduce((sum,item)=>sum+item.phiBanHang,0));
                doanhThuSanThangNay.push(n23.reduce((sum,item)=>sum+item.phiBanHang,0));   doanhThuSanThangNay.push(n24.reduce((sum,item)=>sum+item.phiBanHang,0));
                doanhThuSanThangNay.push(n25.reduce((sum,item)=>sum+item.phiBanHang,0));   doanhThuSanThangNay.push(n26.reduce((sum,item)=>sum+item.phiBanHang,0));
                doanhThuSanThangNay.push(n27.reduce((sum,item)=>sum+item.phiBanHang,0));   doanhThuSanThangNay.push(n28.reduce((sum,item)=>sum+item.phiBanHang,0));
                if(loaiThang ===29){
                    doanhThuSanThangNay.push(n29.reduce((sum,item)=>sum+item.phiBanHang,0));
                }
                if(loaiThang ===30){
                    doanhThuSanThangNay.push(n29.reduce((sum,item)=>sum+item.phiBanHang,0));   doanhThuSanThangNay.push(n30.reduce((sum,item)=>sum+item.phiBanHang,0));
                }
                if(loaiThang ===31){
                    doanhThuSanThangNay.push(n29.reduce((sum,item)=>sum+item.phiBanHang,0));   doanhThuSanThangNay.push(n30.reduce((sum,item)=>sum+item.phiBanHang,0));
                    doanhThuSanThangNay.push(n31.reduce((sum,item)=>sum+item.phiBanHang,0));
                }


                sanPhamThangNay.push(n1.reduce((sum,item)=>sum+item.chiTietDonHang.reduce((subsum,subitem)=>subsum+subitem.soLuong,0),0)); sanPhamThangNay.push(n2.reduce((sum,item)=>sum+item.chiTietDonHang.reduce((subsum,subitem)=>subsum+subitem.soLuong,0),0));
                sanPhamThangNay.push(n3.reduce((sum,item)=>sum+item.chiTietDonHang.reduce((subsum,subitem)=>subsum+subitem.soLuong,0),0)); sanPhamThangNay.push(n4.reduce((sum,item)=>sum+item.chiTietDonHang.reduce((subsum,subitem)=>subsum+subitem.soLuong,0),0));
                sanPhamThangNay.push(n5.reduce((sum,item)=>sum+item.chiTietDonHang.reduce((subsum,subitem)=>subsum+subitem.soLuong,0),0)); sanPhamThangNay.push(n6.reduce((sum,item)=>sum+item.chiTietDonHang.reduce((subsum,subitem)=>subsum+subitem.soLuong,0),0));
                sanPhamThangNay.push(n7.reduce((sum,item)=>sum+item.chiTietDonHang.reduce((subsum,subitem)=>subsum+subitem.soLuong,0),0)); sanPhamThangNay.push(n8.reduce((sum,item)=>sum+item.chiTietDonHang.reduce((subsum,subitem)=>subsum+subitem.soLuong,0),0));
                sanPhamThangNay.push(n9.reduce((sum,item)=>sum+item.chiTietDonHang.reduce((subsum,subitem)=>subsum+subitem.soLuong,0),0)); sanPhamThangNay.push(n10.reduce((sum,item)=>sum+item.chiTietDonHang.reduce((subsum,subitem)=>subsum+subitem.soLuong,0),0));
                sanPhamThangNay.push(n11.reduce((sum,item)=>sum+item.chiTietDonHang.reduce((subsum,subitem)=>subsum+subitem.soLuong,0),0)); sanPhamThangNay.push(n12.reduce((sum,item)=>sum+item.chiTietDonHang.reduce((subsum,subitem)=>subsum+subitem.soLuong,0),0));
                sanPhamThangNay.push(n13.reduce((sum,item)=>sum+item.chiTietDonHang.reduce((subsum,subitem)=>subsum+subitem.soLuong,0),0)); sanPhamThangNay.push(n14.reduce((sum,item)=>sum+item.chiTietDonHang.reduce((subsum,subitem)=>subsum+subitem.soLuong,0),0));
                sanPhamThangNay.push(n15.reduce((sum,item)=>sum+item.chiTietDonHang.reduce((subsum,subitem)=>subsum+subitem.soLuong,0),0)); sanPhamThangNay.push(n16.reduce((sum,item)=>sum+item.chiTietDonHang.reduce((subsum,subitem)=>subsum+subitem.soLuong,0),0));
                sanPhamThangNay.push(n17.reduce((sum,item)=>sum+item.chiTietDonHang.reduce((subsum,subitem)=>subsum+subitem.soLuong,0),0)); sanPhamThangNay.push(n18.reduce((sum,item)=>sum+item.chiTietDonHang.reduce((subsum,subitem)=>subsum+subitem.soLuong,0),0));
                sanPhamThangNay.push(n19.reduce((sum,item)=>sum+item.chiTietDonHang.reduce((subsum,subitem)=>subsum+subitem.soLuong,0),0)); sanPhamThangNay.push(n20.reduce((sum,item)=>sum+item.chiTietDonHang.reduce((subsum,subitem)=>subsum+subitem.soLuong,0),0));
                sanPhamThangNay.push(n21.reduce((sum,item)=>sum+item.chiTietDonHang.reduce((subsum,subitem)=>subsum+subitem.soLuong,0),0)); sanPhamThangNay.push(n22.reduce((sum,item)=>sum+item.chiTietDonHang.reduce((subsum,subitem)=>subsum+subitem.soLuong,0),0));
                sanPhamThangNay.push(n23.reduce((sum,item)=>sum+item.chiTietDonHang.reduce((subsum,subitem)=>subsum+subitem.soLuong,0),0)); sanPhamThangNay.push(n24.reduce((sum,item)=>sum+item.chiTietDonHang.reduce((subsum,subitem)=>subsum+subitem.soLuong,0),0));
                sanPhamThangNay.push(n25.reduce((sum,item)=>sum+item.chiTietDonHang.reduce((subsum,subitem)=>subsum+subitem.soLuong,0),0)); sanPhamThangNay.push(n26.reduce((sum,item)=>sum+item.chiTietDonHang.reduce((subsum,subitem)=>subsum+subitem.soLuong,0),0));
                sanPhamThangNay.push(n27.reduce((sum,item)=>sum+item.chiTietDonHang.reduce((subsum,subitem)=>subsum+subitem.soLuong,0),0)); sanPhamThangNay.push(n28.reduce((sum,item)=>sum+item.chiTietDonHang.reduce((subsum,subitem)=>subsum+subitem.soLuong,0),0));
                if(loaiThang ===29){
                    sanPhamThangNay.push(n29.reduce((sum,item)=>sum+item.chiTietDonHang.reduce((subsum,subitem)=>subsum+subitem.soLuong,0),0));
                }
                if(loaiThang ===30){
                    sanPhamThangNay.push(n29.reduce((sum,item)=>sum+item.chiTietDonHang.reduce((subsum,subitem)=>subsum+subitem.soLuong,0),0)); sanPhamThangNay.push(n30.reduce((sum,item)=>sum+item.chiTietDonHang.reduce((subsum,subitem)=>subsum+subitem.soLuong,0),0));
                }
                if(loaiThang ===31){
                    sanPhamThangNay.push(n29.reduce((sum,item)=>sum+item.chiTietDonHang.reduce((subsum,subitem)=>subsum+subitem.soLuong,0),0)); sanPhamThangNay.push(n30.reduce((sum,item)=>sum+item.chiTietDonHang.reduce((subsum,subitem)=>subsum+subitem.soLuong,0),0));
                    sanPhamThangNay.push(n31.reduce((sum,item)=>sum+item.chiTietDonHang.reduce((subsum,subitem)=>subsum+subitem.soLuong,0),0));
                }
                const categories = ['N1', 'N2', 'N3', 'N4','N5', 'N6','N7', 'N8','N9', 'N10','N11', 'N12','N13', 'N14','N15', 'N16','N17', 'N18','N19', 'N20','N21', 'N22','N23', 'N24','N25', 'N26','N27', 'N28'];
                if(loaiThang ===29){
                    categories.push('N29');
                }
                if(loaiThang ===30){
                    categories.push('N29');  categories.push('N30');
                }
                if(loaiThang ===31){
                    categories.push('N29');  categories.push('N30');  categories.push('N31');
                }
                client.close();
                res.status(200).json({
                    status: "ok",
                    series:[{
                        name: 'Doanh thu san',
                        type: 'column',
                        data: doanhThuSanThangNay
                    }, {
                        name: 'Doanh thu shop',
                        type: 'column',
                        data: doanhThuShopThangNay
                    }, {
                        name: 'Số sản phẩm',
                        type: 'line',
                        data: sanPhamThangNay
                    }],
                    categories:categories
                });
            }

        } catch (e) {
            console.log(e)
            res.status(200).json({
                status: "fail",
                message: e.toString()
            });
        }
    },

    ThongKeDaiHan_Admin: async function (req, res, next) {
        const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
        try {
            const {type,nam} = req.body;    //'0':Tháng;  '1':Quý;
            await client.connect();
            const db = client.db(DbName);
            const colDonHang = db.collection('DonHang');
            let resDonHang = await colDonHang.find({trangThaiDonHang:2,trangThaiXoa:false}).toArray();
            //Lọc đơn hàng theo năm
            const donHangTrongNam =  resDonHang.filter(item=> new Date(item.ngayTaoDon).getFullYear() === nam);
            // console.log(req.body);
            if(type === 0){  //Tháng
                //Lấy thống kê theo tháng
                let doanhThuShopTheoThang = [];
                let doanhThuSanTheoThang = [];
                let sanPhamThang = [];
                let t1= []; let t2= []; let t3= []; let t4= []; let t5= []; let t6= [];
                let t7= []; let t8= []; let t9= []; let t10= []; let t11= []; let t12= [];

                donHangTrongNam.map((item)=>{
                    const date = new Date(item.ngayTaoDon);
                    if((date.getMonth()+1 === 1)) {t1.push(item)}   if((date.getMonth()+1 === 2)) {t2.push(item)}
                    if((date.getMonth()+1 === 3)) {t3.push(item)}   if((date.getMonth()+1 === 4)) {t4.push(item)}
                    if((date.getMonth()+1 === 5)) {t5.push(item)}   if((date.getMonth()+1 === 6)) {t6.push(item)}
                    if((date.getMonth()+1 === 7)) {t7.push(item)}   if((date.getMonth()+1 === 8)) {t8.push(item)}
                    if((date.getMonth()+1 === 9)) {t9.push(item)}   if((date.getMonth()+1 === 10)) {t10.push(item)}
                    if((date.getMonth()+1 === 11)) {t11.push(item)} if((date.getMonth()+1 === 12)) {t12.push(item)}
                });

                doanhThuShopTheoThang.push(t1.reduce((sum,item)=>sum+item.tongGia,0));    doanhThuShopTheoThang.push(t2.reduce((sum,item)=>sum+item.tongGia,0));
                doanhThuShopTheoThang.push(t3.reduce((sum,item)=>sum+item.tongGia,0));    doanhThuShopTheoThang.push(t4.reduce((sum,item)=>sum+item.tongGia,0));
                doanhThuShopTheoThang.push(t5.reduce((sum,item)=>sum+item.tongGia,0));    doanhThuShopTheoThang.push(t6.reduce((sum,item)=>sum+item.tongGia,0));
                doanhThuShopTheoThang.push(t7.reduce((sum,item)=>sum+item.tongGia,0));    doanhThuShopTheoThang.push(t8.reduce((sum,item)=>sum+item.tongGia,0));
                doanhThuShopTheoThang.push(t9.reduce((sum,item)=>sum+item.tongGia,0));    doanhThuShopTheoThang.push(t10.reduce((sum,item)=>sum+item.tongGia,0));
                doanhThuShopTheoThang.push(t11.reduce((sum,item)=>sum+item.tongGia,0));    doanhThuShopTheoThang.push(t12.reduce((sum,item)=>sum+item.tongGia,0));

                doanhThuSanTheoThang.push(t1.reduce((sum,item)=>sum+item.phiBanHang,0));    doanhThuSanTheoThang.push(t2.reduce((sum,item)=>sum+item.phiBanHang,0));
                doanhThuSanTheoThang.push(t3.reduce((sum,item)=>sum+item.phiBanHang,0));    doanhThuSanTheoThang.push(t4.reduce((sum,item)=>sum+item.phiBanHang,0));
                doanhThuSanTheoThang.push(t5.reduce((sum,item)=>sum+item.phiBanHang,0));    doanhThuSanTheoThang.push(t6.reduce((sum,item)=>sum+item.phiBanHang,0));
                doanhThuSanTheoThang.push(t7.reduce((sum,item)=>sum+item.phiBanHang,0));    doanhThuSanTheoThang.push(t8.reduce((sum,item)=>sum+item.phiBanHang,0));
                doanhThuSanTheoThang.push(t9.reduce((sum,item)=>sum+item.phiBanHang,0));    doanhThuSanTheoThang.push(t10.reduce((sum,item)=>sum+item.phiBanHang,0));
                doanhThuSanTheoThang.push(t11.reduce((sum,item)=>sum+item.phiBanHang,0));    doanhThuSanTheoThang.push(t12.reduce((sum,item)=>sum+item.phiBanHang,0));

                sanPhamThang.push(t1.reduce((sum,item)=>sum+item.chiTietDonHang.reduce((subsum,subitem)=>subsum+subitem.soLuong,0),0));
                sanPhamThang.push(t2.reduce((sum,item)=>sum+item.chiTietDonHang.reduce((subsum,subitem)=>subsum+subitem.soLuong,0),0));
                sanPhamThang.push(t3.reduce((sum,item)=>sum+item.chiTietDonHang.reduce((subsum,subitem)=>subsum+subitem.soLuong,0),0));
                sanPhamThang.push(t4.reduce((sum,item)=>sum+item.chiTietDonHang.reduce((subsum,subitem)=>subsum+subitem.soLuong,0),0));
                sanPhamThang.push(t5.reduce((sum,item)=>sum+item.chiTietDonHang.reduce((subsum,subitem)=>subsum+subitem.soLuong,0),0));
                sanPhamThang.push(t6.reduce((sum,item)=>sum+item.chiTietDonHang.reduce((subsum,subitem)=>subsum+subitem.soLuong,0),0));
                sanPhamThang.push(t7.reduce((sum,item)=>sum+item.chiTietDonHang.reduce((subsum,subitem)=>subsum+subitem.soLuong,0),0));
                sanPhamThang.push(t8.reduce((sum,item)=>sum+item.chiTietDonHang.reduce((subsum,subitem)=>subsum+subitem.soLuong,0),0));
                sanPhamThang.push(t9.reduce((sum,item)=>sum+item.chiTietDonHang.reduce((subsum,subitem)=>subsum+subitem.soLuong,0),0));
                sanPhamThang.push(t10.reduce((sum,item)=>sum+item.chiTietDonHang.reduce((subsum,subitem)=>subsum+subitem.soLuong,0),0));
                sanPhamThang.push(t11.reduce((sum,item)=>sum+item.chiTietDonHang.reduce((subsum,subitem)=>subsum+subitem.soLuong,0),0));
                sanPhamThang.push(t12.reduce((sum,item)=>sum+item.chiTietDonHang.reduce((subsum,subitem)=>subsum+subitem.soLuong,0),0));

                client.close();
                res.status(200).json({
                    status: "ok",
                    series:[{
                        name: 'Doanh thu sàn',
                        type: 'column',
                        data: doanhThuSanTheoThang
                    }, {
                        name: 'Doanh thu shop',
                        type: 'column',
                        data: doanhThuShopTheoThang
                    }, {
                        name: 'Số sản phẩm',
                        type: 'line',
                        data: sanPhamThang
                    }],
                    categories:['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11','T12']
                });
            }

            if(type === 1){  //Quý
                //Lấy thống kê theo quý
                let doanhThuShopTheoQuy = [];
                let doanhThuSanTheoQuy = [];
                let sanPhamQuy = [];
                let q1= []; let q2= []; let q3= []; let q4= [];
                donHangTrongNam.map((item)=>{
                    const date = new Date(item.ngayTaoDon);
                    if(([1,2,3].includes(date.getMonth()+1))) {q1.push(item)}   if(([4,5,6].includes(date.getMonth()+1))) {q2.push(item)}
                    if(([7,8,9].includes(date.getMonth()+1))) {q3.push(item)}   if(([10,11,12].includes(date.getMonth()+1))) {q4.push(item)}
                });

                doanhThuShopTheoQuy.push(q1.reduce((sum,item)=>sum+item.tongGia,0));    doanhThuShopTheoQuy.push(q2.reduce((sum,item)=>sum+item.tongGia,0));
                doanhThuShopTheoQuy.push(q3.reduce((sum,item)=>sum+item.tongGia,0));    doanhThuShopTheoQuy.push(q4.reduce((sum,item)=>sum+item.tongGia,0));

                doanhThuSanTheoQuy.push(q1.reduce((sum,item)=>sum+item.phiBanHang,0));   doanhThuSanTheoQuy.push(q2.reduce((sum,item)=>sum+item.phiBanHang,0));
                doanhThuSanTheoQuy.push(q3.reduce((sum,item)=>sum+item.phiBanHang,0));   doanhThuSanTheoQuy.push(q4.reduce((sum,item)=>sum+item.phiBanHang,0));

                sanPhamQuy.push(q1.reduce((sum,item)=>sum+item.chiTietDonHang.reduce((subsum,subitem)=>subsum+subitem.soLuong,0),0));
                sanPhamQuy.push(q2.reduce((sum,item)=>sum+item.chiTietDonHang.reduce((subsum,subitem)=>subsum+subitem.soLuong,0),0));
                sanPhamQuy.push(q3.reduce((sum,item)=>sum+item.chiTietDonHang.reduce((subsum,subitem)=>subsum+subitem.soLuong,0),0));
                sanPhamQuy.push(q4.reduce((sum,item)=>sum+item.chiTietDonHang.reduce((subsum,subitem)=>subsum+subitem.soLuong,0),0));

                client.close();
                res.status(200).json({
                    status: "ok",
                    series:[{
                        name: 'Doanh thu sàn',
                        type: 'column',
                        data: doanhThuSanTheoQuy
                    }, {
                        name: 'Doanh thu shop',
                        type: 'column',
                        data: doanhThuShopTheoQuy
                    }, {
                        name: 'Số sản phẩm',
                        type: 'line',
                        data: sanPhamQuy
                    }],
                    categories:['Quý 1', 'Quý 2', 'Quý 3', 'Quý 4']
                });
            }

        } catch (e) {
            console.log(e)
            res.status(200).json({
                status: "fail",
                message: e.toString()
            });
        }
    },
}

