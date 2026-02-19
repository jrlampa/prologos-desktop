# Builder Stage
FROM python:3.11-slim as builder

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# Final Stage
FROM python:3.11-slim as runner

WORKDIR /app

# Security: Create a non-root user
RUN groupadd -r prologos && useradd -r -g prologos prologos \
    && mkdir -p /app/backend \
    && chown -R prologos:prologos /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PATH="/home/prologos/.local/bin:${PATH}"

# Copy installed packages from builder
COPY --from=builder /root/.local /home/prologos/.local
COPY --from=builder /app/requirements.txt /app/backend/requirements.txt

# Copy source code and set ownership
COPY --chown=prologos:prologos backend/ /app/backend/

USER prologos

ENV PORT=8000
EXPOSE 8000

CMD ["python", "-m", "uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
