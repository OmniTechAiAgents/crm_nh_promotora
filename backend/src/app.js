// importando as variaveis de ambiente
import 'dotenv/config';
import express from "express";
import AuthRouters from "./routes/AuthRoutes.js";
import ConsultasRoutes from "./routes/ConsultasRoutes.js";
import db from "./config/db.js";
import VCTexServices from './services/integrations/VCTexServices.js';
import NovaVidaService from './services/integrations/NovaVidaService.js';

const app = express();
app.use(express.json());

// rotas
app.use('/auth', AuthRouters);
app.use('/consultas', ConsultasRoutes);

async function bootstrap() {
    try {
        await db.sync();
        console.log("✅ Tabelas sincronizadas com sucesso");

        console.log("🔄 Inicializando tokens de APIs parceiras...");
        await VCTexServices.Autenticar();
        console.log("✅ Token VCTex carregado e agendamento ativo");
        await NovaVidaService.Autenticar();
        console.log("✅ Token NovaVida carregado e agendamento ativo");

        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`🚀 Servidor rodando na porta ${PORT}`);
        });

    } catch (err) {
        console.error("❌ Falha Crítica na inicialização:");
        console.error(err);
        process.exit(1);
    }
}

bootstrap();