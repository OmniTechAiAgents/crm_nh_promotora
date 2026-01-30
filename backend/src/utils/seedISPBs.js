import ISPB_consulta from "../models/ISPB_consulta.js";
import { runSqlFile } from "./runSqlFile.js";

export async function seedISPBs() {
    const count = await ISPB_consulta.count();


    if (count > 0) {
        console.log("✅ Tabela ISPBs já populada.");
        return;
    }

    console.log("📥 Populando tabela de instituições...");
    await runSqlFile("ISPB_consulta.sql");
    console.log("✅ Instituições inseridas com sucesso");
}