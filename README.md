# Sergio Valverde Blog

Blog técnico sobre **AI agents, GitHub, DevOps, Platform Engineering, automatización y desarrollo de software**.

🌐 **Web:** https://svg153.github.io/blog/

Este repositorio contiene el código y el contenido fuente del blog. Los artículos viven en Markdown y se publican como sitio estático con Astro y GitHub Pages.

## Últimos artículos

### [Qué aprendí tras casi 58 horas dejando a Codex recorrer un roadmap real](https://svg153.github.io/blog/posts/58-horas-codex-roadmap-real/)

**23 septiembre 2026**

Una retrospectiva de casi 58 horas acumuladas de ejecución autónoma: qué funcionó, dónde apareció la burocracia automática y por qué terminé separando el workflow personal del enterprise.

### [Antes de generar código: ¿USE, CONTRIBUTE, FORK o BUILD?](https://svg153.github.io/blog/posts/use-contribute-fork-build/)

**16 septiembre 2026**

Un enfoque práctico para buscar, evaluar y reutilizar software antes de pedir a un agente que genere otro repositorio desde cero.

### [Skills over MCP: de exponer tools a distribuir know-how](https://svg153.github.io/blog/posts/skills-over-mcp-tools-know-how/)

**14 septiembre 2026**

Cómo encajan Tools, Resources y Skills en MCP y por qué las skills permiten distribuir conocimiento operativo por encima de las capacidades básicas de una integración.

## Otros artículos para empezar

- [Mi viaje con el desarrollo agéntico: de Copilot a agentes autónomos](https://svg153.github.io/blog/posts/mi-viaje-agentic-development/)
- [GitHub Actions: de CI/CD básico a pipelines de Platform Engineering](https://svg153.github.io/blog/posts/github-actions-ci-cd-platform-engineering/)
- [Mi stack de herramientas de desarrollo en 2025: lo que uso cada día](https://svg153.github.io/blog/posts/mi-stack-herramientas-2025/)

## Explorar el blog

- [Todos los artículos](https://svg153.github.io/blog/archive/)
- [Buscar](https://svg153.github.io/blog/search/)
- [Tags](https://svg153.github.io/blog/tags/)
- [RSS](https://svg153.github.io/blog/rss.xml)

## Sobre este repositorio

El contenido canónico está en [`src/content/blog`](src/content/blog). La web se construye con Astro y se despliega automáticamente a GitHub Pages desde `main`.

La documentación técnica se ha separado del README para que la portada del repositorio esté centrada en el propio blog:

- [Desarrollo, arquitectura y validación](docs/development.md)
- [Publicación y sindicación](docs/publishing.md)
- [Instrucciones para agentes](AGENTS.md)

Para levantar el blog localmente:

```bash
npm ci
npm run dev
```

Y para ejecutar la validación completa:

```bash
npm run build
```

## Licencia y contribuciones

Este es principalmente mi blog personal y repositorio de experimentación. Si encuentras un error técnico, un enlace roto o una mejora concreta, puedes abrir un issue o una pull request.
