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
        nome_mae: {
            type: DataTypes.STRING(75),
            allowNull: false
        },
        sexo: {
            // O = outros
            type: DataTypes.ENUM("M", "F", "O"),
            allowNull: false
        },
        data_nasc: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },

        // parte de endereco
        cep: {
            type: DataTypes.STRING(8),
            allowNull: false
        },

        // parte de celular:
        // celular_procon = celular cadastrado no "não perturbe"?
        // celular_whatsapp: celular cadastrado no whatsapp?
        celular_ddd: {
            type: DataTypes.STRING(3),
            allowNull: true
        },
        celular_numero: {
            type: DataTypes.STRING(9),
            allowNull: true
        },
        celular_procon: {
            type: DataTypes.ENUM("S", "N"),
            allowNull: true
        },
        celular_whatsapp: {
            type: DataTypes.ENUM("S", "N"),
            allowNull: true
        },

        // parte de telefone
        telefone_ddd: {
            type: DataTypes.STRING(3),
            allowNull: true
        },
        telefone_numero: {
            type: DataTypes.STRING(8),
            allowNull: true
        },
        telefone_procon: {
            type: DataTypes.ENUM("S", "N"),
            allowNull: true
        },

        // parte credito
        score_digital: {
            type: DataTypes.STRING(50),
            allowNull: true
        },
        propencao_pagamento: {
            type: DataTypes.INTEGER,
            allowNull: true
        },

        // parte empresa
        empresa_flfgts: {
            type: DataTypes.ENUM("S", "N"),
            allowNull: true
        },
        empresa_valor_presumido: {
            type: DataTypes.STRING(20),
            allowNull: true
        },
        empresa_probabilidade_saque: {
            type: DataTypes.ENUM("S", "N"),
            allowNull: true
        },
        empresa_cnpj: {
            type: DataTypes.STRING(14),
            allowNull: true
        },
        empresa_razao: {
            type: DataTypes.STRING(75),
            allowNull:true
        }
    },
    {
        tableName: "clientes",
    }
)

export default Clientes;