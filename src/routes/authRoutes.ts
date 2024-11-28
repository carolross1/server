import { Router } from 'express';
import passport from 'passport';
import { Strategy as FacebookStrategy, Profile } from 'passport-facebook';
import jwt from 'jsonwebtoken';
import pool from '../database';
import { facebookAuth, facebookCallback } from '../controllers/authControllers';

const router = Router();
router.get('/auth/facebook', facebookAuth);
router.get('/auth/facebook/callback', facebookCallback);


// Credenciales de la App de Facebook
const FACEBOOK_APP_ID = '910935567565163';
const FACEBOOK_APP_SECRET = '99997de41e2c41f398dc91ec9db4d2a2';

// Generar un nuevo `id_Usuario` único
async function generateUserId(): Promise<string> {
  const lastUser = await pool.query('SELECT id_Usuario FROM usuario ORDER BY id_Usuario DESC LIMIT 1');
  const lastUserId = lastUser[0]?.id_Usuario ?? 'USR000';
  const newIdNumber = parseInt(lastUserId.slice(3), 10) + 1;
  return `USR${String(newIdNumber).padStart(3, '0')}`;
}

// Configurar la estrategia de Passport con Facebook
passport.use(
  new FacebookStrategy(
    {
      clientID: FACEBOOK_APP_ID,
      clientSecret: FACEBOOK_APP_SECRET,
      callbackURL: 'http://localhost:3000/auth/facebook/callback',
      profileFields: ['id', 'displayName', 'email'],
    },
    async (accessToken: string, refreshToken: string, profile: Profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;

        if (!email) {
          return done(new Error('No email associated with this Facebook account'));
        }

        // Buscar el usuario en la base de datos
        const result = await pool.query('SELECT id_Usuario FROM usuario WHERE email = ?', [email]);
        
        let userId;

        if (result.length > 0) {
          // Si el usuario existe, obten su id
          userId = result[0].id_Usuario;
        } else {
          // Si no existe, crear el usuario
          userId = await generateUserId();
          const salt = 'facebook-auth'; // Salt predeterminado para usuarios de Facebook (puedes cambiarlo si usas otro método)
          const newUser = await pool.query(
            'INSERT INTO usuario (id_Usuario, nombre, apellido, telefono, email, contrasena, tipo_Usuario, salt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [userId, profile.displayName, '', '0000000000', email, '', 'Admin', salt] // Rellena los campos según se requiera
          );
        }

        // Generar un token JWT
        const user = { id: userId, name: profile.displayName, email };
        const token = jwt.sign(user, 'pv_abarrotes_2024_rrc', { expiresIn: '1h' });

        done(null, { user, token });
      } catch (error) {
        done(error);
      }
    }
  )
);

// Ruta para iniciar la autenticación con Facebook
router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));

// Ruta de callback donde Facebook redirige tras la autenticación
router.get(
  '/facebook/callback',
  passport.authenticate('facebook', { session: false }), // No usamos sesiones de servidor
  (req, res) => {
    const { token } = req.user as { token: string };

    // Redirigir al frontend con el token en la URL
    res.redirect(`http://localhost:4200/menu?token=${token}`);
  }
);

export default router;
