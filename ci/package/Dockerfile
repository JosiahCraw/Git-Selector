FROM suchja/wine:latest

USER root

RUN curl -sL https://deb.nodesource.com/setup_10.x | bash -
RUN apt-get update -y && apt-get install -y nodejs
RUN npm install -g electron-packager
RUN apt-get update -y && apt-get install -y zip

