# Docker Publishing Guide

This guide explains how to publish the Sudoku Pro Max Docker image to container registries.

## Automated Publishing (Recommended)

The project includes GitHub Actions workflows that automatically build and publish Docker images.

### GitHub Container Registry (GHCR)

**Automatic on every push to main:**
- Images are published to `ghcr.io/tmptr/sudoku-pro-max`
- Tagged with branch name and commit SHA
- No additional setup required (uses GITHUB_TOKEN)

### Docker Hub

**Automatic on version tags:**

1. **Create Docker Hub account** at https://hub.docker.com

2. **Create Access Token:**
   - Go to Account Settings → Security → New Access Token
   - Name: `GitHub Actions`
   - Copy the token

3. **Add secrets to GitHub repository:**
   - Go to your repo → Settings → Secrets and variables → Actions
   - Add two secrets:
     - `DOCKERHUB_USERNAME`: Your Docker Hub username
     - `DOCKERHUB_TOKEN`: The access token you created

4. **Create a version tag to trigger publish:**
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

## Manual Publishing

### Publish to Docker Hub

```bash
# Login to Docker Hub
docker login

# Build the image
docker build -t <your-username>/sudoku-pro-max:latest .

# Tag with version
docker tag <your-username>/sudoku-pro-max:latest <your-username>/sudoku-pro-max:1.0.0

# Push to Docker Hub
docker push <your-username>/sudoku-pro-max:latest
docker push <your-username>/sudoku-pro-max:1.0.0
```

### Publish to GitHub Container Registry

```bash
# Login to GHCR
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin

# Build the image
docker build -t ghcr.io/tmptr/sudoku-pro-max:latest .

# Push to GHCR
docker push ghcr.io/tmptr/sudoku-pro-max:latest
```

## Usage

Once published, anyone can run your app with:

```bash
# From GitHub Container Registry
docker run -d -p 3000:80 ghcr.io/tmptr/sudoku-pro-max:latest

# From Docker Hub
docker run -d -p 3000:80 <your-username>/sudoku-pro-max:latest
```

## Version Tags

When you create a git tag like `v1.0.0`, the workflows will automatically:
- Build the Docker image
- Tag it with: `1.0.0`, `1.0`, `1`, and `latest`
- Push to the registries

Example:
```bash
git tag v1.0.0
git push origin v1.0.0
```
