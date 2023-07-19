import { cartService } from "../services/repositories/index.js";
const getCarts = async (req, res) => {
  try {
    const carts = await cartService.getCarts();
    res.sendSuccessWithPayload(carts);
  } catch (error) {
    res.sendInternalError("Internal server error, contact the administrator");
  }
};

const getCartsBy = async (req, res) => {
  try {
    const { cid } = req.params;

    const cartsId = await cartService.getCartsBy(cid);

    res.sendSuccessWithPayload(cartsId);
  } catch (error) {
    res.sendInternalError("Internal server error, contact the administrator");
  }
};

const createCart = async (req, res) => {
  try {
    const { products } = req.body;

    const savedCart = await cartService.createCart(products);
    console.log(savedCart);

    res.sendSuccessWithPayload(savedCart);
  } catch (error) {
    res.sendInternalError("Internal server error");
  }
};

const addProduct = async (req, res) => {
  try {
    const cid = req.user.cart;
    
    const { pid } = req.params;
    const cartResult = await cartService.addProduct(cid, pid);

    res.sendSuccessWithPayload(cartResult);
  } catch (error) {
    console.log(error);
    res.sendInternalError("Internal server error,contact the administrator");
  }
};

const purchaseCart = async (req,res) => {
  try {
    const cid = req.user.cart;

    // const cart = await cartService.clientCart(cid);
    // console.log(cart);
    const purchase = await cartService.purchaseCart(cid); 
    res.sendSuccessWithPayload(purchase);

  } catch (error) {
    console.log(error);
    if (error.name === "stockError"){
      res.sendErrorWithPayload(products);
    }
    res.sendInternalError("Internal server error,contact the administrator");
  }
}


const editCart = async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const cart = await cartService.getCartsBy(cid);

    // Verificar si el carrito existe
    if (!cart) {
      return res.status(404).send("cart not found");
    }
    // Buscar el índice del producto en el carrito
    const productIndex = cart.products.findIndex(
      (p) => p.product._id.toString() === pid
    );
    if (productIndex === -1) {
      return res.sendNotFound("There is no product in the cart");
    }
    //Resto la quantity
    const product = cart.products[productIndex];
    product.quantity -= 1;
    if (product.quantity === 0) {
      // Eliminar el producto del carrito si la cantidad es cero
      cart.products.splice(productIndex, 1);
    }
    //guardo los cambios del carrito:
    cart.save();
    // const removedProductUnit = await cartService.deleteProductUnit(cid, pid);
    res.sendSuccessWithPayload(cart);
  } catch (error) {
    res.sendInternalError("Internal server error,contact the administrator");
  }
};

const editQuantity = async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const { quantity } = req.body;
    const cart = await cartService.getCartsBy(cid);

    if (!cart) {
      return res.sendNotFound("The cart does not exist");
    }
    // Busca el producto dentro del carrito
    const product = cart.products.find((p) => p.product._id.toString() === pid);

    if (!product) {
      return res.sendNotFound("The product does not exist in the cart");
    }
    // Actualiza la cantidad del producto
    product.quantity = quantity;

    // Guarda los cambios en el carrito
    await cart.save();

    res.sendSuccessWithPayload({ cart });
  } catch (error) {
    res.sendInternalError("Internal server error,contact the administrator");
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const cart = await cartService.getCartsBy(cid);
    const product = cart.products.find((p) => p.product._id.toString() === pid);
    if (!product) {
      return res.sendNotFound("The product does not exist in the cart");
    }
    cart.products.splice(product, 1);

    await cart.save();

    res.sendSuccessWithPayload({ cart });
  } catch (error) {
    res.sendInternalError("Internal server error,contact the administrator");
  }
};

const deleteCart = async (req, res) => {
  try {
    const { cid } = req.params;
    await cartService.deleteCart(cid);
    res.sendSuccess("Cart removed successfully");
  } catch (error) {
    res.sendInternalError("Internal server error,contact the administrator");
  }
};

export default {
  getCarts,
  getCartsBy,
  createCart,
  addProduct,
  purchaseCart,
  editCart,
  editQuantity,
  deleteProduct,
  deleteCart,
};