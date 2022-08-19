const jwt = require("jsonwebtoken");



async function a(){
    const resultToken = await jwt.verify('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXlsb2FkIjp7InVzZXJJZCI6IjVlNzYyMTVhYmQ3NDcyMzU3NGJiYjgxNCIsInZhaVRybyI6Mn0sImlhdCI6MTU4NzkwNDQ0NywiZXhwIjoxNTg4MjcwNDQ3fQ.FuO82Ej_n4W7T7ltS5ynjcdGHtq3C69GjokB9DRr8fE', 'quangdeptrai011');
    console.log(resultToken)
}
a();