#SPECIFY A BASE IMAGE
FROM node:alpine

#Install some dependencies
COPY ./ ./
RUN npm install

COPY . .

EXPOSE 8080

#default commmand
CMD ["npm", "start"]