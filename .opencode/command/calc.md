---
description: Calcular materiales para construccion segun NCh 170
agent: calculista
subtask: true
---

Calcula los materiales necesarios para: $ARGUMENTS

Usa las formulas de @src/utils/calculations.ts y las constantes de @src/utils/constants.ts.

Entrega el calculo completo incluyendo:
1. Dimensiones y volumen/superficie calculada
2. Materiales base segun dosificacion
3. Con factor de desperdicio aplicado
4. Total en unidades practicas (sacos de 42.5kg, m³)
5. Malla ACMA recomendada si aplica

Si no se especifica grado de hormigon, usa H25 por defecto.
