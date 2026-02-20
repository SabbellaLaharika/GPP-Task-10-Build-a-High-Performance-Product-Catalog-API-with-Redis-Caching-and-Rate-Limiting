# Use official Node.js long-term support image
FROM node:20-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

# Install dependecies
RUN npm install

# Bundle app source
COPY . .

# Expose port
EXPOSE 3000

# Health check dependencies if needed (curl for healthcheck in docker-compose)
RUN apk --no-cache add curl

# Start the application
CMD [ "npm", "start" ]
