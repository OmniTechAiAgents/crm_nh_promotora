import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
    // seta o diretório compartilhado pra salvar o arquivo
    destination: function (req, file, cb) {
        cb (null, "csvs_consulta_lote")
    },
    // coloca o nome padrão com a data e hora atual
    filename: function (req, file, cb) {
        const now = new Date();
        const newFormatted = now.toISOString().replace(/[:.]/g, "-");
        
        const uniqueName = `CSV_consulta_em_lote - ${newFormatted}.csv`;
        cb(null, uniqueName)
    }
});

const fileFilter = (req, file, cb) => {
    if (path.extname(file.originalname) !== '.csv') {
        return db(new Error("Só é permitido o envio de arquivos .csv"));
    }
    cb(null, true);
};

export const uploadCsv = multer({
    storage,
    fileFilter
})