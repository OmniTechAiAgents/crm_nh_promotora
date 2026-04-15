import { DataTypes } from 'sequelize';
import db from '../config/db.js';
import Clientes from './Clientes.js';

const ConsultasCLTPython = db.define(
    "consultasCLTPython",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        cliente_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Clientes,
                key: "id"
            }
        },
        valor_parcela: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
        },
        valor_solicitado: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
        },
        qtd_parcelas: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        cnpj: {
            type: DataTypes.STRING(18),
            allowNull: true,
        },
        empresa: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        instituicao: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        ofertado: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        }
    },
    {
        tableName: "consultasCLTPython",
        timestamps: true
    }
)

ConsultasCLTPython.belongsTo(Clientes, {
    foreignKey: "cliente_id",
    as: "cliente"
})

export default ConsultasCLTPython;