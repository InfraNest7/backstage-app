# Use a Node base image
FROM node:20-bullseye

# Create app directory
WORKDIR /app

# Set environment to production
ENV NODE_ENV=production

# Copy only the dist directory (built files)
COPY packages/backend/dist ./dist

# Copy only necessary files
COPY packages/backend/package.json packages/backend/dist/yarn.lock ./
# Copy example data needed for catalog (User, Groups, Templates, etc.)
COPY examples ./examples
# Install only production dependencies
RUN yarn install --production

# Expose Backstage backend port
EXPOSE 7007

# Start the backend
CMD ["node", "dist/index.cjs.js"]

