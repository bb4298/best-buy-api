const ObjectId = require('mongodb').ObjectId;
const {BoDau} = require('../../utils/hamHoTro');
module.exports = {
    ValidateFilterKhiTimKiem_DonHang(req, res, next){    //Cho cả chủ shop và người dùng
      //  const chuShopId =  ObjectId(req.chuShopId);
        const vaiTroUser =  req.vaiTro;   //'1':chủ shop;  '2':khách hàng

        let {loaidh,searchtype,tukhoa,ngaythang,tungay,denngay,thanhtoan,page,pagesize} = req.query;
        if(!page){page = 0} if(parseInt(page)<0){page = 0}
        if(!pagesize){pagesize = 10}  if(parseInt(pagesize)<0){pagesize = 10}
        let filter = {trangThaiXoa: false}

        //Tìm kiếm dụa theo chủ shop hoặc khách hàng
        if(vaiTroUser === 1){filter.ID_ChuShop = ObjectId(req.chuShopId)}
        if(vaiTroUser === 2){filter.ID_KhachHang = ObjectId(req.khachHangId)}

        //Trạng thái đơn hàng
        if(![0,1,2,3].includes(parseInt(loaidh))){filter.trangThaiDonHang = 0}
        if(parseInt(loaidh) === 0){filter.trangThaiDonHang = 0}
        if(parseInt(loaidh) === 1){filter.trangThaiDonHang = 1}
        if(parseInt(loaidh) === 2){filter.trangThaiDonHang = 2}
        if(parseInt(loaidh) === 3){filter.trangThaiDonHang = 3}

        if(![0,1,2,3,4].includes(parseInt(searchtype)) && tukhoa){filter.id =  {'$regex': tukhoa, '$options': '$i'}}
        if(parseInt(searchtype) === 0 && tukhoa){filter.id =  {'$regex': tukhoa, '$options': '$i'}}
        if(parseInt(searchtype) === 1 && tukhoa){filter.tenDangNhapKhachHang = {'$regex': tukhoa, '$options': '$i'}}
        if(parseInt(searchtype) === 2 && tukhoa){filter.lowerCase = {'$regex': BoDau(tukhoa), '$options': '$i'}}
        if(parseInt(searchtype) === 3 && tukhoa){filter.sdt = {'$regex': tukhoa, '$options': '$i'}}
        if(parseInt(searchtype) === 4 && tukhoa){filter.email = {'$regex': tukhoa, '$options': '$i'}}

        if(parseInt(thanhtoan) === 0){filter.trangThaiThanhToan = 0}
        if(parseInt(thanhtoan) === 1){filter.trangThaiThanhToan = 1}


        if(tungay && denngay) { filter.ngayTaoDon = {'$gte': new Date(tungay), '$lte': new Date(denngay)}}
        if(tungay && !denngay) { filter.ngayTaoDon = {'$gte': new Date(tungay)}}
        if(!tungay && denngay) { filter.ngayTaoDon = {'$lte': new Date(denngay)}}

        req.filter = filter;
        req.page = page;
        req.pagesize = pagesize;


        let sort = {};
        if(!ngaythang) { sort._id = -1}
        if(ngaythang === 'esc') { sort._id = 1}
        if(ngaythang === 'desc') { sort._id = -1}

        req.sort = sort;
       // console.log(searchtype)
       // console.log(filter)
       // console.log(sort)
        next();
    },

}