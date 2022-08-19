const {DbUrl, DbName} = require('../../configs/constant');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const {mapAsync} = require('lodasync');
module.exports = {
    //Thao tác CRUD danh mục của admin
    LayDataGioHang: async function (req, res, next) {
        const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
        try {
            const khachHangId = ObjectId(req.khachHangId);
            await client.connect();
            const db = client.db(DbName);
            const colNguoiDung = db.collection('NguoiDung');
            const colSanPham = db.collection('SanPham');
            const colPhanLoai = db.collection('PhanLoai');
            let resKhachHang = await colNguoiDung.find({_id: khachHangId}).next();
            let {gioHang} = resKhachHang;
            //Tạo danh sách giỏ hàng(chưa lọc thông tin shop không có hàng)
            let danhSachSanPhamHetHang = [];
            let gioHangChuaLocShop = await mapAsync(async (item) => {
                //Lấy thông tin shop
                let thongTinShop = await colNguoiDung.find({_id: ObjectId(item.ID_ChuShop)}).next();
                //Lấy thông tin từng sản phẩm(kiểm tra số lượng sản phẩm có đủ hay không và join thông tin từ collection khác )
                let sanPhamMoiDaLocSoLuong = await mapAsync(async (subItem) => {
                   // console.log('subItem.ID_SanPham')
                  //  console.log(subItem.ID_SanPham)
                    let thongTinSanPham = await colSanPham.find({_id: ObjectId(subItem.ID_SanPham)}).next();
                    let thongTinPhanLoai = await colPhanLoai.find({_id: ObjectId(subItem.ID_PhanLoai)}).next();
                    if (thongTinPhanLoai.soLuong !== 0) {
                        if (subItem.soLuong > thongTinPhanLoai.soLuong) {
                            return {
                                ...subItem,
                                soLuong: thongTinPhanLoai.soLuong,
                                infoSP: thongTinSanPham,
                                infoPL: thongTinPhanLoai,
                            }
                        }
                        return {
                            ...subItem,
                            infoSP: thongTinSanPham,
                            infoPL: thongTinPhanLoai,
                        }
                    }
                    danhSachSanPhamHetHang.push(subItem.ID_SanPham.toString());
                }, item.danhSach);
                //Sau khi lọc số lượng, sản phẩm nào ko đủ số lượng sẽ bị undefind, remove các item undefind
                let sanPhamDaLocUndefind = sanPhamMoiDaLocSoLuong.filter(item => item);

                //Trả về danh sách giỏ hàng sau khi lọc
                return {
                    ...item,
                    infoShop: thongTinShop,
                    danhSach: sanPhamDaLocUndefind
                }
            }, gioHang);

            //Nếu sau khi lọc trong shop không có hàng thì xóa luôn giỏ hàng của shop(tại collection NguoiDung)
            await mapAsync(async (item) => {
                if (item.danhSach.length === 0) {
                    let deleteShop = await colNguoiDung.find({_id: ObjectId(khachHangId)}).next();
                    const gioHangSauKhiLocShop = deleteShop.gioHang.filter(item => item.ID_ChuShop != item.ID_ChuShop);
                    let updateGioHang = await colNguoiDung.updateOne({_id: ObjectId(khachHangId)}, {
                        $set: {
                            gioHang: gioHangSauKhiLocShop
                        }
                    });
                }
            }, gioHangChuaLocShop);
            const gioHangSauKhiLocShopKhongCoSanPham = gioHangChuaLocShop.filter(item => item.danhSach.length > 0);
          //  console.log(danhSachSanPhamHetHang);
            XoaSanPhamHetHangTrongGioHang(danhSachSanPhamHetHang,khachHangId);
            client.close();
            res.status(200).json({
                status: "ok",
                data: gioHangSauKhiLocShopKhongCoSanPham,
                reload: danhSachSanPhamHetHang.length > 0
            });
        } catch (e) {
            res.status(200).json({
                status: "fail",
                message: e.toString()
            });
        }
    },


    Them_CapNhatSanPhamVaoGioHang: async function (req, res, next) {
        const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
        try {
            const khachHangId = ObjectId(req.khachHangId);
            const {idSanPham, idPhanLoai, idChuShop, soLuong} = req.body;

            //console.log(JSON.stringify(req.body));
            await client.connect();
            const db = client.db(DbName);
            const colNguoiDung = db.collection('NguoiDung');
            const colPhanLoai = db.collection('PhanLoai');
            if (soLuong === null) {
                res.status(200).json({
                    status: 'fail',
                    message: 'Số lượng không hợp lệ !'
                });
                return;
            }
            //Kiểm tra xem khách hàng có tồn tại không
            let resKhachHang = await colNguoiDung.find({_id: khachHangId}).next();
            if (resKhachHang === null) {
                res.status(200).json({
                    status: 'fail',
                    message: 'Khách hàng không tồn tại !'
                });
                return;
            }

            let resPhanLoai = await colPhanLoai.find({_id: ObjectId(idPhanLoai)}).next();
            if (soLuong > resPhanLoai.soLuong) {
                res.status(200).json({
                    status: 'fail',
                    message: 'Số lượng sản phẩm không đủ !'
                });
                return;
            }

            const gioHang = resKhachHang.gioHang;
            let gioHangMoi;
            //console.log(resKhachHang.gioHang)

            //Kiểm tra xem shop đã có trỏng giỏ hàng chưa
            const kiemTraTonTaiShop = gioHang.filter((shopItem) => shopItem.ID_ChuShop.toString() === idChuShop.toString());     //So sánh 2 dấu mới đc, ko hiểu tại sao lun :))))
            //console.log(JSON.stringify(kiemTraTonTaiShop));
            //console.log(JSON.stringify(kiemTraTonTaiShop));
            if (kiemTraTonTaiShop.length > 0) {                 //Shop đã tồn tại trong giỏ hàng
                gioHangMoi = gioHang.map((item) => {
                    if (item.ID_ChuShop.toString() === idChuShop.toString()) {         //Tìm kiếm shop trong vòng lặp
                        //console.log('con meo')
                        let sanPhams = item.danhSach;

                        //Kiểm tra sản phẩm đã tồn tại  trong giỏ chưa
                        const kiemTraTonTaiSP = item.danhSach.filter((subItem) => subItem.ID_SanPham.toString() === idSanPham.toString() && subItem.ID_PhanLoai.toString() === idPhanLoai.toString());
                        //console.log(kiemTraTonTaiSP.length);
                        if (kiemTraTonTaiSP.length === 0) {        //Sản phẩm chưa tồn tại trong giỏ, tạo sản phẩm mới
                            sanPhams.push({
                                ID_SanPham: ObjectId(idSanPham),
                                ID_PhanLoai: ObjectId(idPhanLoai),
                                soLuong: Math.abs(soLuong) //Luôn trả về số dương
                            })

                        }
                        if (kiemTraTonTaiSP.length > 0) {         //Sản phẩm đã tồn tại trong giỏ, cập nhật lại sản phẩm
                            sanPhams = sanPhams.map((spitem) => {
                                if (spitem.ID_SanPham.toString() === idSanPham.toString() && spitem.ID_PhanLoai.toString() === idPhanLoai.toString()) {
                                    return {
                                        ID_SanPham: ObjectId(spitem.ID_SanPham),
                                        ID_PhanLoai: ObjectId(spitem.ID_PhanLoai),
                                        soLuong: Math.abs(soLuong) //Luôn trả về số dương
                                    }
                                }
                                return spitem;
                            })
                        }
                        return {
                            ID_ChuShop: ObjectId(item.ID_ChuShop),
                            danhSach: sanPhams
                        }
                    }
                    if (item.ID_ChuShop.toString() !== idChuShop.toString()) {          // Không đúng kiểu dữ liệu, dùng shalow compare
                        //console.log('12345')
                        return {
                            ID_ChuShop: ObjectId(item.ID_ChuShop),
                            ...item
                        };
                    }
                });

            }
            if (kiemTraTonTaiShop.length === 0) {                 //Shop chưa tồn tại trong giỏ hàng, thêm shop và thêm sản phẩm
                gioHangMoi = gioHang;
                gioHangMoi.push({
                    ID_ChuShop: ObjectId(idChuShop),
                    danhSach: [
                        {
                            ID_SanPham: ObjectId(idSanPham),
                            ID_PhanLoai: ObjectId(idPhanLoai),
                            soLuong: soLuong
                        }
                    ]
                })
            }

            let resUpdatGioHang = await colNguoiDung.updateOne({_id: khachHangId}, {
                $set: {
                    gioHang: gioHangMoi
                }
            });
            client.close();
            res.status(200).json({
                status: 'ok',
                message: 'Đã thêm vào giỏ hàng !'
            });

        } catch (e) {
            client.close();
            res.status(200).json({
                status: "fail",
                message: e.toString()
            });
        }
    },

    XoaSanPhamTrongGioHang: async function (req, res, next) {
        const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
        try {
            const khachHangId = ObjectId(req.khachHangId);
            const {idSanPham, idPhanLoai, idChuShop} = req.body;
            //console.log(JSON.stringify(req.body));
            console.log(req.body);
            //console.log(typeof  idSanPham)
            //console.log(typeof  idPhanLoai)
            await client.connect();
            const db = client.db(DbName);
            const colNguoiDung = db.collection('NguoiDung');
            //Kiểm tra xem khách hàng có tồn tại không
            let resKhachHang = await colNguoiDung.find({_id: khachHangId}).next();
            if (resKhachHang === null) {
                res.status(200).json({
                    status: 'fail',
                    message: 'Khách hàng không tồn tại !'
                }); return;
            }
            const gioHang = resKhachHang.gioHang;

            let gioHangDuocXoaSP = gioHang.map((item) => {
                if (item.ID_ChuShop.toString() === idChuShop.toString()) {         //Tìm kiếm shop trong vòng lặp
                    //console.log(typeof item.ID_ChuShop);
                    //console.log(item.ID_ChuShop.toString());
                    //console.log('tim đc chủ shop');
                    return {
                        ...item,
                        danhSach: item.danhSach.filter((spitem) => {
                            console.log(spitem.ID_PhanLoai.toString())
                            console.log(idPhanLoai.toString() )
                            return  spitem.ID_PhanLoai.toString() !== idPhanLoai.toString()   // Không đúng kiểu dữ liệu, dùng shalow compare
                        })
                    }
                }
                return {
                    ...item
                };
            });
            let gioHangLocShopKoCoHang = gioHangDuocXoaSP.filter((item) => {
                return item.danhSach.length > 0
            })

            let resUpdatGioHang = await colNguoiDung.updateOne({_id: khachHangId}, {
                $set: {
                    gioHang: gioHangLocShopKoCoHang
                }
            });
            client.close();
            res.status(200).json({
                status: 'ok',
                message: 'Đã xóa sản phẩm khỏi giỏ hàng !'
            });

        } catch (e) {
            client.close();
            res.status(200).json({
                status: "fail",
                message: e.toString()
            });
        }
    },

    XoaTatCaSanPhamTrongGioHang: async function (req, res, next) {
        const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
        try {
            const khachHangId = ObjectId(req.khachHangId);
            const {idChuShop} = req.body;
            console.log(idChuShop);
            //console.log(JSON.stringify(req.body));
            await client.connect();
            const db = client.db(DbName);
            const colNguoiDung = db.collection('NguoiDung');
            //Kiểm tra xem khách hàng có tồn tại không
            let resKhachHang = await colNguoiDung.find({_id: khachHangId}).next();
            if (resKhachHang === null) {
                res.status(200).json({
                    status: 'fail',
                    message: 'Khách hàng không tồn tại !'
                });
            }
            const {gioHang} = resKhachHang;
            let gioHangDuocXoaSPCuaShop = gioHang.filter(item => item.ID_ChuShop != idChuShop); // Không đúng kiểu dữ liệu, dùng shalow compare
            console.log(gioHangDuocXoaSPCuaShop)

            let resUpdatGioHang = await colNguoiDung.updateOne({_id: khachHangId}, {
                $set: {
                    gioHang: gioHangDuocXoaSPCuaShop
                }
            });
            client.close();
            res.status(200).json({
                status: 'ok',
                message: 'Đã xóa sản phẩm khỏi giỏ hàng !'
            });

        } catch (e) {
            client.close();
            res.status(200).json({
                status: "fail",
                message: e.toString()
            });
        }
    },

}

async function XoaSanPhamHetHangTrongGioHang(listSanPham,khachHangId){
    const client = new MongoClient(DbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
    try {
       // const listSanPhamMoi = listSanPham.map((item)=>item.to)
        await client.connect();
        const db = client.db(DbName);
        const colNguoiDung = db.collection('NguoiDung');
        let deleteSanPham = await colNguoiDung.find({_id: ObjectId(khachHangId)}).next();
        const gioHangSauKhiLocSanPham = deleteSanPham.gioHang.map((itemSPGioHang) => {
            return{
                ...itemSPGioHang,
                danhSach:itemSPGioHang.danhSach.filter(item=> !listSanPham.includes(item.ID_SanPham.toString()))
            }

        });
        let updateGioHang = await colNguoiDung.updateOne({_id: ObjectId(khachHangId)}, {
            $set: {
                gioHang: gioHangSauKhiLocSanPham
            }
        });
    } catch (e) {
        console.log(e);
    }

}