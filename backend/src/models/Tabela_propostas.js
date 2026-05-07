import { DataTypes } from 'sequelize';
import db from "../config/db.js";
import Usuario from './Usuario.js';
import Clientes from './Clientes.js';

const Tabela_propostas = db.define(
    "tabela_propostas",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        cliente_id: {
            type:DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Clientes,
                key: "id"
            }
        },
        proposal_id: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        link_form: {
            type: DataTypes.STRING(1024),
            allowNull: true
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
        usuario_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'usuarios',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
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
            type: DataTypes.STRING,
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
        },
        API: {
            type: DataTypes.STRING(50),
            allowNull: false
        }
    },
    {
        tableName: "tabela_propostas",
        timestamp: true
    }
)

Tabela_propostas.belongsTo(Usuario, {
    foreignKey: 'usuario_id',
    as: 'usuario'
});

Usuario.hasMany(Tabela_propostas, {
    foreignKey: 'usuario_id'
});

Tabela_propostas.belongsTo(Clientes, {
    foreignKey: "cliente_id",
    as: "cliente"
});

export default Tabela_propostas;