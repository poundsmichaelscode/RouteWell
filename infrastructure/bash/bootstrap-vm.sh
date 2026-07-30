#!/usr/bin/env bash
set -Eeuo pipefail

if [[ ${EUID} -ne 0 ]]; then
  echo "Run this script with sudo." >&2
  exit 1
fi

apt-get update
apt-get install -y ca-certificates curl git jq unzip rsyslog
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
chmod a+r /etc/apt/keyrings/docker.asc
. /etc/os-release
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu ${VERSION_CODENAME} stable" > /etc/apt/sources.list.d/docker.list
apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
curl -sL https://aka.ms/InstallAzureCLIDeb | bash
install -d -m 0700 /opt/routewell/secrets
cat >/etc/docker/daemon.json <<'JSON'
{"log-driver":"journald","live-restore":true,"no-new-privileges":true}
JSON
systemctl enable --now docker rsyslog
systemctl restart docker
usermod -aG docker "${SUDO_USER:-azureadmin}" || true
echo "VM bootstrap complete. Sign out and back in before using Docker without sudo."
