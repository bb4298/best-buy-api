const ObjectId = require('mongodb').ObjectId;
const {BoDau} = require('../../utils/hamHoTro');
module.exports = {
    ValidateFilterKhiTimKiem_DanhSachShopVaPhiBanHang(req, res, next){
        let {trangthainophi,searchtype,tukhoa,sapxep,page,pagesize} = req.query;
        if(!page){page = 0} if(parseInt(page)<0){page = 0}
        if(!pagesize){pagesize = 10}  if(parseInt(pagesize)<0){pagesize = 10}
        let filter = {};

        //Trạng thái nợ phí
        if(![0,1].includes(parseInt(trangthainophi))){filter.phiNoHienTai = {'$gt':0}}
        if(parseInt(trangthainophi) === 0){filter.phiNoHienTai = {'$gt':0}}
        if(parseInt(trangthainophi) === 1){filter.phiNoHienTai = 0}

        if(![0,2,3].includes(parseInt(searchtype)) && tukhoa){filter.tenDangNhap =  {'$regex': tukhoa, '$options': '$i'}}
        if(parseInt(searchtype) === 0 && tukhoa){filter.tenDangNhap =  {'$regex': tukhoa, '$options': '$i'}}
       // if(parseInt(searchtype) === 1 && tukhoa){filter.thongTinShop.tenShop = {'$regex': tukhoa, '$options': '$i'}}
        if(parseInt(searchtype) === 2 && tukhoa){filter.email = {'$regex': tukhoa, '$options': '$i'}}
        if(parseInt(searchtype) === 3 && tukhoa){filter.sdt = {'$regex': tukhoa, '$options': '$i'}}


        req.filter = filter;
        req.page = page;
        req.pagesize = pagesize;


        let sort = {};
        if(!sapxep) { sort.phiBanHang = -1}
        if(sapxep === 'esc') { sort.phiBanHang = 1}
        if(sapxep === 'desc') { sort.phiBanHang = -1}

        req.sort = sort;
         console.log('searchtype')
         console.log(searchtype)
         console.log(filter)
         console.log(sort)
         console.log('sort')
        next();
    },


    ValidateFilterKhiTimKiem_DonHang_CuaShop(req, res, next){    //Dùng cho admin
        let {idshop,loaidh,searchtype,tukhoa,ngaythang,tungay,denngay,thanhtoan,page,pagesize} = req.query;
        if(!page){page = 0} if(parseInt(page)<0){page = 0}
        if(!pagesize){pagesize = 10}  if(parseInt(pagesize)<0){pagesize = 10}
        let filter = {trangThaiDonHang:2,ID_ChuShop:ObjectId(idshop)}

        //Trạng thái đơn hàng
        if(![0,1,2,3].includes(parseInt(loaidh))){filter.trangThaiThuPhi = false}
        if(parseInt(loaidh) === 0){filter.trangThaiThuPhi = false}
        if(parseInt(loaidh) === 1){filter.trangThaiThuPhi = true}
        if(parseInt(loaidh) === 2){filter.trangThaiDonHang = 3}

        if(![0,1,2].includes(parseInt(searchtype)) && tukhoa){filter.id =  {'$regex': tukhoa, '$options': '$i'}}
        if(parseInt(searchtype) === 0 && tukhoa){filter.id =  {'$regex': tukhoa, '$options': '$i'}}
        if(parseInt(searchtype) === 1 && tukhoa){filter.sdt = {'$regex': tukhoa, '$options': '$i'}}
        if(parseInt(searchtype) === 2 && tukhoa){filter.email = {'$regex': tukhoa, '$options': '$i'}}

        if(parseInt(thanhtoan) === 0){filter.trangThaiThanhToan = 0}
        if(parseInt(thanhtoan) === 1){filter.trangThaiThanhToan = 1}

        if(tungay && denngay) { filter.ngayTaoDon = {'$gte': new Date(tungay), '$lte': new Date(denngay)}}
        if(tungay && !denngay) { filter.ngayTaoDon = {'$gte': new Date(tungay)}}
        if(!tungay && denngay) { filter.ngayTaoDon = {'$lte': new Date(denngay)}}

        req.filter = filter;
        req.page = page;
        req.pagesize = pagesize;


        let sort = {};
        if(!ngaythang) { sort.ngayTaoDon = -1}
        if(ngaythang === 'esc') { sort.ngayTaoDon = 1}
        if(ngaythang === 'desc') { sort.ngayTaoDon = -1}

        req.sort = sort;
        /* console.log('searchtype')
         console.log(searchtype)
         console.log('filter')
         console.log(filter)
         console.log('sort')
         console.log(sort)*/
        next();
    },
}