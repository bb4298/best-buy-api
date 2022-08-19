module.exports = {
    Validate_PhuongThucThanhToan: function (req, res, next) {
        let {ppThanhToan} = req.body;
        try {
            let locPhuongThucKoCoGiaTri = ppThanhToan.filter((item)=>{
                return  !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(item.email)
            })
           if(locPhuongThucKoCoGiaTri.length>0){
               res.status(200).json({
                   status: 'fail',
                   message: 'Thông tin không được trống và phải hợp lệ !'
               }); return;
           }
            next();
        } catch (e) {
            res.status(200).json({
                status: "fail",
                message: e.toString()
            });
        }
    }
}