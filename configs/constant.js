

/*Thông tin tĩnh--------------------------------------------------------*/
const DbName = 'eCommerceDB';
const defaultImage = `https://i.imgur.com/pHD6pxE.png`;


/*Configs Nodemailer--------------------------------------------------------*/
let NodemailerTransport;
if (process.env.NODE_ENV === 'development') {
    NodemailerTransport = {
        service: 'Gmail',
        auth: {
            user: 'quangnguyen.tester@gmail.com', // generated ethereal user
            pass: 'quangdeptrai01' // generated ethereal password
        },
    };
}

if (process.env.NODE_ENV === 'production') {
    NodemailerTransport = {
        service: 'Gmail',
        auth: {
            user: 'quangnguyen.tester@gmail.com', // generated ethereal user
            pass: 'quangdeptrai01' // generated ethereal password
        },
        /*  service:'gmail',
          auth: {
              type: 'oauth2',
              user: 'quangnguyen.tester@gmail.com',
              clientId: '620674053023-r8ltuijaga28lbks3qcskcn79b6100n7.apps.googleusercontent.com',
              clientSecret: '4ro-gXD6gubtj8BzdxiNCe-Z',
              refreshToken: '1//047-P6Bv-Ja19CgYIARAAGAQSNwF-L9IrgHp3kkxt_sLpm8zvxRnhu6316LUm2YrRQ4klwCS6K8ILAYWyZ9CEg44JGULT0rFqBhQ',
              accessToken: 'ya29.a0AfH6SMAFJpu7FO0261a0XTEPmd8-JJr-1C9GPoAhMQ0pUT-Go1OZVkKMgYOamCgsPzyw1d1s8rS8IQBtM_314ynMPtTMnD6PtLEQDf5W1qEO6ASvQNNfPRUTrPwfbhEPnzwNlg0K0POmF8d8D0fM1t3RYW_YB0F-SBo',
          },*/
    };
}




/*Connect DB--------------------------------------------------------*/
let DbUrl;
if (process.env.NODE_ENV === 'development') { DbUrl = 'mongodb://localhost:27017'; } //mongodb://localhost:27017
// if(process.env.NODE_ENV === 'production'){DbUrl = 'mongodb+srv://bb4298:quangdeptrai01@cluster0-eossp.mongodb.net/test'}
if (process.env.NODE_ENV === 'production') { DbUrl = 'mongodb+srv://bb4298:quangdeptrai01@cluster0.waxmu.mongodb.net/?retryWrites=true&w=majority'; }

/*Giao thức kết nối--------------------------------------------------------*/
let protocol;
if (process.env.NODE_ENV === 'development') { protocol = 'http://'; }
if (process.env.NODE_ENV === 'production') { protocol = 'https://'; }

/*Tên miền client--------------------------------------------------------*/
let clientAddresType;
if (process.env.NODE_ENV === 'development') { clientAddresType = 'localhost:3000'; }
if (process.env.NODE_ENV === 'production') { clientAddresType = 'bestbuyui.herokuapp.com'; }


const clientLink = `${protocol}${clientAddresType}/`;

module.exports = {
    DbUrl,
    NodemailerTransport,
    DbName,
    defaultImage,
    clientLink,
};
