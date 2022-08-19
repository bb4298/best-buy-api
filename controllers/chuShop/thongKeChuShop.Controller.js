const {DbUrl,DbName} = require('../../configs/constant');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const moment =require('moment');
const {tinhNamNhuan} = require('../../utils/hamHoTro');
module.exports = {
    ThongKeNganHan_ChuShop: async function (req, res, next) {
        const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
        try {
            const {type} = req.body;    //'0':Tuần này;  '1':Tháng này;
            const idChuShop =  ObjectId(req.chuShopId);
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
                    ID_ChuShop:idChuShop,
                    trangThaiDonHang:2,
                    trangThaiXoa:false,
                    ngayTaoDon:{'$gte': th2, '$lte': cn}}).toArray();
                //Lấy thống kê tuần này
                let doanhThuTuan = [];
                let phiBanHangTuan = [];
                let sanPhamTuan = [];
                let n1= []; let n2= []; let n3= []; let n4= []; let n5= []; let n6= [];let n7= [];
                resDonHang.map((item,index)=>{
                    const date = moment(item.ngayTaoDon);
                    if((date.isSame(moment(th2),'day'))) {n1.push(item)}   if((date.isSame(moment(th3),'day'))) {n2.push(item)}
                    if((date.isSame(moment(th4),'day'))) {n3.push(item)}   if((date.isSame(moment(th5),'day'))) {n4.push(item)}
                    if((date.isSame(moment(th6),'day'))) {n5.push(item)}   if((date.isSame(moment(th7),'day'))) {n6.push(item)}
                    if((date.isSame(moment(cn),'day'))) {n7.push(item)}
                });

                doanhThuTuan.push(n1.reduce((sum,item)=>sum+item.tongGia,0));    doanhThuTuan.push(n2.reduce((sum,item)=>sum+item.tongGia,0));
                doanhThuTuan.push(n3.reduce((sum,item)=>sum+item.tongGia,0));    doanhThuTuan.push(n4.reduce((sum,item)=>sum+item.tongGia,0));
                doanhThuTuan.push(n5.reduce((sum,item)=>sum+item.tongGia,0));    doanhThuTuan.push(n6.reduce((sum,item)=>sum+item.tongGia,0));
                doanhThuTuan.push(n7.reduce((sum,item)=>sum+item.tongGia,0));

                phiBanHangTuan.push(n1.reduce((sum,item)=>sum+item.phiBanHang,0));    phiBanHangTuan.push(n2.reduce((sum,item)=>sum+item.phiBanHang,0));
                phiBanHangTuan.push(n3.reduce((sum,item)=>sum+item.phiBanHang,0));    phiBanHangTuan.push(n4.reduce((sum,item)=>sum+item.phiBanHang,0));
                phiBanHangTuan.push(n5.reduce((sum,item)=>sum+item.phiBanHang,0));    phiBanHangTuan.push(n6.reduce((sum,item)=>sum+item.phiBanHang,0));
                phiBanHangTuan.push(n7.reduce((sum,item)=>sum+item.phiBanHang,0));

                sanPhamTuan.push(n1.reduce((sum,item)=>sum+item.chiTietDonHang.reduce((subsum,subitem)=>subsum+subitem.soLuong,0),0));
                sanPhamTuan.push(n2.reduce((sum,item)=>sum+item.chiTietDonHang.reduce((subsum,subitem)=>subsum+subitem.soLuong,0),0));
                sanPhamTuan.push(n3.reduce((sum,item)=>sum+item.chiTietDonHang.reduce((subsum,subitem)=>subsum+subitem.soLuong,0),0));
                sanPhamTuan.push(n4.reduce((sum,item)=>sum+item.chiTietDonHang.reduce((subsum,subitem)=>subsum+subitem.soLuong,0),0));
                sanPhamTuan.push(n5.reduce((sum,item)=>sum+item.chiTietDonHang.reduce((subsum,subitem)=>subsum+subitem.soLuong,0),0));
                sanPhamTuan.push(n6.reduce((sum,item)=>sum+item.chiTietDonHang.reduce((subsum,subitem)=>subsum+subitem.soLuong,0),0));
                sanPhamTuan.push(n7.reduce((sum,item)=>sum+item.chiTietDonHang.reduce((subsum,subitem)=>subsum+subitem.soLuong,0),0));

                client.close();
                res.status(200).json({
                    status: "ok",
                    series:[{
                        name: 'Doanh thu shop',
                        type: 'column',
                        data: doanhThuTuan
                    }, {
                        name: 'Phí bán hàng',
                        type: 'column',
                        data: phiBanHangTuan
                    }, {
                        name: 'Số sản phẩm',
                        type: 'line',
                        data: sanPhamTuan
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
                    ID_ChuShop:idChuShop,
                    trangThaiDonHang:2,
                    trangThaiXoa:false,
                    ngayTaoDon:{'$gte': ng1, '$lte': ng31}}).toArray();
                console.log(resDonHang);
                //Lấy doanh số theo quý
                let doanhThuThangNay = [];
                let phiBanHangThangNay = [];
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

                doanhThuThangNay.push(n1.reduce((sum,item)=>sum+item.tongGia,0));     doanhThuThangNay.push(n2.reduce((sum,item)=>sum+item.tongGia,0));
                doanhThuThangNay.push(n3.reduce((sum,item)=>sum+item.tongGia,0));     doanhThuThangNay.push(n4.reduce((sum,item)=>sum+item.tongGia,0));
                doanhThuThangNay.push(n5.reduce((sum,item)=>sum+item.tongGia,0));     doanhThuThangNay.push(n6.reduce((sum,item)=>sum+item.tongGia,0));
                doanhThuThangNay.push(n7.reduce((sum,item)=>sum+item.tongGia,0));     doanhThuThangNay.push(n8.reduce((sum,item)=>sum+item.tongGia,0));
                doanhThuThangNay.push(n9.reduce((sum,item)=>sum+item.tongGia,0));     doanhThuThangNay.push(n10.reduce((sum,item)=>sum+item.tongGia,0));
                doanhThuThangNay.push(n11.reduce((sum,item)=>sum+item.tongGia,0));    doanhThuThangNay.push(n12.reduce((sum,item)=>sum+item.tongGia,0));
                doanhThuThangNay.push(n13.reduce((sum,item)=>sum+item.tongGia,0));    doanhThuThangNay.push(n14.reduce((sum,item)=>sum+item.tongGia,0));
                doanhThuThangNay.push(n15.reduce((sum,item)=>sum+item.tongGia,0));    doanhThuThangNay.push(n16.reduce((sum,item)=>sum+item.tongGia,0));
                doanhThuThangNay.push(n17.reduce((sum,item)=>sum+item.tongGia,0));    doanhThuThangNay.push(n18.reduce((sum,item)=>sum+item.tongGia,0));
                doanhThuThangNay.push(n19.reduce((sum,item)=>sum+item.tongGia,0));    doanhThuThangNay.push(n20.reduce((sum,item)=>sum+item.tongGia,0));
                doanhThuThangNay.push(n21.reduce((sum,item)=>sum+item.tongGia,0));    doanhThuThangNay.push(n22.reduce((sum,item)=>sum+item.tongGia,0));
                doanhThuThangNay.push(n23.reduce((sum,item)=>sum+item.tongGia,0));    doanhThuThangNay.push(n24.reduce((sum,item)=>sum+item.tongGia,0));
                doanhThuThangNay.push(n25.reduce((sum,item)=>sum+item.tongGia,0));    doanhThuThangNay.push(n26.reduce((sum,item)=>sum+item.tongGia,0));
                doanhThuThangNay.push(n27.reduce((sum,item)=>sum+item.tongGia,0));    doanhThuThangNay.push(n28.reduce((sum,item)=>sum+item.tongGia,0));
                if(loaiThang ===29){
                    doanhThuThangNay.push(n29.reduce((sum,item)=>sum+item.tongGia,0));
                }
                if(loaiThang ===30){
                    doanhThuThangNay.push(n29.reduce((sum,item)=>sum+item.tongGia,0));   doanhThuThangNay.push(n30.reduce((sum,item)=>sum+item.tongGia,0));
                }
                if(loaiThang ===31){
                    doanhThuThangNay.push(n29.reduce((sum,item)=>sum+item.tongGia,0));   doanhThuThangNay.push(n30.reduce((sum,item)=>sum+item.tongGia,0));
                    doanhThuThangNay.push(n31.reduce((sum,item)=>sum+item.tongGia,0));
                }


                phiBanHangThangNay.push(n1.reduce((sum,item)=>sum+item.phiBanHang,0));    phiBanHangThangNay.push(n2.reduce((sum,item)=>sum+item.phiBanHang,0));
                phiBanHangThangNay.push(n3.reduce((sum,item)=>sum+item.phiBanHang,0));    phiBanHangThangNay.push(n4.reduce((sum,item)=>sum+item.phiBanHang,0));
                phiBanHangThangNay.push(n5.reduce((sum,item)=>sum+item.phiBanHang,0));    phiBanHangThangNay.push(n6.reduce((sum,item)=>sum+item.phiBanHang,0));
                phiBanHangThangNay.push(n7.reduce((sum,item)=>sum+item.phiBanHang,0));    phiBanHangThangNay.push(n8.reduce((sum,item)=>sum+item.phiBanHang,0));
                phiBanHangThangNay.push(n9.reduce((sum,item)=>sum+item.phiBanHang,0));    phiBanHangThangNay.push(n10.reduce((sum,item)=>sum+item.phiBanHang,0));
                phiBanHangThangNay.push(n11.reduce((sum,item)=>sum+item.phiBanHang,0));   phiBanHangThangNay.push(n12.reduce((sum,item)=>sum+item.phiBanHang,0));
                phiBanHangThangNay.push(n13.reduce((sum,item)=>sum+item.phiBanHang,0));   phiBanHangThangNay.push(n14.reduce((sum,item)=>sum+item.phiBanHang,0));
                phiBanHangThangNay.push(n15.reduce((sum,item)=>sum+item.phiBanHang,0));   phiBanHangThangNay.push(n16.reduce((sum,item)=>sum+item.phiBanHang,0));
                phiBanHangThangNay.push(n17.reduce((sum,item)=>sum+item.phiBanHang,0));   phiBanHangThangNay.push(n18.reduce((sum,item)=>sum+item.phiBanHang,0));
                phiBanHangThangNay.push(n19.reduce((sum,item)=>sum+item.phiBanHang,0));   phiBanHangThangNay.push(n20.reduce((sum,item)=>sum+item.phiBanHang,0));
                phiBanHangThangNay.push(n21.reduce((sum,item)=>sum+item.phiBanHang,0));   phiBanHangThangNay.push(n22.reduce((sum,item)=>sum+item.phiBanHang,0));
                phiBanHangThangNay.push(n23.reduce((sum,item)=>sum+item.phiBanHang,0));   phiBanHangThangNay.push(n24.reduce((sum,item)=>sum+item.phiBanHang,0));
                phiBanHangThangNay.push(n25.reduce((sum,item)=>sum+item.phiBanHang,0));   phiBanHangThangNay.push(n26.reduce((sum,item)=>sum+item.phiBanHang,0));
                phiBanHangThangNay.push(n27.reduce((sum,item)=>sum+item.phiBanHang,0));   phiBanHangThangNay.push(n28.reduce((sum,item)=>sum+item.phiBanHang,0));
                if(loaiThang ===29){
                    phiBanHangThangNay.push(n29.reduce((sum,item)=>sum+item.phiBanHang,0));
                }
                if(loaiThang ===30){
                    phiBanHangThangNay.push(n29.reduce((sum,item)=>sum+item.phiBanHang,0));   phiBanHangThangNay.push(n30.reduce((sum,item)=>sum+item.phiBanHang,0));
                }
                if(loaiThang ===31){
                    phiBanHangThangNay.push(n29.reduce((sum,item)=>sum+item.phiBanHang,0));   phiBanHangThangNay.push(n30.reduce((sum,item)=>sum+item.phiBanHang,0));
                    phiBanHangThangNay.push(n31.reduce((sum,item)=>sum+item.phiBanHang,0));
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
                        name: 'Doanh thu shop',
                        type: 'column',
                        data: doanhThuThangNay
                    }, {
                        name: 'Phí bán hàng',
                        type: 'column',
                        data: phiBanHangThangNay
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

    ThongKeDaiHan_ChuShop: async function (req, res, next) {
        const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
        try {
            const {type,nam} = req.body;    //'0':Tháng;  '1':Quý;
            const idChuShop =  ObjectId(req.chuShopId);
            await client.connect();
            const db = client.db(DbName);
            const colDonHang = db.collection('DonHang');
            let resDonHang = await colDonHang.find({ID_ChuShop:idChuShop,trangThaiDonHang:2,trangThaiXoa:false}).toArray();
            //Lọc đơn hàng theo năm
            const donHangTrongNam =  resDonHang.filter(item=> new Date(item.ngayTaoDon).getFullYear() === nam);
           // console.log(req.body);
            if(type === 0){  //Tháng
                //Lấy thống kê theo tháng
                let doanhThuThang = [];
                let phiBanHangThang = [];
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

                doanhThuThang.push(t1.reduce((sum,item)=>sum+item.tongGia,0));    doanhThuThang.push(t2.reduce((sum,item)=>sum+item.tongGia,0));
                doanhThuThang.push(t3.reduce((sum,item)=>sum+item.tongGia,0));    doanhThuThang.push(t4.reduce((sum,item)=>sum+item.tongGia,0));
                doanhThuThang.push(t5.reduce((sum,item)=>sum+item.tongGia,0));    doanhThuThang.push(t6.reduce((sum,item)=>sum+item.tongGia,0));
                doanhThuThang.push(t7.reduce((sum,item)=>sum+item.tongGia,0));    doanhThuThang.push(t8.reduce((sum,item)=>sum+item.tongGia,0));
                doanhThuThang.push(t9.reduce((sum,item)=>sum+item.tongGia,0));    doanhThuThang.push(t10.reduce((sum,item)=>sum+item.tongGia,0));
                doanhThuThang.push(t11.reduce((sum,item)=>sum+item.tongGia,0));    doanhThuThang.push(t12.reduce((sum,item)=>sum+item.tongGia,0));

                phiBanHangThang.push(t1.reduce((sum,item)=>sum+item.phiBanHang,0));    phiBanHangThang.push(t2.reduce((sum,item)=>sum+item.phiBanHang,0));
                phiBanHangThang.push(t3.reduce((sum,item)=>sum+item.phiBanHang,0));    phiBanHangThang.push(t4.reduce((sum,item)=>sum+item.phiBanHang,0));
                phiBanHangThang.push(t5.reduce((sum,item)=>sum+item.phiBanHang,0));    phiBanHangThang.push(t6.reduce((sum,item)=>sum+item.phiBanHang,0));
                phiBanHangThang.push(t7.reduce((sum,item)=>sum+item.phiBanHang,0));    phiBanHangThang.push(t8.reduce((sum,item)=>sum+item.phiBanHang,0));
                phiBanHangThang.push(t9.reduce((sum,item)=>sum+item.phiBanHang,0));    phiBanHangThang.push(t10.reduce((sum,item)=>sum+item.phiBanHang,0));
                phiBanHangThang.push(t11.reduce((sum,item)=>sum+item.phiBanHang,0));    phiBanHangThang.push(t12.reduce((sum,item)=>sum+item.phiBanHang,0));

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
                        name: 'Doanh thu shop',
                        type: 'column',
                        data: doanhThuThang
                    }, {
                        name: 'Phí bán hàng',
                        type: 'column',
                        data: phiBanHangThang
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
                let doanhThuQuy = [];
                let phiBanHangQuy = [];
                let sanPhamQuy = [];
                let q1= []; let q2= []; let q3= []; let q4= [];
                donHangTrongNam.map((item)=>{
                    const date = new Date(item.ngayTaoDon);
                    if(([1,2,3].includes(date.getMonth()+1))) {q1.push(item)}   if(([4,5,6].includes(date.getMonth()+1))) {q2.push(item)}
                    if(([7,8,9].includes(date.getMonth()+1))) {q3.push(item)}   if(([10,11,12].includes(date.getMonth()+1))) {q4.push(item)}
                });

                doanhThuQuy.push(q1.reduce((sum,item)=>sum+item.tongGia,0));    doanhThuQuy.push(q2.reduce((sum,item)=>sum+item.tongGia,0));
                doanhThuQuy.push(q3.reduce((sum,item)=>sum+item.tongGia,0));    doanhThuQuy.push(q4.reduce((sum,item)=>sum+item.tongGia,0));

                phiBanHangQuy.push(q1.reduce((sum,item)=>sum+item.phiBanHang,0));   phiBanHangQuy.push(q2.reduce((sum,item)=>sum+item.phiBanHang,0));
                phiBanHangQuy.push(q3.reduce((sum,item)=>sum+item.phiBanHang,0));   phiBanHangQuy.push(q4.reduce((sum,item)=>sum+item.phiBanHang,0));

                sanPhamQuy.push(q1.reduce((sum,item)=>sum+item.chiTietDonHang.reduce((subsum,subitem)=>subsum+subitem.soLuong,0),0));
                sanPhamQuy.push(q2.reduce((sum,item)=>sum+item.chiTietDonHang.reduce((subsum,subitem)=>subsum+subitem.soLuong,0),0));
                sanPhamQuy.push(q3.reduce((sum,item)=>sum+item.chiTietDonHang.reduce((subsum,subitem)=>subsum+subitem.soLuong,0),0));
                sanPhamQuy.push(q4.reduce((sum,item)=>sum+item.chiTietDonHang.reduce((subsum,subitem)=>subsum+subitem.soLuong,0),0));

                client.close();
                res.status(200).json({
                    status: "ok",
                    series:[{
                        name: 'Doanh thu shop',
                        type: 'column',
                        data: doanhThuQuy
                    }, {
                        name: 'Phí bán hàng',
                        type: 'column',
                        data: phiBanHangQuy
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

