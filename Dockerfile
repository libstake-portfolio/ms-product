# syntax=docker/dockerfile:1

FROM node:22-alpine AS base
# Installed directly rather than through corepack, which rejects the version range package.json declares.
# Keep this pin inside that range.
ARG PNPM_VERSION=11.22.0
RUN npm install --global pnpm@${PNPM_VERSION}
WORKDIR /app

# Dependencies resolve in their own layer so editing source does not reinstall them.
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

FROM deps AS build
COPY . .
RUN pnpm build

FROM base AS prod-deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
# Lifecycle scripts are skipped because they exist for development and their tooling is absent here.
RUN pnpm install --frozen-lockfile --prod --ignore-scripts

# Watch mode expects the source to be mounted over this stage.
FROM deps AS dev
# Restarting on a change means killing the previous process tree, which is looked up through ps.
# The built-in one does not take the flags that lookup uses.
RUN apk add --no-cache procps
CMD ["pnpm", "start:dev"]

# Starts from the bare image rather than the build base, which carries a package manager the runtime never uses.
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=prod
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json ./
USER node
EXPOSE 3000
# Invoked without a shell so the process receives termination signals directly.
CMD ["node", "dist/main"]
