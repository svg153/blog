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
proponerlos en una PR. Estas órdenes no publican artículos ni hacen merge.

## Actualización automática

Una vez fusionado en `main`, el workflow `update-writing-style.yml` comprueba
el origen cada lunes a las 06:17 UTC y también admite ejecución manual. Ejecuta
APM en un job de solo lectura; un segundo job con permisos de escritura limitados
abre o actualiza una PR con el lockfile y la skill. No hace merge automáticamente.
El lockfile no cambia hasta que se revise y fusione esa PR.

El workflow solo acepta el origen `svg153/skills` y los cuatro archivos de la
skill actualmente versionados; rechaza rutas adicionales, archivos ejecutables,
enlaces simbólicos y dependencias o scripts nuevos del paquete. Si la skill
necesita ampliar esa estructura, hay que revisar y actualizar el control antes
de que el bot pueda proponerla. También cancela la actualización si `main`
cambia entre la preparación y la creación de la PR; puede volver a ejecutarse.

La opción de GitHub **Allow GitHub Actions to create and approve pull requests**
debe estar habilitada en Settings → Actions → General. No se cambia desde esta
PR. Las PR creadas con `GITHUB_TOKEN` pueden requerir aprobar la ejecución de
workflows en GitHub; hay que comprobar CI y revisar el contenido de la skill
antes de fusionar. Hasta que se fusione esta integración, el workflow programado
no está activo. Si está deshabilitado o falla, se puede usar `apm update` de
forma manual como se explica arriba.
