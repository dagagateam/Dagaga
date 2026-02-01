FROM python:3.10-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements_gms.txt .
RUN pip install --no-cache-dir -r requirements_gms.txt

COPY gms.py .
COPY .env .

# Expose port
EXPOSE 4000

# Run application
CMD ["uvicorn", "gms:app", "--host", "0.0.0.0", "--port", "4000"]
