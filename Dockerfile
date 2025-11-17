# Use the official Bun image
FROM oven/bun:latest

# Set the working directory in the container
WORKDIR /app

# Copy the current directory contents into the container at /app
COPY . .

# Install dependencies
RUN bun install --frozen-lockfile --production

# Build the TypeScript files
RUN bun run build

# Run the server when the container launches
CMD ["bun", "dist/index.js"]
