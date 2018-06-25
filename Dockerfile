FROM bonaccorsop/nodejs-boilerplate:lts

ARG buildenv="default"

#Build
COPY . /code

WORKDIR /code

#Debug packages
RUN if [ $buildenv != "local" ]; then set -x && npm install ; fi
