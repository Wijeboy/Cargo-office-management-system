FROM node:20-alpine

WORKDIR /app

# Install OpenSSL required by Prisma engine on Alpine Linux
RUN apk add --no-cache openssl

# Copy package files and prisma directory
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies and generate Prisma Client
RUN npm install
RUN npx prisma generate

# Copy the rest of the backend application code
COPY . .

# Set default PORT environment variable and expose port 5000
ENV PORT=5000
EXPOSE 5000

# Push schema to database and start server
CMD ["sh", "-c", "npx prisma db push && node server.js"]
