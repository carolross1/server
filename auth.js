"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const passport_facebook_1 = require("passport-facebook");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const FACEBOOK_APP_ID = '910935567565163';
const FACEBOOK_APP_SECRET = '99997de41e2c41f398dc91ec9db4d2a2';
passport_1.default.use(new passport_facebook_1.Strategy({
    clientID: FACEBOOK_APP_ID,
    clientSecret: FACEBOOK_APP_SECRET,
    callbackURL: 'http://localhost:3000/auth/facebook/callback',
    profileFields: ['id', 'displayName', 'email'] // Campos que deseas obtener de Facebook
}, (accessToken, refreshToken, profile, done) => {
    var _a, _b;
    const user = { id: profile.id, name: profile.displayName, email: (_b = (_a = profile.emails) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.value };
    // Generar el token JWT
    const token = jsonwebtoken_1.default.sign(user, 'your_jwt_secret_key', { expiresIn: '1h' });
    return done(null, { user, token }); // Aquí pasamos tanto el usuario como el token
}));
exports.default = passport_1.default;
