import { DataTypes } from 'sequelize';
import db from '../config/db.js';

const ISPB_consulta = db.define (
    "ISPB_consulta",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        ISPB: {
            type: DataTypes.STRING(20),
            allowNull: false,
        },
        banco: {
            type: DataTypes.STRING(200),
            allowNull: false,
        },
        num_cod: {
            type: DataTypes.STRING(4),
            allowNull: true,
            defaultValue: null
        }
    },
    {
        tableName: "ISPB_consulta",
        timestamps: false
    }
)

export default ISPB_consulta;