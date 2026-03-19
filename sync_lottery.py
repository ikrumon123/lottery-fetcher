import requests
import json
import os

BASE_URL = os.environ.get("LOTTERY_BASE_URL")
FILE_NAME = "results.json"


def fetch_json(url):
    try:
        res = requests.get(url, headers={
            "Cache-Control": "no-cache",
            "Pragma": "no-cache"
        }, timeout=10)

        if res.status_code != 200:
            print(f"Request failed: {res.status_code}")
            return None

        return res.json()

    except Exception as e:
        print("Request error:", e)
        return None


def load_local_data():
    if os.path.exists(FILE_NAME):
        try:
            with open(FILE_NAME, "r") as f:
                return json.load(f)
        except Exception as e:
            print("Error reading local file:", e)
            return []
    return []


def save_data(data):
    with open(FILE_NAME, "w") as f:
        json.dump(data, f, indent=2)


def initial_sync():
    print("Empty file detected. Fetching history...")
    data = fetch_json(f"{BASE_URL}/history?limit=50")

    if data and "items" in data:
        save_data(data["items"])
        print("History synced.")
        return True

    print("Failed to fetch history.")
    return False


def update_latest(local_data):
    latest = fetch_json(f"{BASE_URL}/latest")

    if not latest:
        print("Failed to fetch latest.")
        return False

    # 🔍 Check if draw exists
    for i, item in enumerate(local_data):
        if item.get("draw_code") == latest.get("draw_code"):

            # 🔥 If same draw but data changed → update
            if item != latest:
                print(f"Updating existing draw: {latest['draw_code']}")
                local_data[i] = latest
                save_data(local_data)
                return True
            else:
                print("No changes in latest draw.")
                return False

    # 🆕 New draw
    print(f"New draw found: {latest['draw_code']}")
    local_data.insert(0, latest)

    # Keep max 100
    local_data = local_data[:100]

    save_data(local_data)
    return True


def main():
    if not BASE_URL:
        print("ERROR: BASE_URL not set")
        return

    local_data = load_local_data()

    if not local_data:
        return initial_sync()

    return update_latest(local_data)


if __name__ == "__main__":
    main()
