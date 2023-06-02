import { Categoria } from "app/shared/models/Categoria.model";
import { Factura } from "app/shared/models/Factura.model";
import { Frecuencia } from "app/shared/models/Frecuencia.model";
import { FacturaHistorial } from "./FacturaHistorial.model";
import { Usuario } from "./Usuario.model";

export interface Cliente {
    id?: number;
    categoria_id: number;
    frecuencia_id: number|null;
    user_id: number;
    nombreCompleto: string;
    nombreEmpresa: string;
    celular: number;
    telefono: number;
    direccion_casa: string;
    direccion_negocio: string;
    cedula: string;
    dias_cobro: string;
    fecha_vencimiento: string;
    saldo?: string;
    frecuencia?: Frecuencia;
    categoria?: Categoria;
    facturas?: Factura[];
    factura_historial?: FacturaHistorial[];
    usuario?: Usuario;
    estado: number;
    created_at?: Date;
    updated_at?: Date;
}


export interface ClienteCheck extends Cliente{
    checked:boolean;
}


