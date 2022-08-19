const ObjectId = require('mongodb').ObjectId;
const {BoDau} = require('../../utils/hamHoTro');
module.exports = {
    ValidateFilterKhiTimKiem_SP_KiemDuyet(req, res, next){

        let {loaisp,searchtype,tukhoa,danhmuc,page,pagesize} = req.query;
        if(!page){page = 0} if(parseInt(page)<0){page = 0}
        if(!pagesize){pagesize = 10}  if(parseInt(pagesize)<0){pagesize = 10}
        let filter = {trangThaiXoa: false};
        //console.log(loaisp)

        if(![0,1,2].includes(parseInt(loaisp))){filter.trangThaiDuyet = false}
        if(parseInt(loaisp) === 0){filter.trangThaiDuyet = false}
        if(parseInt(loaisp) === 1){filter.trangThaiDuyet = true}
        if(parseInt(loaisp) === 2){filter.trangThaiBaoCao = true}

        if(![0,1,2].includes(parseInt(searchtype)) && tukhoa){filter.lowerCase =  {'$regex': BoDau(tukhoa), '$options': '$i'}}
        if(parseInt(searchtype) === 0 && tukhoa){filter.lowerCase =  {'$regex': BoDau(tukhoa), '$options': '$i'}}
        if(parseInt(searchtype) === 1 && tukhoa){filter.id = {'$regex': BoDau(tukhoa), '$options': '$i'}}
        if(parseInt(searchtype) === 2 && tukhoa){filter.thuongHieu = {'$regex': BoDau(tukhoa), '$options': '$i'}}

        if(danhmuc) { filter.ID_DanhMuc = ObjectId(danhmuc)}


        req.filter = filter;
        req.page = page;
        req.pagesize = pagesize;
        console.log(filter);
        next();
    },

}