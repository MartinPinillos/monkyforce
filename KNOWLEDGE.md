# MonkyForce — Knowledge Base

> **Estado:** Borrador inicial  
> **Fuente principal:** `Meeting Transcription.txt` — reunión del 22/09/2026  
> **Propósito:** Centralizar el conocimiento funcional y de negocio de MonkyForce.  
> Este documento define **qué problema resuelve el sistema y cómo funciona el negocio**. Las decisiones técnicas pertenecen a `ARCHITECTURE.md`.

---

## 1. Visión del proyecto

**MonkyForce** será un sistema web de gestión de producción textil orientado a centralizar y dar trazabilidad a los procesos que actualmente se encuentran distribuidos entre una aplicación existente y múltiples planillas Excel.

El objetivo principal es controlar el recorrido de una producción desde la disponibilidad de materia prima hasta la obtención de prendas terminadas, conservando tanto la planificación como lo efectivamente ocurrido en cada etapa.

El sistema deberá permitir, progresivamente:

- configurar telas, rollos, prendas y tizadas;
- planificar y registrar cortes;
- controlar consumo de telas;
- administrar producciones enviadas a talleres externos;
- registrar entregas parciales y finales;
- realizar controles de calidad;
- registrar fallas, correcciones y mermas;
- controlar insumos y avíos;
- conservar historiales de movimientos;
- administrar usuarios, roles y permisos;
- obtener métricas y estadísticas;
- registrar traslados y movimientos logísticos cuando este módulo sea incorporado.

MonkyForce no se plantea inicialmente como reemplazo del sistema de venta/facturación existente, sino principalmente como una solución para organizar la **producción textil interna**.

---

## 2. Problema actual

Actualmente la operación se encuentra fragmentada.

Parte de la información se administra mediante un sistema existente y otra parte mediante distintas planillas Excel.

Entre las herramientas mencionadas se encuentran:

- control de cortes;
- control de producción;
- stock de rollos;
- Excel maestro de envíos a talleres;
- hojas específicas por taller;
- calculadores de insumos;
- control de viajes y cadetería.

Esta fragmentación genera, entre otros problemas:

- duplicación de carga;
- pérdida de trazabilidad entre etapas;
- cálculos manuales;
- fórmulas de Excel difíciles de mantener;
- dificultad para seguir entregas parciales;
- dificultad para saber qué se envió y qué regresó de un taller;
- dificultad para diferenciar prendas buenas, falladas, reparadas o dadas de baja;
- información histórica distribuida en distintas herramientas.

El sistema anterior llegó a disponer de algunas funcionalidades de stock, pero fueron eliminadas porque afectaban negativamente el rendimiento de la aplicación.

Por ese motivo, el rendimiento y la simplicidad operativa deben considerarse requisitos importantes del nuevo sistema.

---

## 3. Objetivo funcional general

El sistema debe permitir responder preguntas como:

- ¿Qué prendas se están produciendo?
- ¿Qué corte originó determinada producción?
- ¿Qué tizada se utilizó?
- ¿Qué rollos de tela fueron consumidos?
- ¿Qué cantidad estaba planificada y qué cantidad se realizó realmente?
- ¿A qué taller se envió una producción?
- ¿Qué cantidad fue entregada?
- ¿La entrega fue parcial o final?
- ¿Qué prendas llegaron correctamente?
- ¿Qué prendas presentaron fallas?
- ¿Qué fallas fueron reparadas?
- ¿Qué prendas volvieron al taller?
- ¿Qué prendas terminaron en merma?
- ¿Qué insumos se utilizaron?
- ¿Qué movimientos ocurrieron durante la producción?
- ¿Cuál fue el costo histórico de producir una prenda?
- ¿Cuánto material se consumió durante un período?

La intención es que cada acción relevante deje un registro que permita reconstruir el historial de una producción.

---

## 4. Actores identificados

Los actores definitivos todavía deben formalizarse, pero durante el análisis inicial aparecen los siguientes perfiles funcionales.

