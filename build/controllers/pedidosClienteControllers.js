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
exports.eliminarDireccionPago = exports.actualizarDireccionPago = exports.obtenerDireccionPagoPorId = exports.obtenerDireccionesPago = exports.registrarDireccionPago = void 0;
const database_1 = __importDefault(require("../database")); // Asegúrate de que tu archivo de conexión a la base de datos esté correctamente configurado
// Registrar una nueva dirección de pago
const registrarDireccionPago = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id_Cliente, direccion, ciudad, codigoPostal } = req.body;
    try {
        const result = yield database_1.default.query('INSERT INTO direccion_pago (id_Cliente, direccion, ciudad, codigoPostal) VALUES (?, ?, ?, ?)', [id_Cliente, direccion, ciudad, codigoPostal]);
        const lastId = result.insertId;
        res.json({ idDireccionPago: lastId });
    }
    catch (error) {
        console.error('Error al registrar dirección de pago:', error);
        res.status(500).json({ message: 'Error al registrar dirección de pago' });
    }
});
exports.registrarDireccionPago = registrarDireccionPago;
// Obtener todas las direcciones de pago
const obtenerDireccionesPago = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const direcciones = yield database_1.default.query('SELECT * FROM direccion_pago');
        res.json(direcciones);
    }
    catch (error) {
        console.error('Error al obtener direcciones de pago:', error);
        res.status(500).json({ message: 'Error al obtener direcciones de pago' });
    }
});
exports.obtenerDireccionesPago = obtenerDireccionesPago;
// Obtener una dirección de pago por ID
const obtenerDireccionPagoPorId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { idDireccionPago } = req.params;
    try {
        const direccion = yield database_1.default.query('SELECT * FROM direccion_pago WHERE id_Direccion_Pago = ?', [idDireccionPago]);
        if (Array.isArray(direccion) && direccion.length > 0) {
            res.json(direccion[0]);
        }
        else {
            res.status(404).json({ message: 'Dirección de pago no encontrada' });
        }
    }
    catch (error) {
        console.error('Error al obtener dirección de pago:', error);
        res.status(500).json({ message: 'Error al obtener dirección de pago' });
    }
});
exports.obtenerDireccionPagoPorId = obtenerDireccionPagoPorId;
// Actualizar una dirección de pago
const actualizarDireccionPago = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { idDireccionPago } = req.params;
    const { direccion, ciudad, codigoPostal } = req.body;
    try {
        yield database_1.default.query('UPDATE direccion_pago SET direccion = ?, ciudad = ?, codigoPostal = ? WHERE id_Direccion_Pago = ?', [direccion, ciudad, codigoPostal, idDireccionPago]);
        res.json({ message: 'Dirección de pago actualizada correctamente' });
    }
    catch (error) {
        console.error('Error al actualizar dirección de pago:', error);
        res.status(500).json({ message: 'Error al actualizar dirección de pago' });
    }
});
exports.actualizarDireccionPago = actualizarDireccionPago;
// Eliminar una dirección de pago
const eliminarDireccionPago = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { idDireccionPago } = req.params;
    try {
        yield database_1.default.query('DELETE FROM direccion_pago WHERE id_Direccion_Pago = ?', [idDireccionPago]);
        res.json({ message: 'Dirección de pago eliminada' });
    }
    catch (error) {
        console.error('Error al eliminar dirección de pago:', error);
        res.status(500).json({ message: 'Error al eliminar dirección de pago' });
    }
});
exports.eliminarDireccionPago = eliminarDireccionPago;
