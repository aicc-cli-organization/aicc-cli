FROM alpine:3.6

MAINTAINER Laphets

RUN apk update
RUN apk add --no-cache rsync openssh