### 4.1 Administrador

Usuario con permisos elevados.

Entre sus posibles responsabilidades:

- configuración del sistema;
- administración de usuarios;
- modificación excepcional de registros bloqueados;
- acceso a información global;
- corrección de datos cuando exista autorización.

Los permisos exactos deberán definirse mediante RBAC.

### 4.2 Responsable de corte

Usuario encargado de operaciones relacionadas con:

- planificación;
- rollos;
- tizadas;
- bloques;
- cantidades efectivamente cortadas.

El alcance exacto del rol todavía debe validarse.

### 4.3 Responsable de producción

Usuario encargado del seguimiento de producciones enviadas a talleres y de registrar entregas.

### 4.4 Responsable de control de calidad

Usuario encargado de registrar prendas correctas, fallas y resolución de fallas.

### 4.5 Usuarios de consulta

Usuarios que pueden visualizar información sin modificar datos críticos.

### 4.6 Talleres externos

Los talleres participan de la producción, pero en el proceso actual **no operan directamente el sistema**.

La carga se realiza internamente porque no se considera confiable delegar al taller la modificación directa de información productiva.

Esto puede revisarse en futuras etapas, pero no debe asumirse que los talleres tendrán usuarios propios.

---

## 5. Flujo general de producción

El flujo identificado hasta el momento puede representarse de forma simplificada como:

```text
Configuración de producto
        ↓
Definición de telas y composición
        ↓
Tizada
        ↓
Rollos disponibles
        ↓
Programación del corte
        ↓
Corte planificado
        ↓
Corte real
        ↓
Envío a taller de confección
        ↓
Entregas parciales / entrega final
        ↓
Control de calidad
        ↓
Corrección de fallas / devolución / merma
        ↓
Estampado, cuando corresponda
        ↓
Nuevo control de calidad
        ↓
Producto terminado
```

No todas las prendas necesariamente atraviesan exactamente las mismas etapas.

Por ejemplo, el estampado puede no aplicar a todos los productos.

---

## 6. Conceptos del dominio

### 6.1 Tela

Material utilizado para la confección de prendas.

Debe contemplar como mínimo:

- nombre o tipo;
- unidad de medida;
- ancho;
- colores o variantes.

El ancho es especialmente importante porque participa en el uso de las tizadas y en los cálculos de producción.

### 6.2 Rollo

Unidad física de tela disponible.

Un rollo puede registrar datos como:

- tipo de tela;
- color;
- peso;
- largo aproximado;
- ancho;
- estado o disponibilidad.

Los rollos deben poder ser seleccionados al preparar un corte.

El sistema debe conservar un historial de los rollos utilizados.

### 6.3 Prenda / Producto

Artículo textil que será confeccionado.

Ejemplos mencionados:

- remeras;
- pantalones;
- shorts;
- musculosas.

Una prenda puede estar formada por:

- una tela principal;
- una o más telas secundarias.

También puede requerir distintos avíos y componentes.

### 6.4 Ficha de composición

Documento o configuración que describe cómo está formada una prenda.

Puede incluir:

- especificaciones técnicas;
- piezas;
- estampados;
- componentes;
- información utilizada para verificar que una tizada contenga todas las piezas necesarias.

### 6.5 Tizada

Disposición o patrón utilizado para organizar las piezas que deben cortarse sobre la tela.

Las tizadas participan en el cálculo de cuántas prendas pueden obtenerse durante un corte.

Pueden incluir:

- pisadas;
- cantidad de copias;
- piezas;
- relación con una prenda;
- compatibilidad con determinado ancho de tela.

La definición matemática exacta de los cálculos asociados a una tizada todavía debe obtenerse de los procesos y archivos actuales.

### 6.6 Pisada

Concepto utilizado dentro de una tizada.

Está relacionado con la distribución/repetición de piezas utilizada para obtener determinadas cantidades y talles.

La definición exacta deberá validarse con los responsables de producción y con los ejemplos reales.

### 6.7 Bloque de confección

