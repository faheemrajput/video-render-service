# official Node 18 + latest FFmpeg
FROM jrottenberg/ffmpeg:5-alpine

# install Node.js
RUN apk add --no-cache nodejs npm

WORKDIR /app

# copy package files first (for layer cache)
COPY package*.json ./
RUN npm ci --only=production

# copy your code
COPY . .

# expose port that our render.js listens on
EXPOSE 3000

# start the service
CMD ["node", "render.js"]
