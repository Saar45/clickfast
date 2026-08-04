# Image de base épinglée : le même Dockerfile produit la même image dans six mois
FROM nginx:1.27.3-alpine

# Un site statique n'a besoin que de ses fichiers : pas de build, pas de dépendances
COPY public/ /usr/share/nginx/html/

EXPOSE 80

# Sonde que nginx sert vraiment la page, pas juste que le conteneur est démarré
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget -qO- http://localhost/ > /dev/null || exit 1
