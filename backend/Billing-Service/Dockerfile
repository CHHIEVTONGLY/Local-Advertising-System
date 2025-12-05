FROM node:18

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

EXPOSE 13003
CMD ["npm", "run", "dev"]
