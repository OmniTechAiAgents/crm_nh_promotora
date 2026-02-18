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

            # criar lógica para apagar o arquivo mal-estruturado
            arquivo_csv.deleteFile()

            # retornando erro para a API em NodeJS
            return enviar_request("PATCH", "/microservicos/consultas_lote", body);


        # Verifica se o cliente já existe no banco de dados da API principal
        for index, row in csv_df.iterrows():
            cpf = remover_mascara_cpf(row['CPF'])
            nome = row['Cliente']
            data_nasc = formatar_data(row['Dt Nasc'])
            celular = row['Celular']

            verificar_cliente_existente = enviar_request("GET", f"/microservicos/clientes", params={"cpf": cpf}, retornarResponse=True)

            # print(verificar_cliente_existente.status_code)

            if verificar_cliente_existente.status_code == 204:
                body = {
                    "cpf": cpf,
                    "nome": nome,
                    "data_nasc": data_nasc,
                    "celular": celular
                }
                enviar_request("POST", "/microservicos/clientes", body)
                print(celular)
            
            # continuar aqui