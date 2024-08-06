FROM lipanski/docker-static-website:2.3.1
COPY dist .
CMD ["/busybox-httpd", "-f", "-v", "-p", "80", "-c", "httpd.conf"]
EXPOSE 80
