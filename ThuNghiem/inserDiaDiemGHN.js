const {DbUrl,DbName} = require('../configs/constant');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const {BoDau} = require('../utils/hamHoTro');
const shortId = require('short-id');
const axios = require("axios");

async function inserDiaDien(){
    let getAddress = await axios({
        method: 'post', url: 'https://console.ghn.vn/api/v1/apiv3/GetDistricts',
        data:{
            "token": "5eb17ccfd27817721050534a"
        }
    });
    const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
    await client.connect();
    const db = client.db(DbName);
    const colBaiViet = db.collection('DiaDiem');
    let result = await colBaiViet.insertMany(getAddress.data.data);
    client.close();
    console.log(getAddress.data.data);
}

async function delQuanDacBiet(){
    const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
    await client.connect();
    const db = client.db(DbName);
    const colBaiViet = db.collection('DiaDiem');
    let result = await colBaiViet.deleteMany({DistrictName:{'$regex': 'Quận Đặc Biệt', '$options': '$i'}});
    let result1 = await colBaiViet.deleteMany({DistrictName:{'$regex': 'Quận Vật Tư', '$options': '$i'}});
    client.close();
    console.log('xoa thành công');
}

async function showDanhSachQuanHuyen(){
    const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
    await client.connect();
    const db = client.db(DbName);
    const colDiaDiem = db.collection('DiaDiem');
    let result = await colDiaDiem.find().toArray();
    let result1 = await colDiaDiem.find({DistrictName:{'$regex': 'Quận Đặc Biệt', '$options': '$i'}}).toArray();
    let result2 = await colDiaDiem.find({DistrictName:{'$regex': 'Quận Vật Tư', '$options': '$i'}}).toArray();
    client.close();
    console.log(result);
}

//inserDiaDien();
//delQuanDacBiet();
//showDanhSachQuanHuyen();


const LayDanhSachQuanHuyen = async function(req, res,next){
    const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
    try {

        await client.connect();
        const db = client.db(DbName);
        const colDiaDiem = db.collection('TinhThanh');
        let result = await colDiaDiem.find().toArray();
        client.close();

        //const unique = [...new Map(getAddress.data.data.map(item => [item['ProvinceID'], item])).values()];

        console.log(result)
        console.log(result.length)
    } catch (err) {
        console.log(err);
    }
}
LayDanhSachQuanHuyen();