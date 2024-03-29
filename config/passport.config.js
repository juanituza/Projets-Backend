import passport from "passport";
import config from "../src/config.js";
import local from "passport-local";
import GithubStrategy from "passport-github2";
import {
  cartService,
  usersService,
} from "../src/services/repositories/index.js";
import { Strategy, ExtractJwt } from "passport-jwt";
import { cookieExtractor, createHash, validatePassword } from "../src/utils.js";

import LoggerService from "../src/dao/Mongo/Managers/LoggerManager.js";

const LocalStrategy = local.Strategy;
const JWTStrategy = Strategy;

const initializePassportStrategies = () => {
  passport.use(
    "register",
    new LocalStrategy(
      { passReqToCallback: true, usernameField: "email" },
      async (req, email, password, done) => {
        try {
          const { first_name, last_name,age, role } = req.body;
          const exist = await usersService.getUserBy({ email });
          // const exist = await userModel.findOne({ email });

          if (exist) return done(null, false, { message: "User exist" },LoggerService.error("User exist"));
          // done(null, false, { message: "User exist" },LoggerService.error("Role not exist"));
          const hashedPassword = await createHash(password);
          const cart = await cartService.createCart();
          const user = {
            first_name,
            last_name,
            age,
            email,
            cart: cart._id,
            password: hashedPassword,
            role,
          };

          // const result = await userModel.create(user);
          const result = await usersService.createUser(user);
          done(null, result);
        } catch (error) {
          done(error);
        }
      }
    )
  );

  passport.use(
    "login",
    new LocalStrategy(
      { usernameField: "email" },
      async (email, password, done) => {
        //defino el admin
        if (email === config.admin.USER && password === config.admin.PASS) {
          const User = {
            id: 0,
            name: `ADMIN`,
            role: "ADMIN",
            email: config.admin.USER,
          };
          return done(null, User);
        }
        let user;
        user = await usersService.getUserBy({ email });
        if (!user)
          return done(null, false, { message: "Incorrect credentials" });

        const isValidPassword = await validatePassword(password, user.password);

        if (!isValidPassword)
          return done(null, false, { message: "Wrong password" });

       
        //creo la sesión
        
        user = {
          _id: user._id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          cart: user.cart,
          role: user.role,
          status: user.status,
        };
        
     
        
        return done(null, user);
      }
    )
  );

  passport.use(
    "github",
    new GithubStrategy(
      {
        clientID: "Iv1.fd6853e95ce4c8a5",
        clientSecret: "aff259b7114a590e0c5c51ffb71f7ac4f868bbb2",
        callbackURL:"https://backend-project-q2nk.onrender.com/api/sessions/githubcallback",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          //tomo los datos del profile que me sirvan.
          const { name, email } = profile._json;
          const user = await usersService.getUserBy({ email });
          const cart = await cartService.createCart();
          //Gestiono ambas logicas
          if (!user) {
            //si no existe user lo creo
            const newUser = {
              first_name: name,
              email,
              cart: cart._id,
              password: "",
            };
            const result = await usersService.createUser(newUser);
            done(null, result);
          }
          // si ya existe el user
          done(null, user);
        } catch (error) {
          done(error);
        }
      }
    )
  );

  //passport se encarga de la verificacion del token
  passport.use(
    "jwt",
    new Strategy(
      {
        jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
        secretOrKey: config.jwt.SECRET,
      },
      async (payload, done) => {
        try {
          return done(null, payload);
        } catch (error) {
          done(error);
        }
      }
    )
  );
};

export default initializePassportStrategies;
