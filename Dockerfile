# Builder stage
FROM node:lts AS builder

WORKDIR /app

# Copy the application code
COPY . .

# Install dependencies
RUN yarn install


# Generate Prisma client
RUN yarn prisma migrate dev
RUN yarn prisma generate

# Build your NestJS application
CMD ["yarn", "start:dev"]

# # Runtime stage
# FROM node:lts AS runtime

# WORKDIR /app

# # Copy package.json and yarn.lock to /app directory
# COPY package.json yarn.lock ./

# # Install only production dependencies
# RUN yarn install --production --frozen-lockfile

# # Copy built assets from the builder stage
# COPY --from=builder /app/dist ./dist

# # Your application will listen on port 4000
# EXPOSE 4000

# # Command to run your app
# CMD ["yarn", "start:prod"]