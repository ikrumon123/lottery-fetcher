import requests
import json
import os

BASE_URL = os.environ.get("LOTTERY_BASE_URL")
FILE_NAME = "results.json"

def get_data():
    # 1. Load existing data from your repo
    if os.path.exists(FILE_NAME):
        with open(FILE_NAME, "r") as f:
            try:
                local_data = json.load(f)
            except:
                local_data = []
    else:
        local_data = []

    # 2. INITIAL SETUP: If your file is empty, fetch History first
    if not local_data:
        print("Empty file detected. Fetching history...")
        # Get last 50 draws to start your database
        history_resp = requests.get(f"{BASE_URL}/history?limit=50")
        if history_resp.status_code == 200:
            local_data = history_resp.json().get('items', [])
            with open(FILE_NAME, "w") as f:
                json.dump(local_data, f, indent=2)
            print("History synced successfully.")
            return True

    # 3. DAILY UPDATE: Fetch the Latest result
    latest_resp = requests.get(f"{BASE_URL}/latest")
    if latest_resp.status_code == 200:
        latest = latest_resp.json()
        
        # Check if we already have this draw_code
        if not any(item.get('draw_code') == latest['draw_code'] for item in local_data):
            print(f"New draw found: {latest['draw_code']}. Adding to top.")
            local_data.insert(0, latest)
            # Keep the last 100 draws total
            local_data = local_data[:100]
            
            with open(FILE_NAME, "w") as f:
                json.dump(local_data, f, indent=2)
            return True
        else:
            print("No new results yet.")
            return False
    return False

if __name__ == "__main__":
    get_data()
