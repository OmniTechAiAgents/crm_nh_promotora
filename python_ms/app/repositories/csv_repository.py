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
        
        encodings = ['utf-8', 'latin1', 'iso-8859-1', 'cp1252']
        df = None

        for enc in encodings:
            try:
                # O parâmetro 'errors="strict"' força a exceção se o encoding estiver errado
                df = pd.read_csv(
                    path, 
                    sep=";", 
                    dtype={"CPF": str, "Cliente": str, "Dt Nasc": str, "Celular": str},
                    encoding=enc
                )
                # Se chegou aqui sem erro, deu certo. Podemos sair do loop.\
                print(f"Sucesso ao ler com encoding: {enc}")
                break
            except (UnicodeDecodeError, ValueError):
                continue  # Tenta o próximo da lista
            except Exception as e:
                print(f"Erro crítico no arquivo {path}: {e}")
                return None
        
        if df is None:
            print(f"Falha total: Nenhum encoding compatível para o arquivo {path}")
            return None

        # Processamento posterior
        df.replace("", pd.NA, inplace=True)
        df.dropna(how="all", inplace=True)
        df.reset_index(drop=True, inplace=True)

        return df

    def deleteFile(self):
        path = f"{default_path}/{self.local_path}"

        if os.path.exists:
            os.remove(path)
        else:
            print(f"Arquivo no seguinte caminho não foi encontrado {path}")

    def saveDataFrame(self, df, subpath):
        try:
            path = os.path.join(f"{default_path}/{subpath}", self.local_path)

            # garante que o diretório base exista
            os.makedirs(f"{default_path}/{subpath}", exist_ok=True)

            df.to_csv(
                path,
                sep=";",
                index=False,
                encoding="utf-8-sig"
            )

            # print(f"CSV salvo com sucesso em: {path}")
        except Exception as e:
            print(f"Erro ao salvar o dataframe:")
            print(e)