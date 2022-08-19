const {DbUrl,DbName} = require('../../configs/constant');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const ids = require('short-id');
module.exports = {
    //Thao tác CRUD thông tin tĩnh của admin
    LayThongTinTinh: async function (req, res, next) {
        const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
        try {
            await client.connect();
            const db = client.db(DbName);
            const colCauHinh = db.collection('CauHinh');
            let resThongTinTinh = await colCauHinh.find({type:0}).next();
            let resLienKet = await colCauHinh.find({type:{'$ne':0}}).toArray();

            client.close();
            if (resThongTinTinh === null) {
                res.status(200).json({
                    status: 'fail',
                    message: 'Không có dữ liệu !'
                });return;
            }
            res.status(200).json({
                status: 'ok',
                dataThongTinTinh:resThongTinTinh,
                dataLienKet:resLienKet
            });
        } catch (e) {
            res.status(200).json({
                status: "fail",
                message: e.toString()
            });
        }
    },

    SuaThongTinTinh: async function (req, res, next) {
        const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
        try {
            const {thongTinTinh} = req.body;
            await client.connect();
            const db = client.db(DbName);
            const colCauHinh = db.collection('CauHinh');
            let resThongTinTinh = await colCauHinh.updateOne({type:0},{
                $set:{
                    tenBrand:thongTinTinh.tenBrand,
                    slogan:thongTinTinh.slogan,
                    ghiChu:thongTinTinh.ghiChu
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

    SuaTenMenu: async function (req, res, next) {
        const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
        try {
            const {idfooter,tenmenu} = req.body;
            await client.connect();
            const db = client.db(DbName);
            const colCauHinh = db.collection('CauHinh');
            let resThongTinTinh = await colCauHinh.updateOne({_id:ObjectId(idfooter)},{
                $set:{
                  tenMenu:tenmenu
                }
            });
            client.close();
            res.status(200).json({
                status: 'ok',
                message:'Đổi tên menu thành công !'
            });
        } catch (e) {
            res.status(200).json({
                status: "fail",
                message: e.toString()
            });
        }
    },

    ThemLienKet: async function (req, res, next) {
        const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
        try {
            let {idfooter,lienket} = req.body;
            lienket.id = ids.generate();
            await client.connect();
            const db = client.db(DbName);
            const colThongBao = db.collection('CauHinh');

            let result = await colThongBao.updateOne({_id:ObjectId(idfooter)},{
                $push:{lienKet:lienket}
            },{upsert:true});
            client.close();
            res.status(200).json({
                status: 'ok',
                message: 'Thêm thành công !'
            });
        } catch (err) {
            res.status(200).json({
                status: "fail",
                message: err.toString()
            });
        }
    },

    SuaLienKet: async function (req, res, next) {
        const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
        try {
            let {idfooter,lienket} = req.body;
            /*console.log(idfooter)
            console.log(JSON.stringify(lienket))*/
            await client.connect();
            const db = client.db(DbName);
            const colThongBao = db.collection('CauHinh');
           /* let r = await colThongBao.find({_id:ObjectId(idfooter),'lienKet.id':lienket.id}).next();
            console.log(r)*/
            let result = await colThongBao.updateOne({_id:ObjectId(idfooter),'lienKet.id':lienket.id},{
                $set:{
                    'lienKet.$':lienket
                }
            });
            client.close();
            res.status(200).json({
                status: 'ok',
                message: 'Sửa thành công !'
            });
        } catch (err) {
            res.status(200).json({
                status: "fail",
                message: err.toString()
            });
        }
    },

    XoaLienKet: async function (req, res, next) {
        const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
        try {
            let {idfooter,idlienket} = req.body;
           /* console.log(idfooter)
           console.log(JSON.stringify(idlienket))*/
            await client.connect();
            const db = client.db(DbName);
            const colThongBao = db.collection('CauHinh');
            let r = await colThongBao.find({_id:ObjectId(idfooter),'lienKet.id':idlienket}).next();
            console.log(r)
            let result = await colThongBao.updateOne({_id:ObjectId(idfooter),'lienKet.id':idlienket},{
                $pull: { lienKet:{id:idlienket}   }
            });
            client.close();
            res.status(200).json({
                status: 'ok',
                message: 'Xóa thành công !'
            });
        } catch (err) {
            res.status(200).json({
                status: "fail",
                message: err.toString()
            });
        }
    },



}