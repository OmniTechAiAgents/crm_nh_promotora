import { DataTypes } from 'sequelize';
import db from "../config/db.js";
import Usuario from './Usuario.js';

const Tabela_propostas_CLT = db.define(
    "tabela_propostas_CLT",
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
        nome_tabela: {
            type: DataTypes.STRING,
            allowNull: false
        },
        id_proposta: {
            type: DataTypes.STRING,
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

export default Tabela_propostas_CLT;