from concurrent.futures import ThreadPoolExecutor
from app.services.consulta_lote_service import consulta_lote_service

class gerenciar_jobs:
    def __init__(self):
        self.executor = ThreadPoolExecutor(max_workers=1)

    def criar_job(self, bodyJson):
        self.executor.submit(self.processar_job, bodyJson)

    def processar_job(self, bodyJson):
        id = bodyJson['id']
        id_admin = bodyJson['id_admin']
        id_promotor = bodyJson['id_promotor']
        local_path = bodyJson['local_path']
        instituicao = bodyJson['instituicao']

        consulta_lote = consulta_lote_service(id, id_promotor, local_path, instituicao)
        consulta_lote.inciar_consulta_lote()