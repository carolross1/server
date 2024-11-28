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
const express_1 = require("express");
const passport_1 = __importDefault(require("passport"));
const passport_facebook_1 = require("passport-facebook");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = __importDefault(require("../database"));
const authControllers_1 = require("../controllers/authControllers");
const router = (0, express_1.Router)();
router.get('/auth/facebook', authControllers_1.facebookAuth);
router.get('/auth/facebook/callback', authControllers_1.facebookCallback);
// Credenciales de la App de Facebook
const FACEBOOK_APP_ID = '910935567565163';
const FACEBOOK_APP_SECRET = '99997de41e2c41f398dc91ec9db4d2a2';
// Generar un nuevo `id_Usuario` único
function generateUserId() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        const lastUser = yield database_1.default.query('SELECT id_Usuario FROM usuario ORDER BY id_Usuario DESC LIMIT 1');
        const lastUserId = (_b = (_a = lastUser[0]) === null || _a === void 0 ? void 0 : _a.id_Usuario) !== null && _b !== void 0 ? _b : 'USR000';
        const newIdNumber = parseInt(lastUserId.slice(3), 10) + 1;
        return `USR${String(newIdNumber).padStart(3, '0')}`;
    });
}
// Configurar la estrategia de Passport con Facebook
passport_1.default.use(new passport_facebook_1.Strategy({
    clientID: FACEBOOK_APP_ID,
    clientSecret: FACEBOOK_APP_SECRET,
    callbackURL: 'http://localhost:3000/auth/facebook/callback',
    profileFields: ['id', 'displayName', 'email'],
}, (accessToken, refreshToken, profile, done) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const email = (_b = (_a = profile.emails) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.value;
        if (!email) {
            return done(new Error('No email associated with this Facebook account'));
        }
        // Buscar el usuario en la base de datos
        const result = yield database_1.default.query('SELECT id_Usuario FROM usuario WHERE email = ?', [email]);
        let userId;
        if (result.length > 0) {
            // Si el usuario existe, obten su id
            userId = result[0].id_Usuario;
        }
        else {
            // Si no existe, crear el usuario
            userId = yield generateUserId();
            const salt = 'facebook-auth'; // Salt predeterminado para usuarios de Facebook (puedes cambiarlo si usas otro método)
            const newUser = yield database_1.default.query('INSERT INTO usuario (id_Usuario, nombre, apellido, telefono, email, contrasena, tipo_Usuario, salt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [userId, profile.displayName, '', '0000000000', email, '', 'Admin', salt] // Rellena los campos según se requiera
            );
        }
        // Generar un token JWT
        const user = { id: userId, name: profile.displayName, email };
        const token = jsonwebtoken_1.default.sign(user, 'pv_abarrotes_2024_rrc', { expiresIn: '1h' });
        done(null, { user, token });
    }
    catch (error) {
        done(error);
    }
})));
// Ruta para iniciar la autenticación con Facebook
router.get('/facebook', passport_1.default.authenticate('facebook', { scope: ['email'] }));
// Ruta de callback donde Facebook redirige tras la autenticación
router.get('/facebook/callback', passport_1.default.authenticate('facebook', { session: false }), // No usamos sesiones de servidor
(req, res) => {
    const { token } = req.user;
    // Redirigir al frontend con el token en la URL
    res.redirect(`http://localhost:4200/menu?token=${token}`);
});
exports.default = router;
