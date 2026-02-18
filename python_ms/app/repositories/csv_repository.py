import os
from dotenv import load_dotenv
import pandas as pd

load_dotenv()

default_path = os.getenv("default_path_csvs")

class csv_repository:
    def __init__ (self, local_path):
        # local_path = nome do arquivo, deixei assim para manter o pattern
        self.local_path = local_path
    
    def getDataFrame(self):
        path = os.path.join(default_path, self.local_path)

        df = pd.read_csv(path, sep=";", dtype={"CPF": str, "Cliente": str, "Dt Nasc": str, "Celular": str})

        # converte "" para NaN
        df.replace("", pd.NA, inplace=True)

        # remove linhas totalmente vazias
        df.dropna(how="all", inplace=True)

        # reseta índice
        df.reset_index(drop=True, inplace=True)

        return df

    def deleteFile(self):
        path = f"{default_path}/{self.local_path}"

        if os.path.exists:
            os.remove(path)
        else:
            print(f"Arquivo no seguinte caminho não foi encontrado {path}")

    def saveDataFrame(self, df, local_path):
        path = os.path.join(default_path, local_path)

        # garante que o diretório base exista
        os.makedirs(default_path, exist_ok=True)

        df.to_csv(
            path,
            sep=";",
            index=False,
            encoding="utf-8-sig"
        )

        print(f"CSV salvo com sucesso em: {path}")