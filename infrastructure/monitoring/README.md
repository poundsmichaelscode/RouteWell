# Monitoring

Local Docker Compose exposes Prometheus on `127.0.0.1:9090` and Grafana on `127.0.0.1:3001`. Production uses Azure Monitor Agent, a Data Collection Rule, Log Analytics, Application Gateway diagnostics, VM metrics, and CPU alerts. Containers log structured output through the `journald` Docker driver so host-level collection can ingest service logs.
