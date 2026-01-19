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

        // parte de enredeco
        cep: {
            type: DataTypes.STRING(8),
            allowNull: false
        },

        // parte de celular:
        // celular_procon = celular cadastrado no "não perturbe"?
        // celular_whatsapp: celular cadastrado no whatsapp?
        celular_ddd: {
            type: DataTypes.STRING(3),
            allowNull: false
        },
        celular_numero: {
            type: DataTypes.STRING(9),
            allowNull: false
        },
        celular_procon: {
            type: DataTypes.ENUM("S", "N"),
            allowNull: false
        },
        celular_whatsapp: {
            type: DataTypes.ENUM("S", "N"),
            allowNull: false
        },

        // parte de telefone
        telefone_ddd: {
            type: DataTypes.STRING(3),
            allowNull: false
        },
        telefone_numero: {
            type: DataTypes.STRING(8),
            allowNull: false
        },
        telefone_procon: {
            type: DataTypes.ENUM("S", "N"),
            allowNull: false
        },

        // parte credito
        score_digital: {
            type: DataTypes.STRING(50),
            allowNull:false
        },
        propencao_pagamento: {
            type: DataTypes.INTEGER,
            allowNull: false
        },

        // parte empresa
        empresa_flfgts: {
            type: DataTypes.ENUM("S", "N"),
            allowNull: true
        },
        empresa_valor_presumido: {
            type: DataTypes.INTEGER,
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