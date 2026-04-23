# specify a base image
FROM node:latest

# set path for pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

# use pnpm as package manager
RUN corepack enable

# copy from system to docker container
COPY . ./app

# set working directory
WORKDIR /app

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# run a shell command, this command will be executed when the container starts
CMD ["sh", "-c", "pnpm -C packages/apps/${APP} start"]