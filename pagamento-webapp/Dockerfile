FROM node:20-alpine as builder

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install

COPY . .

RUN npm run build -- --prerender=false

FROM nginx:1.25-alpine

RUN rm /usr/share/nginx/html/index.html

COPY --from=builder /app/dist/pagamento-webapp/browser /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

RUN rm -f /app/proxy.config.json

COPY src/assets/50x.html /usr/share/nginx/html/

COPY src/assets/robots.txt /usr/share/nginx/html/

RUN chmod -R 755 /usr/share/nginx/html && \
    chown -R nginx:nginx /usr/share/nginx/html

EXPOSE 80
