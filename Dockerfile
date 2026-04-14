FROM nginx:alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy all static files
COPY index.html overlay.html style.css overlay.css site.css overlay.js site.js /usr/share/nginx/html/
COPY images/ /usr/share/nginx/html/images/

EXPOSE 80
