import os
from dotenv import load_dotenv
import pandas as pd

load_dotenv()

default_path = os.getenv("default_path_csvs")
print(default_path)

class csv_repository:
    def __init__ (self, local_path):
        # local_path = nome do arquivo, deixei assim para manter o pattern
        self.local_path = local_path
    
    def getDataFrame(self):
        print(self.local_path)

        return pd.read_csv(f"{default_path}/{self.local_path}", sep=";");