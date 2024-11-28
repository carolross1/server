"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.facebookCallback = exports.facebookAuth = void 0;
const passport_1 = __importDefault(require("passport"));
const passport_facebook_1 = require("passport-facebook");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = __importDefault(require("../database"));
// Configuración de la estrategia de Facebook
passport_1.default.use(new passport_facebook_1.Strategy({
    clientID: '910935567565163',
    clientSecret: '99997de41e2c41f398dc91ec9db4d2a2',
    callbackURL: 'http://localhost:3000/auth/facebook/callback',
    profileFields: ['id', 'emails', 'name']
}, (accessToken, refreshToken, profile, done) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { id, emails } = profile;
    try {
        const email = emails ? emails[0].value : '';
        let user = yield database_1.default.query('SELECT * FROM usuario WHERE email = ?', [email]);
        if (user.length === 0) {
            // Crear el usuario si no existe
            user = yield database_1.default.query('INSERT INTO usuario SET ?', {
                nombre: (_a = profile.name) === null || _a === void 0 ? void 0 : _a.givenName,
                email,
                tipo_Usuario: 'empleado' // Asigna un rol por defecto, se puede ajustar según lógica
            });
            user = yield database_1.default.query('SELECT * FROM usuario WHERE email = ?', [email]); // Recuperar el usuario recién insertado
        }
        return done(null, user[0]);
    }
    catch (error) {
        return done(error, null); // Asigna tipo Error a 'error'
    }
})));
// Controlador de autenticación de Facebook
exports.facebookAuth = passport_1.default.authenticate('facebook', { scope: ['email'] });
// Controlador de callback de Facebook
const facebookCallback = (req, res) => {
    passport_1.default.authenticate('facebook', { session: false }, (err, user) => {
        if (err || !user) {
            return res.redirect('/login');
        }
        // Generar un token JWT y devolverlo al frontend
        const token = jsonwebtoken_1.default.sign({ id: user.id_Usuario, tipo_Usuario: user.tipo_Usuario }, 'secretKey', { expiresIn: '1h' });
        res.json({ success: true, token, usuario: user });
    })(req, res);
};
exports.facebookCallback = facebookCallback;
