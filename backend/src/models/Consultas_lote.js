import { DataTypes } from 'sequelize';
import db from "../config/db.js";
import Usuario from './Usuario.js';

const Consultas_lote = db.define(
    "Consultas_lote",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        id_admin: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Usuario,
                key: 'id'
            }
        },
        id_promotor: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Usuario,
                key: 'id'
            }
        },
        status: {
            type: DataTypes.ENUM("em_andamento", "cancelado", "concluido"),
            allowNull: false,
            defaultValue: "em_andamento"
        },
        local_path: {
            type: DataTypes.STRING,
            allowNull: false
        }
    },
    {
        tableName: "consultas_lote",
        timestamps: true,
    }
)

Consultas_lote.belongsTo(Usuario, {
    foreignKey: 'id_admin',
    as: 'admin'
});

Consultas_lote.belongsTo(Usuario, {
    foreignKey: 'id_promotor',
    as: 'promotor'
});


export default Consultas_lote;