import { DataTypes } from 'sequelize';
import db from '../config/db.js';

const Clientes = db.define(
    "Clientes",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        provider: {
            type: DataTypes.STRING(20),
            allowNull: false,
            defaultValue: 'nova_vida'
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
            type: DataTypes.JSON,
            allowNull: true
        },
        sexo: {
            type: DataTypes.STRING(1),
            allowNull: true
        },
        nome_mae: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        falecido: {
            type: DataTypes.BOOLEAN,
            allowNull: true
        },
        situacao_cpf: {
            type: DataTypes.STRING(20),
            allowNull: true
        },
        renda: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true
        },
        ocupacao: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        emails: {
            type: DataTypes.JSON,
            allowNull: true
        },
        enderecos: {
            type: DataTypes.JSON,
            allowNull: true
        },
        carros: {
            type: DataTypes.JSON,
            allowNull: true
        },
        vinculos: {
            type: DataTypes.JSON,
            allowNull: true
        },
        risco_credito: {
            type: DataTypes.JSON,
            allowNull: true
        }
    },
    {
        tableName: "clientes",
        timestamps: false
    }
);

export default Clientes;