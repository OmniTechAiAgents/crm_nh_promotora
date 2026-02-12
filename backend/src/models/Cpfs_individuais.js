import { DataTypes, Sequelize } from 'sequelize';
import db from '../config/db.js';
import Usuario from './Usuario.js';

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
        valor_bruto: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
            defaultValue: null
        },
        valor_liquido: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
            defaultValue: null
        },
        valor_tac: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
            defaultValue: null
        },
        valor_seguro: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
            defaultValue: null
        },
        tabela : {
            type: DataTypes.STRING(100),
            allowNull: true,
            defaultValue: null
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
        chave: {
            type: DataTypes.STRING(50),
            allowNull: true,
            defaultValue: null
        },
        banco: {
            type: DataTypes.STRING(50),
            allowNull: true,
            defaultValue: null
        },
        mensagem: {
            type: DataTypes.STRING,
            allowNull: false
        },
        elegivelProposta: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        },
        API: {
            type: DataTypes.STRING(50),
            allowNull: false
        }
    },
    {
        tableName: "cpfs_individuais",
        timestamp: true
    }
);

Cpfs_individuais.belongsTo(Usuario, {
    foreignKey: 'usuario_id',
    as: 'usuario'
});

Usuario.hasMany(Cpfs_individuais, {
    foreignKey: 'usuario_id'
});

export default Cpfs_individuais;
