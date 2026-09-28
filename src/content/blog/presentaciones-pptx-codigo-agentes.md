---
title: "¿Seguiremos haciendo presentaciones con PPTX?"
description: "De slides como código a pequeños bloques animados generados por agentes: cómo ha cambiado mi forma de hacer presentaciones y qué formato puede venir después."
date: "2026-09-28"
draft: true
tags: ["AI", "Presentations", "Agents", "Developer Experience"]
featured: false
---

Justo ahora estoy preparando una presentación para un evento y el material original me ha llegado en PPTX. No tendría nada de particular si no fuera porque incluso en eventos donde hablamos de IA seguimos intercambiándonos PowerPoints 😅, y eso me ha hecho volver a una pregunta que llevo unos días dándole vueltas: **¿cómo vamos a hacer las presentaciones dentro de unos años?**

![De PPTX a slides como código y pequeños bloques animados generados con agentes](/blog/images/presentaciones-del-futuro-con-ia.webp)

No lo digo porque crea que PowerPoint vaya a desaparecer mañana. De hecho, sigue resolviendo bastante bien una parte del problema: alguien prepara unas slides, las puede modificar fácilmente, se las pasa a otra persona y el día de la charla va avanzando a su ritmo. Pero al mismo tiempo cada vez tenemos más piezas alrededor que hacen que una presentación pueda ser algo bastante distinto a un conjunto de diapositivas estáticas.

## Llevo haciendo presentaciones con código desde 2017

Yo empecé a hacer presentaciones con "código" sobre 2017, primero para la universidad y después para el trabajo. He pasado por Markdown, HTML, MDX y varios frameworks, pero casi todos tenían algo en común que me gustaba bastante: **la presentación podía vivir en GitHub en un formato legible y versionable**.

