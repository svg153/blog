---
title: "Mi viaje con el desarrollo agéntico: de Copilot a agentes autónomos"
description: "Cómo pasé de escribir un post de LinkedIn a contar toda la historia del desarrollo agéntico — y por qué creo que esto va a cambiar cómo construimos software."
date: "2025-07-02"
tags: ["AI", "Agents", "DevOps"]
featured: true
readingTime: "8"
---

Hace unas horas empecé a escribir lo que iba a ser un post de LinkedIn. Una idea rápida, algo ligero. Pero me encontré escribiendo esto — un artículo completo sobre mi viaje con el desarrollo agéntico. Y creo que eso dice algo importante sobre lo que está pasando.

## El punto de partida

Todo empezó como siempre empieza hoy en día: con **GitHub Copilot**. Como muchos de vosotros, lo uso a diario. Es una herramienta increíble que me ahorra horas de trabajo. Pero hay algo que no me terminaba de convencer: **Copilot es reactivo**. Tú le pides algo, él te lo da. No va más allá.

## La evolución

Lo primero que hice fue explorar **Claude Code** y **Cursor**. La diferencia es notable: estos tools no solo completan código, sino que **entienden el contexto** de tu proyecto. Pueden refactorizar múltiples archivos, entender dependencias, y mantener la coherencia.

Pero seguían siendo herramientas — no agentes.

## El salto a agentes autónomos

La verdadera revolución empezó cuando empecé a experimentar con **agentes que podían tomar decisiones por sí mismos**. No solo completan código: **planifican, ejecutan, verifican y corrigen**.

### Mi primer experimento real

El primer proyecto donde usé un agente autónomo fue para automatizar la revisión de PRs en uno de mis repositorios. El agente:

1. **Leía** todos los cambios del PR
2. **Analizaba** la arquitectura del proyecto
3. **Identificaba** posibles problemas (bugs, security issues, performance)
4. **Generaba** un review detallado con sugerencias concretas
5. **Proponía** los fixes directamente como commits

Todo esto sin que yo tuviera que supervisar cada paso.

## Lo que aprendí

### 1. Los agentes no reemplazan desarrolladores — los potencian

Esto es clave. No se trata de que un agente escriba todo el software. Se trata de que **el agente se encargue de lo repetitivo** y el desarrollador se enfoque en lo que realmente importa: **arquitectura, diseño, y decisiones complejas**.

### 2. La prompt engineering es ahora una skill de primer nivel

No, no hablo de escribir prompts para ChatGPT. Hablo de **saber especificar contexto, restricciones, y objetivos** de forma que un agente pueda ejecutar correctamente. Esto es exactamente lo que siempre hemos hecho como ingenieros: **definir requisitos claros**.

### 3. La calidad del output depende de la calidad del input

Si le das a un agente un repo sin estructura, sin tests, sin documentación... va a hacer un trabajo mediocre. Si le das un repo bien estructurado con tests y documentación... puede hacer magia. **La infraestructura de software importa más que nunca.**

## El caso de uso: Platform Engineering

Como Platform Engineer, veo un potencial enorme aquí. Imagina:

- Un agente que **monitorea** tu infraestructura y **repara** problemas automáticamente
- Un agente que **reviewea** tus Terraform plans y **detecta** configuraciones inseguras
- Un agente que **genera** documentación basada en el código real
- Un agente que **optimiza** tus pipelines de CI/CD basándose en métricas reales

No es futurismo. Esto ya se puede hacer.

## Mi stack actual

Esto es lo que uso ahora en mi flujo de trabajo diario:

| Herramienta | Uso |
|-------------|-----|
| **GitHub Copilot** | Completado de código en tiempo real |
| **Claude Code** | Refactorizaciones, debugging, contexto amplio |
| **Cursor** | Desarrollo con IA integrada en el editor |
| **Custom scripts + LLMs** | Automatizaciones específicas de mi infraestructura |

## Los errores que cometí

No todo fue perfecto. Aquí van mis principales errores:

### Error 1: Confundir automatización con inteligencia

Al principio pensé que si un agente podía hacer X, podía hacer X+Y+Z. No funciona así. **Los agentes son buenos en dominios bien definidos.** Cuanto más específico es el problema, mejor funciona el agente.

### Error 2: No invertir en tests primero

Intenté usar agentes en proyectos sin cobertura de tests. El resultado: el agente "mejoraba" el código y **rompía cosas que funcionaban**. Los tests son el anchor que mantiene al agente enfocado en lo que importa.

### Error 3: No documentar las decisiones del agente

Cuando un agente toma una decisión (refactoriza, cambia configuración, actualiza dependencias), **necesitas entender por qué**. Sin logs de las decisiones del agente, terminas con un black box que no puedes auditar.

## El futuro

Creo que estamos en el equivalente a cuando aparecieron los primeros IDEs. Al principio todo el mundo era escéptico: "¿un robot va a escribir mi código?". Ahora nadie cuestiona que los IDEs mejoran la productividad.

El desarrollo agéntico va por el mismo camino. **No va a reemplazar a los desarrolladores, pero los desarrolladores que usen agentes van a reemplazar a los que no.**

## Mi recomendación para empezar

Si quieres probar desarrollo agéntico pero no sabes por dónde empezar:

1. **Empieza pequeño**: Usa Copilot o Cursor en tu día a día
2. **Automatiza una tarea repetitiva**: Un script que uses siempre
3. **Añade contexto**: Dale al agente acceso a la documentación de tu proyecto
4. **Mide resultados**: ¿Cuánto tiempo ahorras? ¿Qué calidad tiene el output?
5. **Itera**: Refina tus prompts, añade más contexto, mejora la estructura

## Conclusión

Llevo como una hora escribiendo esto. Empecé con la intención de hacer un post de LinkedIn de tres líneas. Pero el tema es demasiado rico para resumirlo. Y eso es exactamente lo que quiero transmitir: **el desarrollo agéntico no es una moda, es un cambio de paradigma.**

¿Y tú? ¿Estás usando agentes en tu flujo de trabajo? ¿Qué herramientas usas? Me encantaría leer vuestros comentarios.

---

*Sergio Valverde es Platform Engineer en Lunik, Organizer de GitHub Community Spain, y entusiasta del Developer Experience. Sígueme en [GitHub](https://github.com/svg153), [LinkedIn](https://linkedin.com/in/svg153), y [X](https://twitter.com/svg153).*
