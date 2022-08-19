# eCommerceProject
KLTN Project
************************************************************************************
Hướng dẫn cài đặt:  
Để chạy project, vui lòng cài đặt Mongodb, Nodejs  
Sử dụng Mongorestore để restore lại database  
Vào từng folder Api hoặc Client chạy riêng từng phần(npm run dev)  
Npm i để cài đặt thư viện trước khi chạy  

************************************************************************************  
Domain server chính===========================================  
Client: https://bestbuyui.herokuapp.com/  
Api: https://bestbuyapi98.herokuapp.com/  
Connection Mongodb: mongodb+srv://bb4298:<password>@cluster0.waxmu.mongodb.net/?retryWrites=true&w=majority  

Danh sách tài khoản===========================================  
* Admin  
	- TK:admin1  
* Kiểm duyệt viên  
	- TK:kiemduyet1  
* Chủ shop  
	- TK:chushop1  
	- TK:chushop2  
	- TK:chushop3  
	- TK:chushop4  
* Khách hàng  
	- TK:khachhang1  
	- TK:khachhang2  
	- TK:khachhang3  

Tài khoản hệ thống : bestbuyadmin@gmail.com  
Tài khoản chủ shop : bestbuychushop1@gmail.com  
Tài khoản người dùng : bestbuyuser1@gmail.com  
Pass: quang123  

Paypal sandbox===========================================  
url: https://www.sandbox.paypal.com/  


************************************************************************************  
* Check thời gian còn lại của dyno heroku  
heroku ps -a bestbuyclient  
* Restart heroku:  
heroku restart -a app_name  