import { DataTypes, Sequelize } from 'sequelize';
import db from '../config/db.js';

const Clientes = db.define(
    "Clientes",
    {
        // parte de cadastro
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        cpf: {
            type: DataTypes.STRING(11),
            allowNull: false,
            unique: true
        },
        nome: {
            type: DataTypes.STRING(75),
            allowNull: false
        },
        data_nasc: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        celular: {
            type: DataTypes.STRING(12),
            allowNull: false
        }
    },
    {
        tableName: "clientes",
        timestamps: false
    }
)

export default Clientes;