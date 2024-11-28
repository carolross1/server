import passport from 'passport';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import pool from '../database';

// Configuración de la estrategia de Facebook
passport.use(
  new FacebookStrategy(
    {
      clientID: '910935567565163',
      clientSecret: '99997de41e2c41f398dc91ec9db4d2a2',
      callbackURL: 'http://localhost:3000/auth/facebook/callback',
      profileFields: ['id', 'emails', 'name']
    },
    async (accessToken, refreshToken, profile, done) => {
      const { id, emails } = profile;
      try {
        const email = emails ? emails[0].value : '';
        let user = await pool.query('SELECT * FROM usuario WHERE email = ?', [email]);

        if (user.length === 0) {
          // Crear el usuario si no existe
          user = await pool.query('INSERT INTO usuario SET ?', {
            nombre: profile.name?.givenName,
            email,
            tipo_Usuario: 'empleado' // Asigna un rol por defecto, se puede ajustar según lógica
          });
          user = await pool.query('SELECT * FROM usuario WHERE email = ?', [email]); // Recuperar el usuario recién insertado
        }

        return done(null, user[0]);
      } catch (error) {
        return done(error as Error, null); // Asigna tipo Error a 'error'
      }
    }
  )
);

// Controlador de autenticación de Facebook
export const facebookAuth = passport.authenticate('facebook', { scope: ['email'] });

// Controlador de callback de Facebook
export const facebookCallback = (req: Request, res: Response) => {
  passport.authenticate('facebook', { session: false }, (err: Error | null, user: any) => { // Especifica el tipo de 'err'
    if (err || !user) {
      return res.redirect('/login');
    }

    // Generar un token JWT y devolverlo al frontend
    const token = jwt.sign(
      { id: user.id_Usuario, tipo_Usuario: user.tipo_Usuario },
      'secretKey',
      { expiresIn: '1h' }
    );
    res.json({ success: true, token, usuario: user });
  })(req, res);
};
