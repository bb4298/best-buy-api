const MongoClient = require('mongodb').MongoClient;
const DbUrl = "mongodb+srv://bb4298:quangdeptrai01@cluster0-eossp.gcp.mongodb.net/test?retryWrites=true&w=majority";
const { DbName} = require('../configs/constant');
/*
client.connect(err => {
    const collection = client.db("test").collection("devices");
    // perform actions on the collection object
    client.close();
});*/
async function themDM() {
    const client = new MongoClient(DbUrl, {useNewUrlParser: true,useUnifiedTopology: true});
    try {
        await client.connect();
        const db = client.db(DbName);
        const colDanhMuc = db.collection('SanPham');
        //Kiểm tra tên danh mục đã tồn tại hay chưa

        let danhmuc = {
            tenDanhMuc: 'req.body.tendanhmuc',
            lowerCase: 'BoDau(req.body.tendanhmuc)',
            anh: 'req.body.anh',
            trangThaiKhoa: false
        }
        let result = await colDanhMuc.insertOne(danhmuc);
        console.log(result);
        client.close();
    } catch (err) {
        console.log(err);
    }
}

themDM();