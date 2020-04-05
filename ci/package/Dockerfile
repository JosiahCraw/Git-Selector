FROM muojp/wine64:latest

USER root

RUN apt-get update -y && apt-get install -y curl
RUN curl -sL https://deb.nodesource.com/setup_10.x | bash -
RUN apt-get update -y && apt-get install -y nodejs
RUN npm install -g electron-packager
RUN npm install -g electron
RUN apt-get update -y && apt-get install -y zip