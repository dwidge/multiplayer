FROM alpine as builder
ARG PUBLIC_URL /.
RUN echo "E404:.$PUBLIC_URL/index.html" >> httpd.conf

FROM lipanski/docker-static-website:2.3.1
ARG PUBLIC_URL /.
COPY --from=builder httpd.conf .
COPY dist .$PUBLIC_URL
CMD ["/busybox-httpd", "-f", "-v", "-p", "80", "-c", "httpd.conf"]
EXPOSE 80
