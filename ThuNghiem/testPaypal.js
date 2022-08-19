//Chạy ngon
const axios = require('axios');
const qs = require('qs');
const getToken = async()=>{
    let res =  await axios({
        method: 'post',
        headers: {
            'content-type': 'application/x-www-form-urlencoded',
            'Access-Control-Allow-Credentials':true
        },
        url: 'https://api.sandbox.paypal.com/v1/oauth2/token',
        auth:{
            username: "AV7XdAMCJDmQ6iFbIltAi3d74th3fJ6ll6WRdA3Os32KqPBr61BO3THxCpm1ZyeJFNcJnQmBIAZhW6rW",
            password: "EG_XMiUeLWbpyGUZ2aALooCev9jYYZjlFnkz-DbMYOq7RiZbaBtqbatbwm7XEntrnssHMzQIj6S6ePqj"
        },
        data: qs.stringify({grant_type:'client_credentials'})
    });
    console.log(res.data);
}

//getToken();

const sendMoney = async()=>{
    let resGuiTienChuShop = await axios({
        method: 'post',
        headers: { Authorization: `Bearer A21AAFfQ_p9pgM6J_UxmiTWPo3I7zZ_7B82gkknlgG3yKh9zzGEUOPFHeepw9Mpk5po_dOkhWEFi7EKKAMm01OXWmPvUpy2aw`},
        url: 'https://api.sandbox.paypal.com/v1/payments/payouts',
        data: {
            "sender_batch_header": {
                "sender_batch_id": "Payouts_2018_52042560074654",
                "email_subject": "You have a payout!",
                "email_message": "You have received a payout! Thanks for using our service!"
            },
            "items": [
                {
                    "recipient_type": "EMAIL",
                    "amount": {
                        "value": "125.00",
                        "currency": "USD"
                    },
                    "note": "Thanks for your patronage!",
                    "sender_item_id": "201403140001",
                    "receiver": "userbestbuy124@gmail.com",
                    "alternate_notification_method": {
                        "phone": {
                            "country_code": "91",
                            "national_number": "9999988888"
                        }
                    },
                }
            ]
        }
    });
    console.log(resGuiTienChuShop)
}
sendMoney();