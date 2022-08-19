const {DbUrl, DbName} = require('../../configs/constant');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const {BoDau} = require('../../utils/hamHoTro');
const jwt = require("jsonwebtoken");

module.exports = {
    LayDanhSachNguoiDaChat: async function(req, res,next){
        const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
        try {
            const nguoiDungId = req.nguoiDungId;
            //console.log(nguoiDungId);
            await client.connect();
            const db = client.db(DbName);
            const colChat = db.collection('Chat');
            let resChats = await colChat.find({"idNguoiThamGia":{"$all":[ObjectId(nguoiDungId)]}}).sort({updateAt:-1}).toArray();
            client.close();
            const dsNguoiDaChat = resChats.map(item=>{
                console.log(item.infoUser1.id)
                console.log(nguoiDungId)
                return{
                    avatar: item.infoUser1.id == nguoiDungId ? item.infoUser2.anh : item.infoUser1.anh,
                    title: item.infoUser1.id == nguoiDungId ? item.infoUser2.tenDangNhap : item.infoUser1.tenDangNhap,
                    date: item.updateAt,
                    unread: item.daDoc,
                    idChat: item._id
                }
            })
            res.status(200).json({
                status:'ok',
                data:dsNguoiDaChat,
            });
        } catch (err) {
            res.status(200).json({
                status: "fail",
                message: err.toString()
            });
        }
    },

    LayTinNhan: async function(req, res,next){
        const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
        try {
            const nguoiDungId = req.nguoiDungId;
            const idChat = ObjectId(req.body.idChat);
            await client.connect();
            const db = client.db(DbName);
            const colTinNhan = db.collection('TinNhan');
            const colChat = db.collection('Chat');
            let resTinNhans = await colTinNhan.find({ID_Chat:idChat}).toArray();
            let updateChat = await colChat.updateOne({_id:ObjectId(idChat)},{
                $set:{
                    daDoc:0,
                    updateAt:new Date()
                }
            });
            client.close();
            const dsNguoiDaChat = resTinNhans.map(item=>{
                return{
                    position: item.ID_NguoiGui ==  nguoiDungId ?'right':'left',
                    type: 'text',
                    text: item.noiDung,
                    date: item.thoiGian,
                }
            })
            res.status(200).json({
                status:'ok',
                data:dsNguoiDaChat,
            });
        } catch (err) {
            res.status(200).json({
                status: "fail",
                message: err.toString()
            });
        }
    },
    TaoCuocTroChuyen: async function(req, res,next){
        const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
        try {
            const nguoiDungId = req.nguoiDungId;
            let {idDoiTuong,type }= req.body;

            await client.connect();
            const db = client.db(DbName);
            const colNguoiDung = db.collection('NguoiDung');
            const colChat = db.collection('Chat');

            //Lấy id khi người dùng nhập tên tài khoản muốn chat tại chat box
            if(type === 'byTenDangNhap'){
                const tenDangNhap = req.tenDangNhap;
                if(tenDangNhap.trim() === idDoiTuong){
                    res.status(200).json({
                        status:'fail',
                        message:'Bạn không thể nhắn tin với chính mình !'
                    }); return;
                }
                const layIdByTenDangNhap = await colNguoiDung.find({tenDangNhap:idDoiTuong}).next();
                if(layIdByTenDangNhap === null){
                    res.status(200).json({
                        status:'fail',
                        message:'Người dùng không tồn tại !'
                    }); return;
                }
                idDoiTuong = ObjectId(layIdByTenDangNhap._id);
            }

            //Kiểm tra xem đã có cuộc trò chuyện chưa
            //console.log(nguoiDungId, ' ',idDoiTuong);
            let resChats = await colChat.find({"idNguoiThamGia":{"$all":[ObjectId(nguoiDungId),ObjectId(idDoiTuong)]}}).next();
            if(resChats !== null){
                res.status(200).json({
                    status:'tontai',
                    idChat:resChats._id
                });
                return;
            }
            const resUser1 = await colNguoiDung.find({_id:ObjectId(nguoiDungId)}).next();
            const resUser2 = await colNguoiDung.find({_id:ObjectId(idDoiTuong)}).next();
            const newId = ObjectId();
            let themTroChuyen = await colChat.insertOne({
                _id:newId,
                infoUser1:{
                    id:resUser1._id,
                    tenDangNhap:resUser1.tenDangNhap,
                    anh:resUser1.anh
                },
                infoUser2:{
                    id:resUser2._id,
                    tenDangNhap:resUser2.tenDangNhap,
                    anh:resUser2.anh
                },
                updateAt:new Date(),
                daDoc:0,
                idNguoiThamGia:[ObjectId(nguoiDungId),ObjectId(idDoiTuong)]
            });
            res.status(200).json({
                status:'chuatontai',
                idChat:newId
            });
            client.close();
        } catch (e) {
            console.log(e)
            res.status(200).json({
                status: "fail",
                message: e.toString()
            });
        }
    },
}

