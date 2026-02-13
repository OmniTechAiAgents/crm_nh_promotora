from app.repositories.csv_repository import csv_repository
import pandas as pd

class consulta_lote_service:
    def __init__(self, id_registro_db, id_promotor, local_path, instituicao):
        self.id_registro_db = id_registro_db
        self.id_promotor = id_promotor
        self.local_path = local_path
        self.instituicao = instituicao
    
    def inciar_consulta_lote(self):
        csv_df = csv_repository(self.local_path).getDataFrame()

        # Verificação da estrutura do arquivo (colunas):
        colunasValidas = {
            "CPF",
            "Cliente",
            "Dt Nasc",
            "Celular"
        }
        colunas_df = set(csv_df.columns)
        if (colunas_df != colunasValidas):
            print("COLUNAS ERRADAS, RETORNAR ERRO.")
        else:
            print("Colunas certas.")

