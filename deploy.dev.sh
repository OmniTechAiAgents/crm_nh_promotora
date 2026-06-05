#!/bin/bash
set -e

APP_DIR="/home/florindo/crm_nh_promotora"

echo "➡ Indo para o projeto"
cd $APP_DIR

echo "🐳 Parando containers"
docker compose down

echo "🔧 Removendo pasta nginx com permissões travadas"
rm -rf nginx

echo "🧹 Limpando volume do RabbitMQ (mantendo MySQL)"
docker volume rm ${PWD##*/}_rabbitmq_data 2>/dev/null || true

echo "⬇ Atualizando código (forçando estado do repo)"
git fetch origin
git reset --hard origin/homologacao

echo "🐳 Subindo containers"
if ! docker compose up -d --build; then
  echo "❌ Falha ao subir os containers Docker"
  docker compose logs --tail=50
  exit 1
fi

echo "✅ Deploy finalizado com sucesso"

