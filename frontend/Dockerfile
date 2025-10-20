# Imagen base compatible con Angular 16
FROM node:16

# Directorio de trabajo
WORKDIR /app

# Copiar dependencias primero
COPY package*.json ./

# Instalar dependencias
RUN npm install -g @angular/cli@16 && npm install

# Copiar el resto del código
COPY . .

# Configurar memoria para compilaciones grandes
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Comando de ejecución
CMD ["npm", "run", "start", "--", "--host", "0.0.0.0", "--port", "4200"]