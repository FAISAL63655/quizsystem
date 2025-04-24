FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production
ENV SKIP_ESLINT 1
ENV DISABLE_ESLINT_PLUGIN true
ENV NEXT_PUBLIC_SUPABASE_URL https://aimzresxqchycswspxnj.supabase.co
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpbXpyZXN4cWNoeWNzd3NweG5qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU0OTczNTcsImV4cCI6MjA2MTA3MzM1N30.SeC3DrDrMTN0-jg5OZTbRmVb_4ecIgvThZlcfqedvOE

# Build the application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1
ENV NEXT_PUBLIC_SUPABASE_URL https://aimzresxqchycswspxnj.supabase.co
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpbXpyZXN4cWNoeWNzd3NweG5qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU0OTczNTcsImV4cCI6MjA2MTA3MzM1N30.SeC3DrDrMTN0-jg5OZTbRmVb_4ecIgvThZlcfqedvOE

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/next-config-js/output
CMD ["node", "server.js"]
