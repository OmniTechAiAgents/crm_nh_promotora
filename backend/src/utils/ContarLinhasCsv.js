import fs from 'fs';
import readline from 'readline';

async function contarLinhasCSV(filePath) {
    let totalLinhas = 0;

    const readStream = fs.createReadStream(filePath);
    
    const rl = readline.createInterface({
        input: readStream,
        terminal: false
    });

    for await (const line of rl) {
        if (line.trim()) {
            totalLinhas++;
        }
    }

    return totalLinhas;
}

export default contarLinhasCSV;