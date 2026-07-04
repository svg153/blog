---
title: "Mi stack de herramientas de desarrollo en 2025: lo que uso cada día"
description: "De VS Code a Cursor, de Jenkins a GitHub Actions — un tour por las herramientas que uso cada día como Platform Engineer y por qué las elegí."
date: "2025-07-05"
tags: ["Tool", "DevOps", "Career"]
readingTime: "5"
featured: false
---

# Mi stack de herramientas de desarrollo en 2025: lo que uso cada día

Cada año cambio herramientas. No por capricho — porque el flujo de trabajo evoluciona y lo que funcionaba hace dos años ya no encaja. Este año he hecho un cambio más radical que nunca: me mudé de VS Code a Cursor.

En este artículo te cuento mi stack completo, por qué elegí cada herramienta, y qué cambiaría si pudiera empezar de cero.

## Editor: Cursor sobre VS Code

Sí, lo escribí. Cursor.

Durante años fui devoto de VS Code. Lo configuré con cientos de extensiones, themes, snippets y keybindings. Pero Cursor me convenció por tres razones:

1. **Contexto automático**: Cursor sabe qué archivos estás tocando, qué imports tienes, y qué patrones usa tu proyecto. No necesitas decirle "lee todos los archivos .ts".

2. **Multi-file edits**: Puedes decirle "refactoriza esta función en todos los archivos que la usan" y lo hace. Sin extensiones, sin scripts personalizados.

3. **Codebase indexing**: Cursor indexa tu repositorio completo. Puedes preguntar "¿dónde se configura el timeout de la API?" y te responde con el archivo exacto y la línea.

¿Lo malo? Es un fork de VS Code, así que a veces las extensiones se rompen. Y depende de la nube para el indexing pesado. Pero para uso diario, la experiencia es superior.

## Shell: zsh + Starship

```bash
# .zshrc
plugins=(git docker kubectl terraform)
```

Starship es mi prompt. Muestra el lenguaje del proyecto, el branch de git, el estado de los tests, y el tiempo de ejecución del último comando. Todo en una línea limpia.

```
~/proyecto/main ◆ |node:v20| ✓ |2.3s|
```

Simple, informativo, bonito.

## Docker: mi entorno de desarrollo

Cada proyecto tiene su `docker-compose.yml`. No instalo nada localmente — PostgreSQL, Redis, MinIO, todo corre en contenedores.

```yaml
services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_DB: myapp
      POSTGRES_PASSWORD: dev
    ports:
      - "5432:5432"
```

La ventaja: un compañero nuevo puede `docker compose up` y tener todo funcionando en 30 segundos. Sin instalar PostgreSQL, sin configurar variables de entorno, sin problemas de compatibilidad.

## Terraform: infraestructura como código

```bash
terraform init && terraform plan && terraform apply
```

Sencillo. Terraform + GitHub Actions para CI/CD de infraestructura. Cada PR genera un plan que se revisa antes de aplicar. Sin servidores de CI dedicados, sin Jenkins.

## Git: mis comandos diarios

```bash
# Lo que uso 50 veces al día
git log --oneline -20
git diff --stat
git stash push -m "wip: feature X"
git stash list
git stash pop

# Lo que uso a menudo
git log --since="2 weeks ago" --oneline --graph
git log --all --grep="fix" --oneline
git log --stat --since="1 month ago"

# Los que uso cuando recuerdo que existen
git bisect start
git reflog
git fsck
```

Git bisect es mi herramienta secreta. Cuando un bug aparece de la nada, `git bisect` te dice exactamente qué commit lo introdujo. En minutos, no en horas.

## Observabilidad: lo que uso en producción

| Herramienta | Para qué |
|-------------|----------|
| **Prometheus** | Métricas de infraestructura |
| **Grafana** | Dashboards y alertas |
| **Loki** | Logs agregados |
| **Tempo** | Tracing distribuido |
| **PagerDuty** | Alertas y on-call |

Todo self-hosted. No pago por SaaS de observabilidad. El stack de Grafana Labs es completo, open source, y funciona bien si lo configuras correctamente.

## Lo que NO uso (y por qué)

### Jenkins
Lo usé durante años. Ahora lo veo como un dinosaurio. GitHub Actions hace lo mismo, mejor integrado, y sin mantener un servidor.

### Slack (para trabajo técnico)
Lo uso para comunicación general, pero para debugging y troubleshooting, prefiero:
- **GitHub Discussions** para preguntas técnicas
- **Markdown** para documentación
- **Logs estructurados** para debugging

### IDEs pesados (IntelliJ, PyCharm)
Para proyectos pequeños y medianos, Cursor/VS Code es suficiente. IntelliJ es potente pero tarda 30 segundos en abrir. Para Platform Engineering, donde trabajo con múltiples lenguajes y scripts, la ligereza importa.

## Mis atajos de teclado

```
# Cursor / VS Code
Ctrl+Shift+P    → Command palette
Ctrl+P           → Go to file
Ctrl+Shift+F     → Search in files
Ctrl+`            → Terminal integrado
Alt+Z            → Word wrap toggle
Ctrl+Shift+K     → Delete line
Cmd+D            → Select next occurrence
```

Estos 7 atajos cubren el 90% de mi flujo de trabajo. No necesito más.

## Herramientas que quiero probar

- **Bun**: El runtime JavaScript que promete ser 10x más rápido que Node
- **Nix**: Gestión de entornos de desarrollo reproducible
- **Dev Containers**: Entornos de desarrollo en contenedores (ya los uso, pero quiero profundizar)
- **Copilot CLI**: La terminal con IA integrada

## Conclusión

Mi stack en 2025 es simple pero potente: Cursor como editor, Docker como entorno, Terraform para infraestructura, GitHub Actions para CI/CD, y el stack de Grafana para observabilidad. Todo open source, todo integrado, todo automatizado.

La mejor herramienta es la que no tienes que pensar en ella. Si te pasa más de 5 minutos al día configurando o arreglando tu entorno, algo está mal.

¿Cuál es tu stack? ¿Qué cambiarías?

---

*Sergio Valverde es Platform Engineer en Lunik, Organizer de GitHub Community Spain, y entusiasta del Developer Experience. Sígueme en [GitHub](https://github.com/svg153), [LinkedIn](https://linkedin.com/in/svg153), y [X](https://twitter.com/svg153).*
