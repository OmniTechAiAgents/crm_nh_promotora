// importando as variaveis de ambiente
import 'dotenv/config';
import express from "express";
import AuthRouters from "./routes/AuthRoutes.js";
import ConsultasRoutes from "./routes/ConsultasRoutes.js";
import PropostasRoutes from './routes/PropostasRouter.js';
import UsuariosRoutes from './routes/UsuariosRoutes.js';
import ClientesRoutes from './routes/ClientesRoutes.js';
import db from "./config/db.js";
import VCTexServices from './services/integrations/VCTexServices.js';
import NovaVidaService from './services/integrations/NovaVidaService.js';
import C6Service from './services/integrations/C6Service.js';
import NossaFintechService from './services/integrations/NossaFintechService.js';
import PresencaBankService from './services/integrations/PresencaBankService.js';
import cors from "cors";
import { seedISPBs } from './utils/seedISPBs.js';
import { connectRabbit } from './config/rabbitMQ.js';
import MicroservicesRoutes from './routes/MicroservicesRoutes.js';

const app = express();

// SÓ PARA AMBIENTE DE DEV (sem cors)
app.use(cors());

app.use(express.json());

// rotas
app.use('/auth', AuthRouters);
app.use('/consultas', ConsultasRoutes);
app.use('/propostas', PropostasRoutes);
app.use('/usuarios', UsuariosRoutes);
app.use('/microservicos', MicroservicesRoutes);
app.use('/clientes', ClientesRoutes);

async function bootstrap() {
    try {
        await db.sync();
        console.log("✅ Tabelas sincronizadas com sucesso");

        await connectRabbit();
        // ja tem console.log na função

        await seedISPBs();

        console.log("🔄 Inicializando tokens de APIs parceiras...");

        await VCTexServices.Autenticar();
        console.log("✅ Token VCTex carregado e agendamento ativo");

        await NovaVidaService.Autenticar();
        console.log("✅ Token NovaVida carregado e agendamento ativo");

        await NossaFintechService.Autenticar();
        console.log("✅ Token NossaFintech carregado e agendamento ativo")

        await PresencaBankService.Autenticar();
        console.log("✅ Token PresençaBank carregado e agendamento ativo")

        // DESATIVADO POR ENQUANTO JA QUE O MODULO DA C6 AINDA N ESTA SENDO UTILIZADO
        // await C6Service.Autenticar();
        // console.log("✅ Token C6 carregado e agendamento ativo");

        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`🚀 Servidor rodando na porta ${PORT}`);
        });

        // verificacao de propostas
        if (VCTexServices.getToken() != null) {
            await VCTexServices.VerificarTodasAsPropostas();
            console.log("✅ Todas as propostas pendentes do VCTex foram verificadas");
        }
        if(NossaFintechService.getToken() != null) {
            await NossaFintechService.VerificarTodasAsPropostas();
            console.log("✅ Todas as propostas pendentes da Nossa fintech foram verificadas");
        }
        
    } catch (err) {
        console.error("❌ Falha Crítica na inicialização:");
        console.error(err);
        process.exit(1);
    }
}

bootstrap();