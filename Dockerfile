FROM node:23

COPY . .

RUN npm i
RUN npx tsc

CMD [ "npm", "run", "start:prod" ]