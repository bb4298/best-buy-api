const ObjectId = require('mongodb').ObjectId;
const {BoDau} = require('../../utils/hamHoTro');
module.exports = {
    ValidateFilterKhiTimKiem_TrangChu(req, res, next){

        let {tukhoa,danhmuc,tinhthanh,giamin,giamax,giamgia,sapxep,sapxepgia,sosao,page,pagesize,idchushop} = req.query;
        if(!page){page = 0} if(parseInt(page)<0){page = 0}
        if(!pagesize){pagesize = 20}  if(parseInt(pagesize)<0){pagesize = 20}
        let filter = {trangThaiDuyet:true,trangThaiKhoa:false,trangThaiXoa: false};

        if(tukhoa) { filter.lowerCase = {'$regex': BoDau(tukhoa), '$options': '$i'}}
        if(danhmuc) { filter.ID_DanhMuc = ObjectId(danhmuc)}
        if(tinhthanh) { filter.ID_TinhThanh = parseInt(tinhthanh)}
        if(giamgia) { filter.tiLeSale = {'$gte': 1}}

        if(giamin && giamax) { filter.gia = {'$gte': parseInt(giamin), '$lte': parseInt(giamax)}}
        if(giamin && !giamax) { filter.gia = {'$gte': parseInt(giamin)}}
        if(!giamin && giamax) { filter.gia = {'$lte': parseInt(giamax)}}
        if(sosao) {
            if([1,2,3].includes(parseInt(sosao))){filter.soSao = {'$lte':parseInt(sosao),'$gte':parseInt(sosao)-1}}
            if(parseInt(sosao) === 4){filter.soSao = {'$lte':4.6,'$gte':4}}
            if(parseInt(sosao) === 5){filter.soSao = {'$lte':5,'$gte':4.7}}
        }

        if(idchushop) { filter.ID_ChuShop = ObjectId(idchushop)}

        req.filter = filter;
        req.page = page;
        req.pagesize = pagesize;

        let sort = {};

        if(!sapxepgia) { sort.gia = 1}
        if(sapxepgia==='esc') { sort.gia = 1}
        if(sapxepgia==='desc') { sort.gia = -1}

        if(!sapxep) { sort._id = -1}
        if(sapxep==='moinhat') { sort._id = -1}
        if(sapxep==='banchay') { sort.luotBan = -1}




        req.sort = sort;

        //console.log(filter);
       //console.log(sort);


        next();
    }

}