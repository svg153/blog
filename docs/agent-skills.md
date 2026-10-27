# Skills del blog con APM

El blog consume `svg153-writing-style` desde
[`svg153/skills`](https://github.com/svg153/skills/tree/main/skills/svg153-writing-style).
El `apm.yml` declara la dependencia y `apm.lock.yaml` fija el commit y los hashes
instalados. APM despliega los archivos bajo `.agents/skills/svg153-writing-style/`;
se versionan para que los agentes puedan descubrirlos y se actualizan con APM,
no editándolos a mano. La caché `apm_modules/` no se versiona.

Con [Microsoft APM](https://github.com/microsoft/apm) 0.29.1 instalado, para
reproducir la versión fijada y verificar su integridad:

```bash
apm install --frozen
apm audit --ci
```

Para incorporar una nueva versión de la skill, ejecutar:

```bash
apm update --yes
apm audit --ci
```

Después revisar los cambios del lockfile y de los archivos desplegados y
proponerlos en una PR. El lockfile **no se actualiza solo** cuando cambia el
repositorio de origen: hace falta ejecutar `apm update` o configurar una
automatización explícita. Estas órdenes no publican artículos ni hacen merge.
