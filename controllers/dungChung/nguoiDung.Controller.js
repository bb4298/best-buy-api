const jwt = require('jsonwebtoken');
const {DbUrl, DbName} = require('../../configs/constant');
const MongoClient = require('mongodb').MongoClient;
const bcrypt = require('bcrypt');
const ObjectId = require('mongodb').ObjectId;
const {BoDau} = require('../../utils/hamHoTro');
module.exports = {

    LayThongTinNguoiDung: async function (req, res, next) {
        const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
        try {
            var token = req.header('token');
            // console.log(token);
            let tokenResult = await jwt.verify(token, process.env.SECRET_KEY);
            await client.connect();
            const db = client.db(DbName);
            const colNguoiDung = db.collection('NguoiDung');
            //Tìm user
            let resultUser = await colNguoiDung.find({_id: ObjectId(tokenResult.payload.userId)}).next();
            client.close();
            if (resultUser === null) {
                res.status(200).json({
                    status: 'fail',
                    message: 'Tài khoản không tồn tại !'
                }); return;
            }
            res.status(200).json({
                status: 'ok',
                data: resultUser
            });
        } catch (e) {
            res.status(200).json({
                status: "fail",
                message: e.toString()
            });
        }
    },

    SuaThongTinNguoiDung: async function (req, res, next) {
        const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
        try {
            const nguoiDungId = req.nguoiDungId;
            const vaiTro = req.vaiTro;;

            let inforNguoiDung = req.body;
            await client.connect();
            const db = client.db(DbName);
            const colNguoiDung = db.collection('NguoiDung');
            //Tìm user
            let r = await colNguoiDung.updateOne({_id: ObjectId(nguoiDungId)}, {
                $set: {
                    sdt: inforNguoiDung.sdt,
                    hoTen: inforNguoiDung.hoTen,
                    lowerCase: BoDau(inforNguoiDung.hoTen),
                    ngaySinh: new Date(inforNguoiDung.ngaySinh),
                    gioiTinh: inforNguoiDung.gioiTinh,
                    anh: inforNguoiDung.anh
                }
            });
            client.close();
            res.status(200).json({
                status: 'ok',
                message: 'Thay đổi thành công !'
            });

            if(vaiTro === 2){
                capNhatDonHangSauKhiCapNhatThongTin(nguoiDungId,inforNguoiDung,0);
            }
        } catch (e) {
            res.status(200).json({
                status: "fail",
                message: e.toString()
            });
        }
    },

    SuaEmailNguoiDung: async function (req, res, next) {
        const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
        try {
            const nguoiDungId = req.nguoiDungId;
            const vaiTro = req.vaiTro;;
            let inforNguoiDung = req.body;
            await client.connect();
            const db = client.db(DbName);
            const colNguoiDung = db.collection('NguoiDung');
            //Sửa email người dùng
            let r = await colNguoiDung.updateOne({_id: ObjectId(nguoiDungId)}, {
                $set: {
                    email: inforNguoiDung.email,
                    xacThucEmail: false
                }
            });
            client.close();
            res.status(200).json({
                status: 'ok',
                message: 'Thay đổi thành công !'
            });

            if(vaiTro === 2){
                capNhatDonHangSauKhiCapNhatThongTin(nguoiDungId,inforNguoiDung,1);
            }
        } catch (e) {
            res.status(200).json({
                status: "fail",
                message: e.toString()
            });
        }
    },

    DoiMatKhau: async function (req, res, next) {
        const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
        let token = req.header('token');
        try {
            let tokenResult = await jwt.verify(token, process.env.SECRET_KEY);
            //console.log(tokenResult.payload.userId);
            //console.log(req.body.matkhau);
            const userId = ObjectId(tokenResult.payload.userId);
            let salt = bcrypt.genSaltSync(5);
            let hash = bcrypt.hashSync(req.body.matkhau, salt);
            await client.connect();
            const db = client.db(DbName);
            const colNguoiDung = db.collection('NguoiDung');

            //Đổi mật khẩu
            let r = await colNguoiDung.updateOne({_id: userId}, {
                $set: {matKhau: hash}
            });
            res.status(200).json({
                status: 'ok',
                message: 'Đổi mật khẩu thành công !'
            });
        } catch (e) {
            console.log(e);
            res.status(400).json({
                status: "fail",
                message:e.toString()
            });
        }
    },

    KhoaNguoiDung: async function (req, res) {
        const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
        try {
            await client.connect();
            const db = client.db(DbName);
            const colNguoiDung = db.collection('NguoiDung');

            const id = ObjectId(req.body.id);
            const type = req.body.type;
            // Lock hoặc mở khóa người dùng(chủ shop hoặc kiểm duyệt viên)
            let lockResult = await colNguoiDung.updateOne({_id: id}, {$set: {trangThaiKhoa: type}});
            client.close();
            res.status(200).json({
                status: "ok",
                message: `${type ? 'Khóa' : 'Mở khóa'} thành công !`
            });
        } catch (e) {
            res.status(200).json({
                status: "fail",
                message: e.toString()
            });
        }
    },

}

const capNhatDonHangSauKhiCapNhatThongTin = async (nguoiDungId,inforNguoiDung,type) => {  //'0':Cập nhật thông tin;  '1':Cập nhật email
    const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
    try {
        await client.connect();
        const db = client.db(DbName);
        const colNguoiDung = db.collection('DonHang');
        //Cập nhật thông tin
        if(type===0){
            let r = await colNguoiDung.updateMany({ID_KhachHang: ObjectId(nguoiDungId)}, {
                $set: {
                    hoTen: inforNguoiDung.hoTen,
                    lowerCase:  BoDau(inforNguoiDung.hoTen),
                    sdt:inforNguoiDung.sdt,
                    // email: inforNguoiDung.email,

                }
            });      
        }
        //Cập nhật email
        if(type===1){
            let r = await colNguoiDung.updateMany({ID_KhachHang: ObjectId(nguoiDungId)}, {
                $set: {
                    email: inforNguoiDung.email,
                }
            });
        }
        client.close();

    } catch (e) {
        console.log(e);
    }
}
