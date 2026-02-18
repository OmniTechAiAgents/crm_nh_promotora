from datetime import datetime

def formatar_data(data_str) -> str:
    if not data_str:
        return None
    
    try:
        data = datetime.strptime(data_str, "%d/%m/%Y")
        return data.strftime("%Y-%m-%d")
    except ValueError:
        return None