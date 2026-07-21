"""Optional: pull the raw dataset from Kaggle instead of supplying a CSV.

Not required to run the pipeline — data/raw/amazon_delivery.csv can be
supplied manually (e.g. downloaded from the Kaggle UI). This script is
here for reproducibility if you do have a Kaggle API token.

Requires `pip install kaggle` and a kaggle.json token at
~/.kaggle/kaggle.json (never commit this file — it's gitignored).
"""

import zipfile
from pathlib import Path

DATASET = "sujalsuthar/amazon-delivery-dataset"
DEST_DIR = Path("data/raw")


def download():
    from kaggle.api.kaggle_api_extended import KaggleApi

    api = KaggleApi()
    api.authenticate()

    DEST_DIR.mkdir(parents=True, exist_ok=True)
    api.dataset_download_files(DATASET, path=str(DEST_DIR), quiet=False)

    zip_path = DEST_DIR / f"{DATASET.split('/')[-1]}.zip"
    if zip_path.exists():
        with zipfile.ZipFile(zip_path) as zf:
            zf.extractall(DEST_DIR)
        zip_path.unlink()

    print(f"Downloaded dataset to {DEST_DIR}")


if __name__ == "__main__":
    download()
