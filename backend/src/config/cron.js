import cron from 'node-cron';
import VCTexServices from '../services/integrations/VCTexServices.js';

async function autenticarVCtex() {
    const tokenVCTex = await VCTexServices.Autenticar();

    console.log(`Cron de auth executado, token: ${tokenVCTex}`);
}

// roda o autenticador ja na subida da API
autenticarVCtex();

cron.schedule("*/115 * * * *", async () => {
    autenticarVCtex();
})