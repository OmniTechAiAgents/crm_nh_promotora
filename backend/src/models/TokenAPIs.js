import { DataTypes } from 'sequelize';
import db from '../config/db.js';

const TokenAPIs = db.define(
    "TokenAPIs",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        nome_api: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: false,
        },
        tipo_api: {
            type: DataTypes.ENUM("fgts", "clt"),
            allowNull: false,
            unique: false,
        },
        access_token: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: false,
        },
        expires: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: false
        }
    },
    {
        tableName: "token_apis",
        timestamp: true
    }
)

export default TokenAPIs;