Agrupación utilizada durante la planificación de un corte.

Los bloques pueden representar distintas configuraciones de talles y cantidades.

Ejemplo conceptual:

```text
Bloque 1 → determinados talles
Bloque 2 → otros talles
Bloque 3 → otros talles
```

Cada bloque puede manejar cantidades o multiplicidades diferentes.

### 6.8 Capa

Cantidad de veces que la tela se superpone para realizar un corte.

Una mayor cantidad de capas produce una mayor cantidad de piezas/prendas.

La cantidad calculada por el sistema puede diferir de la cantidad efectivamente realizada.

### 6.9 Corte

Proceso mediante el cual se utiliza tela para obtener las piezas necesarias para confeccionar prendas.

Un corte puede relacionarse con:

- responsable;
- prenda;
- tela;
- tizada;
- rollos;
- bloques;
- capas;
- cantidades;
- cronograma;
- observaciones.

Debe diferenciarse entre:

- **cantidad planificada**, calculada o sugerida;
- **cantidad real**, efectivamente obtenida.

### 6.10 Taller

Proveedor externo que realiza parte del proceso productivo.

Puede intervenir, por ejemplo, en:

- confección;
- estampado.

Actualmente el sistema interno registra manualmente lo enviado y lo recibido de cada taller.

### 6.11 Producción

Seguimiento de las prendas generadas a partir de un corte y enviadas a confección.

Debe permitir conocer:

- cantidad enviada;
- cantidad recibida;
- faltante;
- entregas parciales;
- prendas correctas;
- prendas con fallas.

### 6.12 Entrega parcial

Entrega realizada por un taller que no completa todavía la totalidad de la producción solicitada.

Ejemplo:

```text
Producción esperada: 25 prendas
Primera entrega: 6 prendas
Faltante: 19 prendas
```

El sistema debe permitir registrar múltiples entregas hasta completar la producción.

Las entregas anteriores deben conservarse como hechos históricos.

### 6.13 Control de calidad

Proceso de revisión de prendas recibidas.

El control de calidad puede ocurrir en distintos momentos:

1. cuando las prendas regresan del taller de confección;
2. antes o durante el envío a estampado;
3. cuando las prendas regresan de estampado.

Debe ser posible registrar resultados por unidad cuando corresponda.

### 6.14 Falla

Problema detectado durante el control de una prenda.

Ejemplos mencionados:

- suciedad;
- costura torcida;
- prenda descosida;
- mancha;
- rotura;
- defecto propio de la tela.

Dos prendas del mismo talle pueden tener fallas distintas y resoluciones distintas.

Por este motivo, el registro de fallas debe poder manejarse a nivel unitario cuando sea necesario.

### 6.15 Reparación / resolución de falla

Una falla puede evolucionar hacia distintos resultados.

Se mencionan al menos los siguientes estados conceptuales:

- pendiente;
- enviada nuevamente al taller;
- reparada;
- no reparable.

Los estados definitivos deberán formalizarse durante la especificación de la feature correspondiente.

### 6.16 Merma

Material o producto que deja de ser aprovechable.

Puede existir merma de:

- prendas;
- tela.

Ejemplos:

- prendas manchadas no recuperables;
- defectos de tela;
- material fallado.

### 6.17 Avío

Elemento comprado a proveedores y utilizado como componente de una prenda.

Ejemplos mencionados:

- elásticos;
- cierres;
- cordones;
- etiquetas;
- botones;
- ojales;
- puños;
- logos;
- bolsas.

Los avíos deben poder tener:

- stock;
- stock mínimo;
- movimientos;
- asociación con producciones.

### 6.18 Remito

Registro utilizado para representar lo enviado o recibido de un taller.

El proceso actual compara:

- lo que internamente se registra como enviado;
- lo que el taller declara haber enviado;
- lo efectivamente controlado al recibirlo.

### 6.19 Estampado

Proceso posterior a la confección para determinadas prendas.

Puede realizarse mediante técnicas diferentes, como:

