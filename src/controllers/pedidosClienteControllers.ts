import { Request, Response } from 'express';
import pool from '../database'; // Asegúrate de que tu archivo de conexión a la base de datos esté correctamente configurado

// Registrar una nueva dirección de pago
export const registrarDireccionPago = async (req: Request, res: Response) => {
  const { id_Cliente, direccion, ciudad, codigoPostal } = req.body;

  try {
    const result: any = await pool.query(
      'INSERT INTO direccion_pago (id_Cliente, direccion, ciudad, codigoPostal) VALUES (?, ?, ?, ?)',
      [id_Cliente, direccion, ciudad, codigoPostal]
    );

    const lastId = result.insertId;
    res.json({ idDireccionPago: lastId });
  } catch (error) {
    console.error('Error al registrar dirección de pago:', error);
    res.status(500).json({ message: 'Error al registrar dirección de pago' });
  }
};

// Obtener todas las direcciones de pago
export const obtenerDireccionesPago = async (req: Request, res: Response) => {
  try {
    const direcciones = await pool.query('SELECT * FROM direccion_pago');
    res.json(direcciones);
  } catch (error) {
    console.error('Error al obtener direcciones de pago:', error);
    res.status(500).json({ message: 'Error al obtener direcciones de pago' });
  }
};

// Obtener una dirección de pago por ID
export const obtenerDireccionPagoPorId = async (req: Request, res: Response) => {
  const { idDireccionPago } = req.params;
  try {
    const direccion = await pool.query('SELECT * FROM direccion_pago WHERE id_Direccion_Pago = ?', [idDireccionPago]);
    if (Array.isArray(direccion) && direccion.length > 0) {
      res.json(direccion[0]);
    } else {
      res.status(404).json({ message: 'Dirección de pago no encontrada' });
    }
  } catch (error) {
    console.error('Error al obtener dirección de pago:', error);
    res.status(500).json({ message: 'Error al obtener dirección de pago' });
  }
};

// Actualizar una dirección de pago
export const actualizarDireccionPago = async (req: Request, res: Response) => {
  const { idDireccionPago } = req.params;
  const { direccion, ciudad, codigoPostal } = req.body;

  try {
    await pool.query(
      'UPDATE direccion_pago SET direccion = ?, ciudad = ?, codigoPostal = ? WHERE id_Direccion_Pago = ?',
      [direccion, ciudad, codigoPostal, idDireccionPago]
    );
    res.json({ message: 'Dirección de pago actualizada correctamente' });
  } catch (error) {
    console.error('Error al actualizar dirección de pago:', error);
    res.status(500).json({ message: 'Error al actualizar dirección de pago' });
  }
};

// Eliminar una dirección de pago
export const eliminarDireccionPago = async (req: Request, res: Response) => {
  const { idDireccionPago } = req.params;
  try {
    await pool.query('DELETE FROM direccion_pago WHERE id_Direccion_Pago = ?', [idDireccionPago]);
    res.json({ message: 'Dirección de pago eliminada' });
  } catch (error) {
    console.error('Error al eliminar dirección de pago:', error);
    res.status(500).json({ message: 'Error al eliminar dirección de pago' });
  }
};
