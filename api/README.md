# Installation

## Docker Container (recommended)

Install Docker Engine

```bash
...
```

...

## Linux/Debian

Install on Debian/Linux distributions.

### Install Git

```bash
sudo apt-get install git
```

### Install Deno

```bash
curl -fsSL https://deno.land/install.sh | sh
```

Note: you may need to restart the terminal.

### Clone the repository

```bash
git clone https://github.com/petermichon/nedward-api.git nedward-api
```

Move inside the codebase

```bash
cd nedward-api/src/
```

## Serve the website over localhost (https://localhost:8443/)

```bash
deno run dev
```
