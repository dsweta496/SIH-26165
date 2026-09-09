# Udyam AI ML Service

Standalone FastAPI wrapper around the supplied Udyam AI inference checkpoint.

## Run locally

### 1. Create environment

```bash
python -m venv .venv
```

Windows:

```bash
.venv\\Scripts\\activate
```

macOS/Linux:

```bash
source .venv/bin/activate
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Start service

From this `ml-service` directory:

```bash
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

The first startup may take time because the MuRIL tokenizer/model may need to be downloaded from Hugging Face and the checkpoint must be loaded into memory.

## Endpoints

### Health

`GET /health`

### Analyze report

`POST /analyze-report`

```json
{
  "report_text": "During maintenance inside the confined space, gas testing was not completed before entry."
}
```

The endpoint returns the result dictionary produced by the supplied `analyze_report()` implementation.

## Important

Do not move the model/artifact files out of `model/`. The startup loader uses paths relative to this service, so it no longer depends on the ML team's Colab/Google Drive path.
