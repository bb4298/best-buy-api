const {DbUrl,DbName} = require('../configs/constant');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;

async function findChat(){
    const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
    try {
        await client.connect();
        const db = client.db(DbName);
        const colChat = db.collection('Chat');
        // let resChat = await colChat.find({tags:[ObjectId('5ed93c78fcd6a8147c7c856a'),ObjectId('5ed93c73fcd6a8147c7c8569')]}).next();
        let resChat = await colChat.find({"idNguoiThamGia":{"$all":[ObjectId('5ecf8ae916d3cb91f4f226c7')]}}).toArray();
        client.close();
        console.log(resChat);
    } catch (err) {

    }
}

findChat();