Una de las primeras que tengo publicada es de 2019, para mis compañeros de GMV, explicando cómo empezar a dockerizar aplicaciones. Está todavía en GitHub dentro de [`docker-demo`](https://github.com/svg153/docker-demo/tree/main/simple-binary) y estaba hecha con MDX Deck.

Tampoco era algo especialmente nuevo. Para entonces ya llevaba años existiendo reveal.js y había bastante ecosistema alrededor de la idea de hacer slides con HTML, Markdown o código. Por eso no creo que la evolución sea simplemente "PowerPoint y después llegaron las presentaciones con código". Las dos cosas llevan mucho tiempo conviviendo y resuelven problemas algo distintos.

Lo que sí me parece que ha cambiado bastante es lo fácil que resulta combinar esas presentaciones con otras piezas.

## De slides como código a vídeo como código

Después empezó a interesarme otra idea: **hacer vídeo con código**. Ahí conocí [Remotion](https://www.remotion.dev/), donde al final trabajas con componentes React, frames, animaciones, datos, imágenes, audio y vídeo, pero el código sigue siendo la fuente de verdad.

La idea me parecía muy potente, aunque tenía una barrera bastante clara. Si querías hacer algo bueno necesitabas conocer el framework, saber frontend y dedicarle tiempo. Podías automatizar mucho, pero no era algo que yo fuese a utilizar para preparar una pieza rápida cada vez que necesitase explicar una idea.

En 2026 se hicieron bastante conocidas las skills de Remotion para agentes y ahí cambió parte de la experiencia. Ya no era solo "aprende el SDK y programa el vídeo", sino que podías darle a un agente una idea, contexto y unas reglas de estilo para que fuese construyendo el proyecto. La propia documentación actual de Remotion ya plantea el uso de coding agents como una de las formas de crear vídeo.

Después apareció [HyperFrames](https://github.com/heygen-com/hyperframes), que lleva esta idea por otro camino. En vez de utilizar React como formato principal, trabaja sobre HTML, CSS y JavaScript y está pensado directamente para que un agente pueda generar y editar esas composiciones. No lo veo tanto como "el sustituto de Remotion", sino como otra señal de que **media as code** está empezando a ser mucho más accesible para los agentes.

## Lo que estoy haciendo ahora con la presentación

Con la charla que estoy preparando ahora he terminado mezclando varias de estas ideas. Como me pasaron el material inicial en PPTX y quería mantener su identidad visual, en vez de copiar a mano cada slide saqué de ahí un pequeño **design system**: tipografías, colores, espaciados, componentes y patrones que después puedo reutilizar desde código.

Lo he dejado publicado aquí:

[DevDays Design System](https://githubcommunity.es/devdays-design-system/)

Y como esta charla es bastante de arquitectura, decidí probar Slidev junto con Archify. Mientras trabajaba con los diagramas me surgió otra idea bastante simple: si durante la charla estoy enseñando una arquitectura, ¿por qué no poder abrir ese mismo diagrama de Archify directamente desde la presentación para explorarlo en ese momento?

Busqué si ya había algo hecho y no encontré nada que resolviese exactamente ese flujo, así que terminé creando [`slidev-archify-explorer`](https://github.com/svg153/slidev-archify-explorer).

Y para mí esta parte es importante porque muestra que una slide hecha con código ya no tiene por qué ser solo "texto e imágenes que se parecen a PowerPoint". Puede tener componentes, diagramas navegables, datos, interactividad y el mismo design system que estás utilizando en otros formatos.

## La pieza que cambia ahora: los agentes reducen mucho la fricción

El 22 de septiembre de 2026 se lanzó Claude Opus 5.5 y, más allá del modelo concreto, lo que me parece interesante de lo que estamos viendo con este tipo de agentes es la cantidad de piezas que ya pueden coordinar. No es que Opus 5.5 sea una herramienta de presentaciones o un formato de vídeo. Lo interesante es que el agente puede trabajar con herramientas como Remotion, HyperFrames, generación de imágenes, voz, código y componentes y acabar construyendo una pieza multimedia bastante completa a partir de una especificación relativamente pequeña.

Y eso cambia bastante la economía del problema. Hace no tanto, si para una slide quería una animación específica de 20 o 30 segundos, seguramente no me compensaba programarla. Ahora empezamos a ver casos donde una pieza de vídeo corta, vertical u horizontal, con animaciones e incluso voz, puede salir en unas pocas iteraciones. En mis pruebas, según la complejidad, puedes tener algo utilizable en el orden de 15 o 20 minutos, aunque obviamente no lo tomaría como un tiempo fijo ni como una garantía para cualquier vídeo.

Ese matiz es importante: **no es que el vídeo con código haya aparecido ahora**. Ya estaba ahí. Lo que está cambiando es el coste de pedirlo, iterarlo y adaptarlo.

## Pero una presentación no puede ser simplemente un vídeo

Aquí es donde creo que está la parte más interesante.

Una charla en directo no tiene un ritmo constante. Tú estás hablando y ves a la audiencia. A lo mejor una parte que pensabas explicar en treinta segundos necesita tres minutos porque hay preguntas, otra la pasas mucho más rápido porque ves que ya se entiende y en otra terminas improvisando algo que ni siquiera estaba previsto.

Si conviertes toda la presentación en un vídeo de diez o veinte minutos, pierdes precisamente eso. El vídeo marca el ritmo por ti y el ponente empieza a seguir a la pieza en lugar de utilizarla como apoyo.

Por eso me interesa más un formato intermedio. **¿Y si una slide fuese en realidad una pequeña pieza animada de 20 o 30 segundos, o quizá un minuto, sin voz?** Tú llegas a ese bloque, empieza la animación y hablas sobre ella. Si necesitas más tiempo, te quedas ahí. Si quieres pasar, avanzas al siguiente bloque. La presentación sigue bajo el control del ponente, pero visualmente puede tener mucha más riqueza que una slide estática.

Al final no sería exactamente PowerPoint, pero tampoco sería un vídeo. Sería algo entre **slide, web, animación y vídeo**, y probablemente la frontera entre esas cosas importaría cada vez menos.

## Quizá el artefacto final deje de ser "la presentación"

Hay además otra consecuencia que me parece incluso más interesante. Si ya tengo el contenido, el contexto, el design system, los diagramas, los datos y los componentes, ¿por qué generar únicamente una presentación?

Del mismo origen podría terminar sacando una versión para hablar en un escenario, un PDF para enviar después, una web interactiva, un vídeo con voz, varios clips cortos para redes o una versión reducida para explicar una única idea. El contenido y el sistema visual serían los mismos; lo que cambiaría sería el formato que genero para cada contexto.

Por eso creo que la pregunta ya no es únicamente si dentro de unos años seguiremos utilizando PPTX. Lo mismo seguimos utilizándolo, porque para muchos casos seguirá siendo la opción más práctica. La pregunta que me parece más interesante es **si seguiremos entendiendo la presentación como un único artefacto que diseñamos a mano y después reutilizamos para todo**.

¿Seguiremos enviándonos PPTX? ¿Generaremos directamente HTML o slides con código? ¿Utilizaremos pequeños vídeos o animaciones por bloques mientras el ponente sigue controlando el ritmo? ¿O simplemente tendremos una fuente común y generaremos en cada momento el formato que mejor nos venga?
