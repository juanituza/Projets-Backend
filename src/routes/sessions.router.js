import BaseRouter from "./baseRouter.js";
import {
  createHash,
  generateToken,
  passportCall,
  validatePassword,
} from "../utils.js";
import { usersService } from "../services/repositories/index.js";
import sessionsController from "../controllers/sessionsController.js";
export default class SessionRouter extends BaseRouter {
  init() {
    this.post(
      "/register",
      ["PUBLIC"],
      passportCall("register", { strategyType: "locals" }),
      sessionsController.register
    );

    this.post(
      "/login",
      ["PUBLIC"],
      passportCall("login", { strategyType: "locals" }),
      sessionsController.login
    );

    this.get(
      "/github",
      ["NO_AUTH"],
      passportCall("github", { strategyType: "locals" }),
      (req, res) => {}
    );

    this.get(
      "/githubcallback",
      ["NO_AUTH"],
      passportCall("github", { strategyType: "locals" }),
      sessionsController.loginGitHub
    );

    this.post(
      "/logout",
      ["USER", "PREMIUM", "ADMIN"],
      passportCall("jwt", { strategyType: "locals" }),
      sessionsController.logout
    );
    this.post("/restorePassword", ["PUBLIC"],
    sessionsController.restorePassword
    );
  }
}
