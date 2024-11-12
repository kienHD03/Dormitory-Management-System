const express = require("express");
const app = express();
const morgan = require("morgan");
const userRouter = require("./routes/user.route");
const authRouter = require("./routes/auth.route");
const roomRouter = require("./routes/room.route");
const postRouter = require("./routes/post.route");
const requestRouter = require("./routes/request.route");
const reportRouter = require("./routes/report.route");
const invoiceRouter = require("./routes/invoice.route");
const path = require("path");
const cors = require("cors");
const PayOS = require("@payos/node");

app.use(cors());
app.use(morgan("dev"));
app.use(express.static("public"));
app.use(express.json()); // Nhận body từ json
app.use(express.urlencoded({ extended: true })); //Nhận body từ urlencoded

//router

app.use("/auth", authRouter);
app.use("/users", userRouter);
app.use("/rooms", roomRouter);
app.use("/posts", postRouter);
app.use("/requests", requestRouter);
app.use("/reports", reportRouter);
app.use("/invoice", invoiceRouter);

const payOS = new PayOS(
  process.env.PAYOS_CLIENT_ID,
  process.env.PAYOS_API_KEY,
  process.env.PAYOS_CHECKSUM_KEY
);

app.post("/create-embedded-payment-link", async (req, res) => {
  const YOUR_DOMAIN = `http://localhost:5173`;
  const body = {
    orderCode: Number(String(Date.now()).slice(-6)),
    amount: 10000,
    description: "Thanh toan don hang",
    items: [
      {
        name: "Mì tôm Hảo Hảo ly",
        quantity: 1,
        price: 10000,
      },
    ],
    returnUrl: `${YOUR_DOMAIN}`,
    cancelUrl: `${YOUR_DOMAIN}`,
  };

  try {
    const paymentLinkResponse = await payOS.createPaymentLink(body);

    res.send(paymentLinkResponse);
  } catch (error) {
    console.error(error);
    res.send("Something went error");
  }
});

app.use(express.static(path.join(__dirname, "../public")));

app.get("(/*)?", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

module.exports = app;