- serigrafía;
- vinilo.

El estampado puede requerir materiales adicionales.

También puede manejar entregas parciales.

### 6.20 Viaje / cadetería

Movimiento físico entre depósito, talleres u otros puntos.

Actualmente se registra en una planilla que incluye información como:

- fecha;
- taller;
- acción;
- origen/destino;
- dirección;
- teléfono;
- horario;
- observaciones;
- tipo de jornada.

Este módulo no forma parte necesariamente del primer MVP.

---

## 7. Reglas de negocio identificadas

Las reglas se numeran para poder referenciarlas desde futuras especificaciones.

### BR-001 — Ancho del rollo

Todo rollo utilizado en producción debe disponer de información de ancho suficiente para determinar su utilización con las tizadas correspondientes.

### BR-002 — Cantidad planificada y cantidad real

El sistema debe conservar por separado:

- la cantidad sugerida/calculada;
- la cantidad realmente producida o cortada.

La cantidad real puede ser inferior o diferente a la sugerida.

### BR-003 — Historial de rollos

El consumo de rollos debe dejar trazabilidad.

Debe poder determinarse qué rollos fueron utilizados en cada corte.

### BR-004 — Composición de prendas

Una prenda puede utilizar:

- una tela principal;
- cero o más telas secundarias.

### BR-005 — Entregas parciales

Una producción puede ser entregada en múltiples partes.

Cada entrega debe conservarse como un registro independiente dentro del historial de la producción.

### BR-006 — Protección de entregas confirmadas

Una entrega parcial ya confirmada no debe poder alterarse libremente durante entregas posteriores.

La modificación excepcional debe quedar restringida por permisos administrativos.

### BR-007 — Faltante de producción

Después de cada entrega, el sistema debe poder identificar la cantidad todavía pendiente de entrega.

### BR-008 — Fallas por unidad

Cuando diferentes prendas puedan presentar diferentes fallas o resoluciones, estas deben poder registrarse individualmente.

No debe asumirse que todas las prendas de un mismo talle comparten automáticamente el mismo resultado.

### BR-009 — Resolución independiente de fallas

Una falla puede resolverse de manera distinta de otra falla perteneciente al mismo lote o talle.

### BR-010 — Retorno al taller

Debe poder diferenciarse una prenda pendiente de reparación de una prenda que efectivamente fue enviada nuevamente al taller.

### BR-011 — Mermas

Las prendas o telas no recuperables deben poder registrarse como merma.

### BR-012 — Stock de avíos

Los avíos deben contemplar movimientos de entrada/salida y control de stock.

### BR-013 — Consumo de avíos

Una producción puede requerir calcular cantidades estimadas de determinados avíos.

Las fórmulas exactas no están definidas todavía y no deben inventarse.

### BR-014 — Historial

Los procesos productivos relevantes deben conservar historial suficiente para reconstruir movimientos y estados anteriores.

### BR-015 — Permisos

No todos los usuarios pueden realizar las mismas operaciones.

Las acciones críticas deben estar protegidas mediante roles/permisos.

### BR-016 — Seguridad en backend

Las restricciones de permisos deben validarse en el backend.

La interfaz puede ocultar acciones, pero no debe constituir el mecanismo real de autorización.

### BR-017 — Rendimiento

Las funciones relacionadas con stock y movimientos deben diseñarse evitando reproducir los problemas de rendimiento experimentados por el sistema anterior.

---

## 8. Modelo funcional preliminar

Este modelo representa conceptos del negocio y **no constituye todavía un modelo físico de Oracle**.

```text
Prenda
 ├── Composición
 │    ├── Tela principal
 │    └── Telas secundarias
 ├── Piezas
 └── Avíos

Tela
 └── Rollos

Tizada
 ├── Prenda
 ├── Pisadas
 └── Piezas

Corte
 ├── Prenda
 ├── Tizada
 ├── Rollos
 ├── Bloques
 ├── Capas planificadas
 └── Capas reales

Producción
 ├── Corte
 ├── Taller
 └── Entregas
      └── Control de calidad
           ├── Prendas correctas
           └── Fallas
                └── Resolución

Producción
 └── Estampado (opcional)
      └── Entregas
           └── Control de calidad

Avíos
 ├── Stock
 └── Movimientos

Logística
 └── Viajes
```

