module.exports = {
    Validate_NoiDungTinh_Khi_Sua: function (req, res, next) {
        try {
            let {tenBrand,slogan,ghiChu} = req.body.thongTinTinh;
            if (!tenBrand || !slogan || !ghiChu) {
                res.status(200).json({
                    status: 'fail',
                    message: 'Thông tin không được trống !'
                }); return;
            }
            next();
        } catch (e) {
            res.status(200).json({
                status: "fail",
                message: e.toString()
            });
        }
    },
    Validate_TenMenuFoooter_Khi_Sua: function (req, res, next) {
        try {
            let {tenmenu} = req.body;
            if (!tenmenu) {
                res.status(200).json({
                    status: 'fail',
                    message: 'Thông tin không được trống !'
                }); return;
            }
            next();
        } catch (e) {
            res.status(200).json({
                status: "fail",
                message: e.toString()
            });
        }
    },
    Validate_PhiBanHang_Khi_Sua: function (req, res, next) {
        try {
            let phiBanHangMacDinh = req.body.phiBanHangMacDinh;
            if (!/^[1-9][0-9]?$|^100$/.test(phiBanHangMacDinh)) {
                res.status(200).json({
                    status: 'fail',
                    message: 'Phí bán hàng phải là số, thuộc [1-100] !'
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