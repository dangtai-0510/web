require("dotenv").config();

const express = require("express");
const { PayOS } = require("@payos/node");

const app = express();
const port = 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Khởi tạo PayOS
const payos = new PayOS(
    process.env.PAYOS_CLIENT_ID,
    process.env.PAYOS_API_KEY,
    process.env.PAYOS_CHECKSUM_KEY
);

// Trang chủ
app.get("/", (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="vi">
        <head>
            <meta charset="UTF-8">
            <title>Thanh toán PayOS</title>
        </head>
        <body style="font-family: Arial; text-align:center; margin-top:60px;">
            <h1>Sản phẩm: Quần âu</h1>
            <h2>Giá: 11.000 VNĐ</h2>

            <form action="/create-payment-link" method="POST">
                <button
                    type="submit"
                    style="
                        padding:12px 25px;
                        background:#007bff;
                        color:white;
                        border:none;
                        border-radius:5px;
                        cursor:pointer;
                        font-size:16px;
                    "
                >
                    Thanh toán qua PayOS
                </button>
            </form>
        </body>
        </html>
    `);
});

// Tạo link thanh toán
app.post("/create-payment-link", async (req, res) => {
    try {
        const orderCode = Date.now();

        const YOUR_DOMAIN = `https://${req.get("host")}`;

        const paymentData = {
            orderCode: orderCode,
            amount: 11000,
            description: "Quan au",
            returnUrl: `${YOUR_DOMAIN}/success`,
            cancelUrl: `${YOUR_DOMAIN}/cancel`
        };

        const paymentLink = await payos.createPaymentLink(paymentData);

        res.redirect(paymentLink.checkoutUrl);

    } catch (error) {
        console.error("====== PAYOS ERROR ======");
        console.error(error);

        res.status(500).send(`
            <h2>Có lỗi khi tạo thanh toán</h2>
            <pre>${error.message}</pre>
            <a href="/">Quay lại</a>
        `);
    }
});

// Thành công
app.get("/success", (req, res) => {
    res.send(`
        <div style="text-align:center;margin-top:60px;font-family:Arial;">
            <h1 style="color:green;">Thanh toán thành công!</h1>
            <a href="/">Quay lại trang chủ</a>
        </div>
    `);
});

// Hủy thanh toán
app.get("/cancel", (req, res) => {
    res.send(`
        <div style="text-align:center;margin-top:60px;font-family:Arial;">
            <h1 style="color:red;">Bạn đã hủy thanh toán.</h1>
            <a href="/">Quay lại trang chủ</a>
        </div>
    `);
});

// Chạy server
app.listen(port, () => {
    console.log(`Server đang chạy tại: http://localhost:${port}`);
});