Este modelo deberá evolucionar mediante las especificaciones de cada feature.

---

## 9. MVP preliminar

La reunión inicial estableció que no resulta viable implementar todo el alcance funcional antes de la primera entrega.

El MVP debe priorizar las funcionalidades que permitan reemplazar una parte significativa de los procesos manuales actuales.

### 9.1 Núcleo funcional prioritario

Como orientación inicial:

- autenticación;
- usuarios, roles y permisos básicos;
- tipos de tela;
- rollos;
- stock básico de tela;
- prendas;
- tizadas;
- planificación de cortes;
- cantidades planificadas vs. reales;
- control básico de producción;
- talleres;
- entregas parciales;
- control de calidad básico;
- historial mínimo necesario.

### 9.2 Funcionalidades candidatas a etapas posteriores

Según prioridad y disponibilidad de información:

- avíos avanzados;
- cálculos automáticos de consumo de avíos;
- estampado completo;
- logística/cadetería;
- costos históricos;
- métricas avanzadas;
- estadísticas;
- reclamos a proveedores;
- integraciones con sistemas externos;
- importadores de Excel;
- sincronización con otros sistemas.

El alcance definitivo del MVP debe validarse con los responsables del negocio.

---

## 10. Integraciones identificadas

### 10.1 Sistema de ventas / Tienda Nube

Actualmente la venta por web/local y el descuento de stock comercial se encuentran gestionados mediante otro sistema relacionado con Tienda Nube.

MonkyForce no debe asumir inicialmente que reemplazará este sistema.

Una integración futura puede considerarse para intercambiar información de stock o productos.

### 10.2 Sistema actual de producción

Existe una aplicación utilizada actualmente.

Se solicitó acceso de solo lectura para estudiar su funcionamiento.

No se dispone inicialmente de su código fuente.

### 10.3 Excel existentes

Los Excel actuales son fuentes relevantes para:

- comprender procesos;
- identificar fórmulas;
- detectar campos;
- analizar historiales;
- definir posibles importaciones.

No deben copiarse automáticamente como modelo definitivo del nuevo sistema.

---

## 11. Auditoría y trazabilidad

Aunque el diseño técnico se definirá posteriormente, funcionalmente el sistema debe permitir conocer:

- quién realizó una operación relevante;
- cuándo ocurrió;
- qué producción/corte/entrega fue afectada;
- cuál fue el resultado.

Debe prestarse especial atención a:

- ajustes de stock;
- modificaciones de entregas;
- resolución de fallas;
- mermas;
- modificaciones administrativas.

---

## 12. Información pendiente / Open Questions

Las preguntas abiertas se identifican con prefijo `OQ`.

### OQ-001 — Fórmula de consumo de tela

**Estado:** Pendiente

¿Cómo se calcula actualmente la relación entre peso, metros, ancho y cantidad utilizable de tela?

**Fuente esperada:** sistema actual / Excel / responsables de corte.

**Impacto:** cálculo automático de cortes.

### OQ-002 — Fórmulas de tizadas

**Estado:** Pendiente

¿Cuáles son exactamente las fórmulas que relacionan:

- tizada;
- pisadas;
- copias;
- capas;
- talles;
- cantidad final de prendas?

**Fuente esperada:** responsables de corte y ejemplos reales.

### OQ-003 — Consumo de elásticos

**Estado:** Pendiente

¿Cuál es la fórmula utilizada actualmente para estimar metros de elástico según tipo de prenda, talle y cantidad?

**Fuente esperada:** calculador Excel actual.

### OQ-004 — Otros avíos calculados

**Estado:** Pendiente

