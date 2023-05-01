import { Router } from "express";


import ProductManager from "../Managers/ProductManager.js";
const router = Router();

const pm = new ProductManager();
const products = await pm.getProducts();

// router.use(express.json());

router.get("/", async (req, res) => {
  try {
    const limProd = req.query.limit;
    const allProducts = await products;
    // console.log(allProducts);
    if (!limProd) {
      res.render("products", { allProducts : allProducts });
    } else if (isNaN(limProd)) {
      res.status(400).render({ error: "limit is not a number" });
    } else if (limProd < 0) {
      res.status(400).render({ error: "limit must be a positive number" });
    } else {
      const reduced = allProducts.slice(0, limProd);
      res.status(200).render(reduced);
    }
  } catch (error) {
    res
      .status(500)
      .send({ error: "Internal server error, contact the administrator" });
  }
});

router.get("/:pid", async (req, res) => {
  try {
    const pos = parseInt(req.params.pid);

    if (isNaN(pos)) {
      res.status(400).render({ error: "product id is not a number " });
    }
    if (pos < 0) {
      res.status(400).render({ error: "product id must be a positive number " });
    }
    const prod = await products;
    const prodSelect = prod.find((prod) => prod.id === pos);
    if (prodSelect === undefined) {
      res.status(400).render({ error: "id does not belong to a product" });
    } else {
      res.status(200).render(prodSelect);
    }
  } catch (error) {
    res
      .status(500)
      .render({ error: "Internal server error, contact the administrator" });
  }
});

router.post("/", async (req, res) => {
  try {
    const prod = req.body;
    const resProd = await pm.createProducts(prod);

    if (resProd.code === undefined) {
      res.status(400).render({ error: `Duplicate product code` });
    } else {
      res.status(200).render(resProd);
    }
  } catch (error) {
    res
      .status(500)
      .render({ error: "Internal server error, contact the administrator" });
  }
});

router.put("/:pid", async (req, res) => {
  try {
    const id = parseInt(req.params.pid);
    const elem = req.body;

    if (elem.code !== undefined) {
      res.status(400).render({ error: `Duplicate product code` });
    } else {
      await pm.updateProduct(id, elem);

      res.status(200).render(products);
    }
  } catch (error) {
    res
      .status(500)
      .render({ error: "Internal server error, contact the administrator" });
  }
});

router.delete("/:pid", async (req, res) => {
  try {
    const id = parseInt(req.params.pid);

    await pm.deleteProduct(id);
 
    res.status(200).render({ MessageEvent: "product removed successfully "});
  } catch (error) {
    res
      .status(500)
      .render({ error: "Internal server error, contact the administrator" });
  }
});

export default router;
