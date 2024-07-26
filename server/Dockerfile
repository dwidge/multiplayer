FROM alpine
RUN apk add --update nodejs npm
WORKDIR /app
COPY package.json .
RUN npm install --omit-dev --ignore-scripts
COPY dist dist
CMD ["node", "dist/index.js"]
EXPOSE 3050
EXPOSE 3051
EXPOSE 3052
