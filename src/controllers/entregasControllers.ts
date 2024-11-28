import { Request, Response } from 'express';
import pool from '../database';

// Crear una nueva entrega
export const crearEntrega = async (req: Request, res: Response) => {
  const { id_Usuario, id_Proveedor, fecha, hora, total_entrega, id_Factura } = req.body;

  try {
    // Insertar la entrega en la tabla 'entrega_producto'
    const result: any = await pool.query(
      'INSERT INTO entrega_producto (id_Usuario, id_Proveedor, fecha, hora, id_Factura) VALUES (?, ?, ?, ?, ?)',
      [id_Usuario, id_Proveedor, fecha, hora, id_Factura]
    );

    // Obtener el ID autoincrementado del resultado de la consulta
    const idEntrega = result.insertId;
    console.log('ID autoincrementado insertado:', idEntrega);

    if (idEntrega) {
      // Si el ID fue correctamente generado, responde con el ID de la entrega
      res.status(200).json({ idEntrega });
    } else {
      // Si no se pudo obtener el ID, lanza un error
      console.error('No se pudo obtener el ID de la entrega.');
      res.status(500).json({ message: 'Error al crear la entrega.' });
    }

  } catch (error) {
    console.error('Error al crear la entrega:', error);
    res.status(500).json({ message: 'Error al crear la entrega' });
  }
};
export const obtenerEntregas = async (req: Request, res: Response) => {
  try {
    const entregas = await pool.query('SELECT * FROM entrega_producto');
    res.json(entregas);
  } catch (error) {
    console.error('Error al obtener entregas:', error);
    res.status(500).json({ message: 'Error al obtener entregas' });
  }
};
export const obtenerEntregaPorId = async (req: Request, res: Response) => {
  const { idEntrega } = req.params;
  try {
    const entrega = await pool.query('SELECT * FROM entrega_producto WHERE id_Entrega = ?', [idEntrega]);
    if (Array.isArray(entrega) && entrega.length > 0) {
      res.json(entrega[0]);
    } else {
      res.status(404).json({ message: 'Entrega no encontrada' });
    }
  } catch (error) {
    console.error('Error al obtener entrega:', error);
    res.status(500).json({ message: 'Error al obtener entrega' });
  }
};



export const eliminarEntrega = async (req: Request, res: Response) => {
  const { idEntrega } = req.params;
  try {
    await pool.query('DELETE FROM entrega_producto WHERE id_Entrega = ?', [idEntrega]);
    res.json({ message: 'Entrega eliminada' });
  } catch (error) {
    console.error('Error al eliminar entrega:', error);
    res.status(500).json({ message: 'Error al eliminar entrega' });
  }
};


// Registrar detalles de la entrega
export const registrarDetallesEntrega = async (req: Request, res: Response) => {
  let detalles = req.body;
  console.log('Detalles recibidos:', detalles);

  // Si detalles no es un arreglo, lo convertimos en un arreglo con un solo elemento
  if (!Array.isArray(detalles)) {
    detalles = [detalles];
  }

  try {
    // Usa una transacción para asegurar la integridad
    await pool.query('START TRANSACTION'); // Iniciar transacción

    for (const detalle of detalles) {
      const { id_Entrega, id_Producto, cantidad, total_entrega } = detalle;
      console.log('Insertando detalle:', id_Entrega, id_Producto, cantidad, total_entrega);

      await pool.query(
        'INSERT INTO detalle_entrega (id_Entrega, id_Producto, cantidad, total_entrega) VALUES (?, ?, ?, ?)',
        [id_Entrega, id_Producto, cantidad, total_entrega]
      );
    }

    await pool.query('COMMIT'); // Confirmar transacción
    res.status(200).json({ success: true, message: 'Detalles de entrega registrados con éxito' });
  } catch (error) {
    await pool.query('ROLLBACK'); // Revertir transacción en caso de error
    console.error('Error al registrar los detalles de entrega:', error);
    res.status(500).json({ message: 'Error al registrar los detalles de entrega' });
  }
};