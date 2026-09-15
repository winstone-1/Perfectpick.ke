# ─────────────────────────────────────────────────
# Stage 1 — deps
# Install production dependencies only.
# Using --mount=type=cache keeps the npm cache between
# Docker BuildKit builds (faster rebuilds).
# ─────────────────────────────────────────────────
FROM node:20-alpine AS deps

WORKDIR /app

# Copy only the manifest files so this layer is cached
# until package-lock.json changes.
COPY package.json package-lock.json ./

RUN --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev --ignore-scripts

# ─────────────────────────────────────────────────
# Stage 2 — runtime
# Pure runtime image — no devDeps, no build tools,
# no .env files, no secrets.
# ─────────────────────────────────────────────────
FROM node:20-alpine AS runtime

# Best practice: run as non-root
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copy production node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy the application source (src/, index.js, Procfile, etc.)
# The .dockerignore excludes .env, .git, node_modules, etc.
COPY . .

# Express listens on PORT; default 3000 matches Railway convention.
# Do NOT hardcode PORT — always set it at runtime.
EXPOSE 3000

USER appuser

# index.js is the entry point defined in package.json "main"
CMD ["node", "index.js"]
