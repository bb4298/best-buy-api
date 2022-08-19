const {DbUrl,DbName} = require('../../configs/constant');
const MongoClient = require('mongodb').MongoClient;
module.exports = {

    LaySanPhamTheoFilter_TrangChu: async function (req, res, next) {
        const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
        const {filter,page, pagesize,sort }= req;
        //console.log(  JSON.stringify({filter,page, pagesize,sort },null,2));
        try {
            await client.connect();
            const db = client.db(DbName);
            const colSanPham = db.collection('SanPham');
            let count = await colSanPham.find(filter).toArray();
            let soTrang = Math.ceil(parseInt(count.length) / pagesize);
            let arrSanPham = await colSanPham.find(filter).sort(sort).limit(parseInt(pagesize)).skip(parseInt(pagesize) * parseInt(page)).toArray();
            //console.log(arrSanPham)
            client.close();
            res.status(200).json({
                status: "ok",
                data: arrSanPham,
                soTrang: soTrang,
                count:count.length
            });
        } catch (e) {
            console.log(e);
            res.status(200).json({
                status: "fail",
                message: e.toString()
            });
        }
    },

}