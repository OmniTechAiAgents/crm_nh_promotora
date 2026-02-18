from app.repositories.csv_repository import csv_repository
from app.utils.enviar_request_node import enviar_request
from app.utils.formatar_data import formatar_data
from app.utils.remover_mascara_cpf import remover_mascara_cpf
import pandas as pd


class consulta_lote_service:
    def __init__(self, id_registro_db, id_promotor, local_path, instituicao):
        self.id_registro_db = id_registro_db
        self.id_promotor = id_promotor
        self.local_path = local_path
        self.instituicao = instituicao
    
    def inciar_consulta_lote(self):
        arquivo_csv = csv_repository(self.local_path)
        csv_df = arquivo_csv.getDataFrame()

        df_consultas_sucesso = pd.DataFrame(columns=["CPF", "Cliente", "Dt Nasc", "Celular", "Cod_retorno", "Mensagem"])
        df_consultas_erro = pd.DataFrame(columns=["CPF", "Cliente", "Dt Nasc", "Celular", "Cod_retorno", "Mensagem"])

        # Verificação da estrutura do arquivo (colunas):
        colunasValidas = {
            "CPF",
            "Cliente",
            "Dt Nasc",
            "Celular"
        }
        colunas_df = set(csv_df.columns)

        colunas_faltando = colunasValidas - colunas_df
        colunas_extras = colunas_df - colunasValidas


        # Verificando a integradade das colunas
        if colunas_faltando or colunas_extras:
            mensagem_erro = "Estrutura do arquivo .csv inválida."

            if colunas_faltando:
                mensagem_erro += f" Colunas faltando: {', '.join(colunas_faltando)}."

            if colunas_extras:
                mensagem_erro += f" Colunas não esperadas: {', '.join(colunas_extras)}."

            body = {
                "id": self.id_registro_db,
                "status": "cancelado",
                "mensagem": mensagem_erro
            }

            arquivo_csv.deleteFile()

            return enviar_request("PATCH", "/microservicos/consultas_lote", body);


        # Verifica se o cliente já existe no banco de dados da API principal
        for index, row in csv_df.iterrows():
            cpf = remover_mascara_cpf(row['CPF'])
            nome = row['Cliente']
            data_nasc = formatar_data(row['Dt Nasc'])
            celular = row['Celular']

            verificar_cliente_existente = enviar_request("GET", "/microservicos/clientes", params={"cpf": cpf}, retornarResponse=True)

            if verificar_cliente_existente.status_code == 204:
                body = {
                    "cpf": cpf,
                    "nome": nome,
                    "data_nasc": data_nasc,
                    "celular": celular
                }
                enviar_request("POST", "/microservicos/clientes", body)
            
            print("tentando fazer a consulta...")

            bodyConsulta = {
                "id_promotor": self.id_promotor,
                "cpf": cpf,
                "instituicao": self.instituicao
            }
            consulta = enviar_request("POST", "/microservicos/consulta/FGTS", bodyConsulta, retornarResponse=True)
            if consulta.status_code == 200:
                df_consultas_sucesso.loc[len(df_consultas_sucesso)] = {
                    "CPF": cpf,
                    "Cliente": nome,
                    "Dt Nasc": data_nasc,
                    "Celular": celular,
                    "Cod_retorno": consulta.status_code,
                    "Mensagem": "Consulta concluída com sucesso."
                }
            else:
                df_consultas_erro.loc[len(df_consultas_erro)] = {
                    "CPF": cpf,
                    "Cliente": nome,
                    "Dt Nasc": data_nasc,
                    "Celular": celular,
                    "Cod_retorno": consulta.status_code,
                    "Mensagem": consulta.json().get("erro")
                }

        arquivo_csv.saveDataFrame(df_consultas_sucesso, f"/sucesso/SUCESSO-{self.local_path}")
        arquivo_csv.saveDataFrame(df_consultas_erro, f"/erro/ERRO-{self.local_path}")

        body = {
            "id": self.id_registro_db,
            "status": "concluido",
            "mensagem": "Consulta em lote concluída com sucesso!"
        }

        return enviar_request("PATCH", "/microservicos/consultas_lote", body);