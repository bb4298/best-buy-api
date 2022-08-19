module.exports = {
    Validate_ChuShop_Khi_Them: function (req, res, next) {
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
    },

    Validate_ChuShop_Khi_Sua: function (req, res, next) {
        try {
            let phiBanHang = req.body.phiBanHang;
            if (!/^[1-9][0-9]?$|^100$/.test(phiBanHang)) {
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