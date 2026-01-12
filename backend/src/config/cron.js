import cron from 'node-cron';
import VCTexServices from '../services/VCTexServices.js';

async function autenticarVCtex() {
    VCTexServices.Autenticar();

    console.log("Cron de auth executado.");
}

// roda o autenticador ja na subida da API
autenticarVCtex();

cron.schedule("*/115 * * * *", async () => {
    autenticarVCtex();
})