import express from "express";
import handlebars from "express-handlebars";
import mongoose from "mongoose";
import passport from "passport";
import cookieParser from "cookie-parser";

import UserRouter from "./routes/users.router.js";
import ProductRouter from "./routes/products.router.js"
// import productsRouter from "./routes/products.router.js";
import cartsRouter from "./routes/carts.router.js";
// import usersRouter from "./routes/users.router.js";
// import sessionsRouter from "./routes/sessions.router.js"
import SessionRouter from "./routes/sessions.router.js"
import ViewsRouter from "./routes/views.router.js";
import __dirname from "./utils.js";

import registerChathandler from "./listeners/chatHandler.js";
import { Server } from "socket.io";
import socketProducts from "./products.socket.js";
import socketCarts from "./cart.socket.js";
import initializePassportStrategies from "../config/passport.config.js";

const app = express();

const userRouter = new UserRouter();
const productRouter = new ProductRouter();
const sessionRouter = new SessionRouter();
const viewsRouter = new ViewsRouter();

const connection = mongoose.connect(
  "mongodb+srv://juanituza:123@cluster0mckenna.x71myop.mongodb.net/Ecommerce?retryWrites=true&w=majority"
);
const PORT = process.env.PORT || 8080;

//Server de escucha
const server = app.listen(PORT, () => {
  console.log(`Listening on ${PORT}`);
});
const io = new Server(server);
// const cart = new Server(server);
initializePassportStrategies();

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(`${__dirname}/public`));


app.engine("handlebars", handlebars.engine());
app.set("views", `${__dirname}/views`);
app.set("view engine", "handlebars");

app.use((req, res, next) => {
  req.io = io;
  next();
});



app.use("/api/products", productRouter.getRouter());
app.use("/api/users", userRouter.getRouter());
app.use("/api/carts", cartsRouter);
app.use("/api/sessions", sessionRouter.getRouter());

app.use("/", viewsRouter.getRouter());

io.on("connection", (socket) => {
  registerChathandler(io, socket);
});
// io.on('connection', async socket => {
//     console.log('cart conexion');
// });

socketProducts(io);
socketCarts(io);
