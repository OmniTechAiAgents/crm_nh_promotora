import { DataTypes } from 'sequelize';
import db from '../config/db.js';

const Usuario = db.define(
    "Usuario",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        role: {
            type: DataTypes.ENUM("promotor", "admin"),
            allowNull: false,
            defaultValue: "promotor",
        },
    },
    {
        tableName: "usuarios",
        timestamp: false
    }
);

export default Usuario;