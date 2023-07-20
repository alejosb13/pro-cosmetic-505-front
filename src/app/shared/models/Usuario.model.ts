import { Cliente } from "./Cliente.model";
import { Factura } from "./Factura.model";
import { Meta } from "./Meta.model";
import { Producto } from "./Producto.model";
import { Recibo } from "./Recibo.model";
import { ReciboHistorial } from './ReciboHistorial.model';

export interface Usuario {
  id?: number;
  name: string;
  apellido: string;
  cargo: string;
  email: string;
  email_verified_at?: Date;
  estado: number;
  factura: Factura[];
  recibo?: Recibo;
  meta?: Meta;
  ultimo_recibo?: ReciboHistorial;
  clientes?: Cliente[];
  role_id?: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface UsuarioServ { // se usa para insertar o modificar
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  apellido: string;
  cargo: string;
  estado: number;
  role: number;
}

export interface UsuarioProductos { // se usa para insertar o modificar
  cantidad_total: number
  cliente_id: number
  producto_id: number
  user_id: number
  cliente?: Cliente
  usuario?: Usuario
  producto?: Producto
}
