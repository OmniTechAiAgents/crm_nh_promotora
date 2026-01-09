import { DataTypes, Sequelize } from 'sequelize';
import db from '../config/db.js';

const Cpfs_individuais = db.define(
    "Cpfs_individuais",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        cpf: {
            type: DataTypes.STRING(14),
            allowNull: false,
        },
        anuidades: {
            type: DataTypes.JSON,
            allowNull: true,
            defaultValue: null
        },
        saldo: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
            defaultValue: null
        },
        tabela : {
            type: DataTypes.STRING(100),
            allowNull: true,
            defaultValue: null
        },
        usuario: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        chave: {
            type: DataTypes.STRING(50),
            allowNull: true,
            defaultValue: null
        },
        banco: {
            type: DataTypes.STRING(50),
            allowNull: true,
            defaultValue: null
        }
    },
    {
        tableName: "cpfs_individuais",
        timestamp: true
    }
);

export default Cpfs_individuais;
