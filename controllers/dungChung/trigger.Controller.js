const {DbUrl, DbName} = require('../../configs/constant');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const {BoDau} = require('../../utils/hamHoTro');
const {mapAsync,filterAsync} = require('lodasync');
/*
module.exports.CapNhatLuotBanSauKhiChuyenTrangThai = async function (listId) {
    console.log(listId);
    const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
    try {
        await client.connect();
        const db = client.db(DbName);
        const colSanPham = db.collection('SanPham');
        const colDonHang = db.collection('DonHang');
      /!*  const updateGiaSP = await mapAsync(async item => {
        const result = await colSanPham.updateOne({_id: ObjectId(item.ID_SanPham)}, {
            $inc: {
                luotBan: 1
            }
        });
            console.log('da update');
        }, arrCapNhat);
        client.close();*!/

        //console.log('bat dau lap');
      //  let danhSachPhanLoai = [];
        let lapDonHang = await mapAsync (async(item)=>{
            const resDonHang = await colDonHang.find({_id:ObjectId(item)}).next();
            const lapChiTietDonHang = await mapAsync(async(item) =>{
                const result = await colSanPham.updateOne({_id: ObjectId(item.ID_SanPham)}, {
                    $inc: {
                        luotBan: item.soLuong
                    }
                });
            },resDonHang.chiTietDonHang);
        },listId);

      /!*  let capNhatSoLuongSanPham = await mapAsync(async(item)=>{
            const result = await colPhanLoai.updateOne({_id: ObjectId(item.ID_PhanLoai)}, {
                $inc: {
                    soLuong: item.soLuong
                }
            });
        },danhSachPhanLoai);*!/

    } catch (e) {
        console.log(e);
    }
    client.close();
};*/
module.exports ={
    TruDiemXepHangSanPham: async function () {
        console.log('Bắt đầu trừ điểm sản phẩm');
        const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
        try {
            await client.connect();
            const db = client.db(DbName);
            const colHD = db.collection('SanPham');
            let truDiemXepHang = await colHD.updateMany({},{
                $inc:{
                    diemXepHang:-2
                }
            });
            client.close();
        } catch (e) {
            console.log(e);
        }
    }
}