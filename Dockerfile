FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm cache clean --force && npm install --legacy-peer-deps
EXPOSE 3000
CMD ["node", "index.js"]
