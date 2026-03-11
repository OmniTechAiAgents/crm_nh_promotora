import { DataTypes } from "sequelize";
import db from "../config/db.js";

const ConsultasMargemCLT = db.define(
    "ConsultasMargemCLT",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        cpf: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        numeroInscricaoEmpregador: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        matricula: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        dataAdmissao: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
        valorMargemAvaliavel: {
            type: DataTypes.DECIMAL(15,2),
            allowNull: false,
        },
        valorBaseMargem: {
            type: DataTypes.DECIMAL(15,2),
            allowNull: false,
        },
        valorTotalVencimentos: {
            type: DataTypes.DECIMAL(15,2),
            allowNull: false,
        },
        nomeMae: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        sexo: {
            type: DataTypes.STRING,
            allowNull: false,
        }
    },
    {
        tableName: "consultas_margem_clt",
        timestamps: true
    }
);

export default ConsultasMargemCLT;