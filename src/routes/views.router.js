// import { Router } from "express";
import BaseRouter from "./baseRouter.js";
import { passportCall } from "../utils.js";
import { cartService, ticketService } from "../services/repositories/index.js";
import ProdModel from "../dao/Mongo/models/products.js";







/*-----------RENDER CON MONGO---------*/

export default class ViewsRouter extends BaseRouter {
  init() {
    this.get("/", ["PUBLIC"], async (req, res) => {
      console.log(req.user);
      const userData = req.user;
      res.render("home", { user: userData });
    });
    this.get(
      "/products",
      ["PUBLIC"],
      passportCall("jwt", { strategyType: "jwt" }, { redirect: "/login" }),
      async (req, res) => {
        const { page = 1 } = req.query;
        const { docs, hasPrevPage, hasNextPage, prevPage, nextPage, ...rest } =
          await ProdModel.paginate({}, { page, limit: 10, lean: true });
        const products = docs;
        
        const userData = req.user;

        const addProductId = cartService.addProduct;
        console.log(addProductId);
        // const userData = new UserDTO(req.user);
        // console.log(userData);
        res.render("products", {
          allProducts: products,
          page: rest.page,
          hasPrevPage,
          hasNextPage,
          prevPage,
          nextPage,
          user: userData,
        });
      }
    );
    this.get(
      "/carts",
      ["ADMIN"],
      passportCall("jwt", { strategyType: "jwt" }),
      async (req, res) => {
        const carts = await cartService.getCarts();
        res.render("carts", { allCarts: carts });
      }
    );

    this.get(
      "/cartsID",
      ["USER", "PREMIUM"],
      passportCall("jwt", { strategyType: "jwt" }),
      async (req, res) => {
        const userData = req.user;
        const userCart = req.user.cart;

        const carts = await cartService.getCarts();

        const cartSelected = carts.find(
          (cart) => cart._id.toString() === userCart
        );
        res.render("cartUser", {
          cartSelected,
          css: "cart",
          user: userData,
        });
      }
    );
    this.get(
      "/ticketId",
      ["USER"],
      passportCall("jwt", { strategyType: "jwt" }),
      async (req, res) => {
        const userData = req.user;
        const userCart = req.user.email;
        // console.log(userCart);

        const tickets = await ticketService.getTicket();
        // console.log(tickets);
        const ticketSelected = tickets.filter(
          (ticket) => ticket.purchaser === userCart
        );
        res.render("ticket", {
          ticket: ticketSelected,
          user: userData,
        });
      }
    );

    this.get("/register", ["NO_AUTH"], (req, res) => {
      res.render("register");
    });
    this.get("/login", ["NO_AUTH"], (req, res) => {
      res.render("login");
    });

    this.get("/restorePassword", ["PUBLIC"], (req, res) => {
      res.render("restorePassword");
    });

    /*---------REAL TIME--------*/

    this.get("/realtimeproducts", ["PUBLIC"], async (req, res) => {
      res.render("realTimeProducts");
    });

    this.get("/realtimecart", async (req, res) => {
      res.render("realTimeCarts");
    });

    this.get("/chat", ["USER"], async (req, res) => {
      res.render("chat");
    });
  }
}