¿Qué avíos poseen fórmulas automáticas y cuáles se cargan manualmente?

### OQ-005 — Catálogo definitivo de fallas

**Estado:** Pendiente

¿Qué tipos de falla deben existir inicialmente?

¿El catálogo es fijo o administrable?

### OQ-006 — Estados de fallas

**Estado:** Pendiente

Formalizar estados y transiciones posibles.

Ejemplo preliminar:

```text
Pendiente
→ Enviada al taller
→ Reparada
→ No reparable
```

Este flujo no debe tomarse todavía como definitivo.

### OQ-007 — Estados de producción

**Estado:** Pendiente

Formalizar el ciclo completo de estados de una producción.

### OQ-008 — Roles definitivos

**Estado:** Pendiente

Definir con Gastón y responsables:

- roles;
- permisos;
- acciones críticas;
- usuarios de consulta;
- posibles excepciones administrativas.

### OQ-009 — Métricas

**Estado:** Pendiente

Definir qué indicadores son necesarios para:

- operación;
- gestión;
- tesis;
- análisis de errores;
- costos;
- tiempos.

### OQ-010 — Costos

**Estado:** Pendiente

Definir qué componentes forman el costo histórico de una prenda.

Ejemplos posibles mencionados:

- telas;
- confección;
- avíos;
- estampado;
- otros costos.

No está formalizada aún la fórmula final.

### OQ-011 — Proveedores y reclamos

**Estado:** Pendiente

Definir reglas para registrar defectos de telas y plazos de reclamo según proveedor.

### OQ-012 — Alcance de integración con ventas

**Estado:** Pendiente

Determinar si MonkyForce únicamente consultará información del sistema comercial o si deberá sincronizar stock/productos.

### OQ-013 — Importación de históricos

**Estado:** Pendiente

Determinar qué datos existentes deben migrarse desde Excel o sistemas actuales y cuáles pueden comenzar desde cero.

---

## 13. Información esperada para continuar el análisis

Se espera obtener:

- acceso de solo lectura al sistema actual;
- Excel de control de cortes;
- Excel de control de producción;
- Excel de stock de rollos;
- Excel maestro de envíos;
- planillas por taller;
- calculadores de avíos;
- ejemplos de remitos;
- ejemplos de entregas parciales;
- ejemplos de control de calidad;
- reglas de mermas;
- información adicional de proveedores.

Estos elementos deberán utilizarse para validar y ampliar este documento.

---

## 14. Límites de este documento

`KNOWLEDGE.md` describe el conocimiento funcional del proyecto.

No debe utilizarse para fijar por sí solo:

- versiones de .NET;
- estructura interna del backend;
- ORM;
- estrategia de acceso a Oracle;
- librerías Angular;
- configuración JWT;
- estructura física de tablas;
- contratos HTTP;
- estructura de carpetas del código.

Esas decisiones pertenecen a `ARCHITECTURE.md` y a las especificaciones de cada feature.

---

## 15. Regla para agentes de IA

Cuando un agente trabaje en MonkyForce:

1. este documento es la referencia funcional general;
2. una SPEC de feature puede agregar mayor precisión sobre su funcionalidad específica;
3. una regla no documentada no debe ser inventada;
4. las preguntas marcadas como `OQ-*` siguen abiertas;
5. las fórmulas pendientes nunca deben implementarse basándose únicamente en supuestos;
6. si nueva información modifica una regla existente, debe actualizarse este documento o la SPEC correspondiente.

---

## 16. Estado del conocimiento

Este documento representa el conocimiento disponible después de la primera reunión funcional del proyecto.

Debe considerarse **evolutivo**.

A medida que se obtengan:

- nuevos Excel;
- acceso al sistema actual;
- reuniones con responsables;
- reglas de cálculo;
- decisiones de alcance;

el conocimiento deberá consolidarse aquí sin convertir este archivo en un historial de conversaciones.

La información histórica debe conservarse en las fuentes originales; este documento debe contener siempre la **versión funcional consolidada vigente**.
