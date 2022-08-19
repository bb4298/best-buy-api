var express = require('express');
var router = express.Router();
const {diaDiemController} = require('../controllers');
/* GET home page. */
router.get('/', function(req, res, next) {res.send('Wellcom to Bestbuy api');});

/*Route lấy thông tin chung*/

/*Lấy thông tin tỉnh thành-------------------------------------------------------------*/
/*// Lấy danh sách tỉnh/thành phố
router.get('/laytinhthanhhihi',diaDiemController.LayAllTinhThanh);

// Lấy danh sách quận huyện của thành phố
router.get('/layquanhuyen',diaDiemController.LayDanhSachQuanHuyen);

// Lấy danh sách phường/xã của quận huyện
router.get('/layphuongxa',diaDiemController.LayDanhSachPhuongXa);*/

module.exports = router;
