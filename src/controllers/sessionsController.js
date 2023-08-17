import MailingService from "../services/MailingService.js";
import DTemplates from "../constants/DTemplates.js";
import LoggerService from "../dao/Mongo/Managers/LoggerManager.js";
import { createHash, generateToken, validatePassword } from "../utils.js";
import { usersService } from "../services/repositories/index.js";

const register = async (req, res) => {
  const mailingService = new MailingService();
  try {
    const result = await mailingService.sendMail(
      req.user.email,
      DTemplates.WELCOME,
      { user: req.user }
    );
    res.sendSuccess("Registered");
  } catch (error) {
    LoggerService.error;
    res.sendInternalError("Internal server error, contact the administrator");
  }
};

const login = async (req, res) => {
  try {
    const accessToken = generateToken(req.user);
    //envío el token por el body para que el front lo guardo
    res
      .cookie("authToken", accessToken, {
        maxAge: 1000 * 60 * 60 * 24,
        httpOnly: true,
        sameSite: "strict",
      })
      .sendSuccess("Login In");
  } catch (error) {
    res.sendInternalError("Internal server error, contact the administrator");
  }
};

const loginGitHub = (req, res) => {
  try {
    const user = {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    };
    // console.log(req.user);
    // console.log(user);
    const accessToken = generateToken(req.user);
    //envío el token por el body para que el front lo guarde
    // res.send({ estatus: "success", accessToken })
    res
      .cookie("authToken", accessToken, {
        maxAge: 1000 * 60 * 60 * 24,
        httpOnly: true,
        sameSite: "strict",
      })
      .sendSuccess("Logueado con github");
  } catch (error) {
    res.sendInternalError("Internal server error, contact the administrator");
  }
};
const logout = async (req, res) => {
  res.clearCookie("authToken"); // Eliminar la cookie "authToken"
  res.send({
    status: "success",
    message: "Sesión cerrada correctamente",
  });
};

const restorePassword = async (req, res) => {
  const { email, password } = req.body;
  //Verifico si existe el usuario
  // const user = await um.getUserBy({email});
  const user = await usersService.getUserBy({ email });

  if (!user) return res.sendUnauthorized("User doesn't exist");
  //Comparo password nuevo con el antiguo
  const isSamePassword = await validatePassword(password, user.password);
  if (isSamePassword)
    return res.sendUnauthorized(
      "Cannot replace password with current password"
    );
  //Si es diferente actualizo password
  const newHashPassword = await createHash(password); //hasheo password nuevo
  const result = await usersService.updateUser(
    { email },
    { password: newHashPassword }
  );
  res.sendSuccess("Password updated successfully");
};

export default { register, login, loginGitHub, logout, restorePassword };
