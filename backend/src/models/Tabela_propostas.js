import { DataTypes } from 'sequelize';
import db from "../config/db.js"

const Tabela_propostas = db.define(
    "tabela_propostas",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        nome: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        cpf: {
            type: DataTypes.STRING(11),
            allowNull: false,
        },
        cel: {
            type: DataTypes.STRING(15),
            allowNull: false
        },
        data_nascimento: {
            type: DataTypes.DATE,
            allowNull: true
        },
        proposal_id: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        link_form: {
            type: DataTypes.STRING(1024),
            allowNull: false
        },
        valor_liquido: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true
        },
        valor_seguro: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true
        },
        valor_emissao: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true
        },
        contrato: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        numero_contrato: {
            type: DataTypes.STRING(60),
            allowNull: false
        },
        usuario: {
            type: DataTypes.STRING,
            allowNull: false
        },
        banco: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        status_proposta: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        msg_status: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        verificar: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
        data_status: {
            type: DataTypes.DATE,
            allowNull: true
        }
    },
    {
        tableName: "tabela_propostas",
        timestamp: true
    }
)

export default Tabela_propostas;