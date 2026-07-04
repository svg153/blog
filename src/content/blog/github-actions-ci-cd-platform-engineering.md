---
title: "GitHub Actions: de CI/CD básico a pipelines de Platform Engineering"
description: "Cómo evolucioné mis GitHub Actions desde simples tests hasta pipelines de Platform Engineering que automatizan infraestructura, seguridad y despliegues."
date: "2025-07-03"
tags: ["DevOps", "GitHub", "CI/CD"]
readingTime: "6"
featured: false
---

# GitHub Actions: de CI/CD básico a pipelines de Platform Engineering

Llevo años usando GitHub Actions y la evolución que he visto es brutal. Empecé con workflows de tres líneas que ejecutaban `npm test` y ahora tengo pipelines que gestionan infraestructura, validan seguridad, generan documentación y despliegan a producción — todo sin tocar un servidor.

En este artículo te cuento cómo pasé de lo básico a lo avanzado, con ejemplos reales que puedes copiar.

## El nivel 0: el workflow que todo el mundo tiene

```yaml
name: CI
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm test
```

Esto es lo que todo el mundo tiene. Funciona. Pero es solo el punto de partida.

## Nivel 1: matrices y múltiples entornos

El primer salto fue entender las matrices. En lugar de un solo job, ejecutas tests en múltiples versiones de Node, Python o Go:

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18, 20, 22]
        os: [ubuntu-latest, macos-latest]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
      - run: npm ci
      - run: npm test
```

Esto te da 6 jobs en paralelo. Si uno falla, los demás siguen corriendo. Muy útil para asegurarte de que tu código funciona en todas las versiones soportadas.

## Nivel 2: caches y artefactos

El segundo salto fue optimizar. `npm ci` es rápido, pero ¿y si puedes evitarlo?

```yaml
- uses: actions/cache@v4
  with:
    path: ~/.npm
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-node-
```

Con esto, la primera instalación descarga todo. Las siguientes usan la cache y tardan segundos. En pipelines que se ejecutan 50 veces al día, la diferencia es enorme.

Y los artefactos:

```yaml
- uses: actions/upload-artifact@v4
  with:
    name: coverage-report
    path: coverage/
    retention-days: 30
```

Esto te permite ver los resultados de cobertura incluso después de que el job termine.

## Nivel 3: jobs dependientes y despliegues

Aquí es donde se pone interesante. Puedes hacer que un job dependa de otro:

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    steps:
      - uses: actions/checkout@v4
      - run: echo "Deploying to production..."
        env:
          DEPLOY_KEY: ${{ secrets.DEPLOY_KEY }}
```

El `needs: test` hace que deploy solo corra si test pasa. El `if` hace que solo deploye en main y solo en push (no en PRs).

## Nivel 4: Platform Engineering con GitHub Actions

Aquí es donde todo cambia. GitHub Actions no es solo para tests y deploy — es una plataforma completa de automatización.

### Validación de Terraform

```yaml
name: Terraform Plan
on:
  pull_request:
    paths:
      - 'infrastructure/**'

jobs:
  plan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: hashicorp/setup-terraform@v3
      - run: terraform init
      - run: terraform plan -out=tfplan
      - uses: actions/upload-artifact@v4
        with:
          name: tfplan
          path: tfplan
```

Cada PR que toca Terraform genera un plan. Lo subes como artefacto y lo revisas antes de merge. Sin necesidad de un servidor de CI dedicado.

### Escaneo de seguridad

```yaml
jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          scan-ref: '.'
          format: 'sarif'
          output: 'trivy-results.sarif'
      - name: Upload Trivy scan results
        uses: github/codeql-action/upload-sarif@v3
        with:
          sarif_file: 'trivy-results.sarif'
```

Esto integra directamente con GitHub Security tab. Cada PR muestra vulnerabilidades antes de que lleguen a producción.

### Generación de documentación

```yaml
name: Docs
on:
  push:
    branches: [main]
    paths:
      - 'docs/**'

jobs:
  docs:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.12'
      - run: pip install mkdocs-material
      - run: mkdocs build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./site
```

Cada push a main regenera la docs y la publica en GitHub Pages. Sin intervención humana.

## Nivel 5: workflows reutilizables

Cuando tienes 10 repos con los mismos workflows, copiar y pegar se vuelve insostenible. La solución: workflows reutilizables.

```yaml
# .github/workflows/ci.yml (reusable)
name: Reusable CI
on:
  workflow_call:
    inputs:
      node-version:
        type: number
        default: 20
    secrets:
      DEPLOY_KEY:
        required: true

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ inputs.node-version }}
      - run: npm ci && npm test
```

Y en cada repo:

```yaml
name: CI
on: [push, pull_request]

jobs:
  ci:
    uses: mi-org/shared-workflows/.github/workflows/ci.yml@main
    with:
      node-version: 22
    secrets:
      DEPLOY_KEY: ${{ secrets.DEPLOY_KEY }}
```

Un solo lugar para actualizar la configuración de CI. Si cambias algo, se propaga a todos los repos.

## Los errores que cometí

### 1. No usar `concurrency`

Sin concurrency, cada push dispara un workflow nuevo. Si haces 5 pushes en un minuto, tienes 5 workflows corriendo en paralelo. Con `concurrency`:

```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```

Esto cancela workflows anteriores del mismo branch. Ahorras tokens y tiempo.

### 2. Hardcodear secrets en los logs

Nunca hagas `echo $SECRET` en un step. Si el step falla, el log se expone. Usa `env` en lugar de `args`:

```yaml
# ✅ Correcto
- run: ./deploy.sh
  env:
    API_KEY: ${{ secrets.API_KEY }}

# ❌ Incorrecto
- run: API_KEY=${{ secrets.API_KEY }} ./deploy.sh
```

### 3. No usar `matrix.fail-fast: false`

Por defecto, si un job de la matrix falla, cancela los demás. Para tests, quieres ver TODOS los resultados:

```yaml
strategy:
  fail-fast: false
  matrix:
    node-version: [18, 20, 22]
```

## Mi stack de GitHub Actions

Esto es lo que uso en mis proyectos de Platform Engineering:

| Acción | Uso |
|--------|-----|
| `actions/checkout@v4` | Siempre |
| `actions/setup-node@v4` | Proyectos Node.js |
| `actions/setup-python@v5` | Proyectos Python |
| `hashicorp/setup-terraform@v3` | Terraform plans |
| `aquasecurity/trivy-action@master` | Escaneo de vulnerabilidades |
| `peaceiris/actions-gh-pages@v3` | Deploy a GitHub Pages |
| `codecov/codecov-action@v4` | Upload de cobertura |
| `github/codeql-action/upload-sarif@v3` | Integración con Security tab |

## Conclusión

GitHub Actions ha evolucionado de un simple sistema de CI/CD a una plataforma completa de automatización. Para Platform Engineers, es una herramienta fundamental: puedes automatizar desde tests básicos hasta despliegues de infraestructura con seguridad integrada.

La clave es empezar simple y añadir complejidad gradualmente. No necesitas todos los workflows de nivel 5 desde el día uno. Empieza con tests, añade caches, luego despliegues, y poco a poco construye tu plataforma de automatización.

¿Qué workflows usas en tus proyectos? ¿Tienes algún truco que te funcione bien?

---

*Sergio Valverde es Platform Engineer en Lunik, Organizer de GitHub Community Spain, y entusiasta del Developer Experience. Sígueme en [GitHub](https://github.com/svg153), [LinkedIn](https://linkedin.com/in/svg153), y [X](https://twitter.com/svg153).*
