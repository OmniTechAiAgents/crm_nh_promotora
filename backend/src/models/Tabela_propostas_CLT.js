import { DataTypes } from 'sequelize';
import db from "../config/db.js";
import Usuario from './Usuario.js';
import Clientes from './Clientes.js';

const Tabela_propostas_CLT = db.define(
    "tabela_propostas_CLT",
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
        nome_tabela: {
            type: DataTypes.STRING,
            allowNull: false
        },
        id_proposta: {
            type: DataTypes.STRING,
            allowNull: false
        },
        link_form: {
            type: DataTypes.STRING(1024),
            allowNull: true
        },
        contrato: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        numero_contrato: {
            type: DataTypes.STRING(60),
            allowNull: true
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
        qtd_parcelas: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        valor_parcelas: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        taxa_juros_mensal: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        valor_solicitado: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        valor_liberado: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        status_nome: {
            type: DataTypes.STRING,
            allowNull: true
        },
        status_id: {
            type: DataTypes.STRING,
            allowNull: true
        },
        produto_nome: {
            type: DataTypes.STRING,
            allowNull: true
        },
        produto_id: {
            type: DataTypes.STRING,
            allowNull: true
        },
        status_historicos: {
            type: DataTypes.JSON,
            allowNull: true,
            defaultValue: null
        },
        verificar: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
        banco: {
            type: DataTypes.STRING(255),
            defaultValue: null,
        },
        API: {
            type: DataTypes.STRING(50),
            allowNull: false
        }
    },
    {
        tableName: "tabela_propostas_clt",
        timestamps: true
    }
)

Tabela_propostas_CLT.belongsTo(Usuario, {
    foreignKey: 'usuario_id',
    as: 'usuario'
});

Usuario.hasMany(Tabela_propostas_CLT, {
    foreignKey: 'usuario_id'
});

Tabela_propostas_CLT.belongsTo(Clientes, {
    foreignKey: "cliente_id",
    as: "cliente"
});

export default Tabela_propostas_CLT;