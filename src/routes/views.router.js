// import { Router } from "express";
import BaseRouter from "./baseRouter.js";

import { authRoles } from "../middlewares/auth.js";
import { passportCall } from "../utils.js";



import productsModel from "../dao/Managers/Mongo/ProductManager.js";
import cartsModel from "../dao/Managers/Mongo/cartManager.js"
import ProdModel from '../dao/Mongo/models/products.js';

import userManager from '../dao/Managers/Mongo/userManager.js';





const cm = new cartsModel();



/*-----------RENDER CON MONGO---------*/

export default class ViewsRouter extends BaseRouter {
  init() {

    this.get("/", async (req, res) => {

      res.render("home")
    });
    this.get("/products", passportCall('jwt', { redirect: "/login" }), async (req, res) => {
      const { page = 1 } = req.query;
      const { docs, hasPrevPage, hasNextPage, prevPage, nextPage, ...rest } = await ProdModel.paginate({}, { page, limit: 10, lean: true })
      const products = docs;
      const userData = req.user;

      res.render("products", { allProducts: products, page: rest.page, hasPrevPage, hasNextPage, prevPage, nextPage, user: userData });

    });

    this.get("/carts", async (req, res) => {
      const carts = await cm.getCarts();
      res.render("carts", { allCarts: carts })
    });

    this.get("/register", (req, res) => {
      res.render('register');
    })
    this.get("/login", (req, res) => {
      res.render('login');
    })
    this.get('/profile', passportCall('jwt', { redirect: "/login" }), authRoles('user'), (req, res) => {

      res.render('profile', { user: req.user })
    })


    this.get("/restorePassword", (req, res) => {
      res.render('restorePassword');
    })








    /*---------REAL TIME--------*/


    this.get("/realtimeproducts", async (req, res) => {

      res.render("realTimeProducts");
    });



    this.get("/realtimecart", async (req, res) => {

      res.render("realTimeCarts");
    });

    this.get('/chat', async (req, res) => {
      res.render('chat');
    })

  }
}

