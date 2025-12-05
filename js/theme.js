// ========================================
// PALETA DE COLORES PARA GRÁFICAS D3.js
// ========================================

export const colorPalette = {
    // --- 1. STORY PALETTE (Semántica Narrativa) ---
    // Úsala cuando el dato tiene una carga moral o narrativa específica.
    story: {
        crisis: '#8A1538',      // Vino Institucional (El problema, el rezago)
        crisisHighlight: '#C41E3A', // Rojo Alerta (Para puntos específicos o énfasis máximo)
        hope: '#215347',        // Verde Posgrados (La solución, el modelo RAPID)
        value: '#B9975B',       // Dorado (Dinero, PIB, Valor Económico)
        context: '#A8B6CC',     // Gris Azulado (Datos de fondo, promedio OCDE)
        textMain: '#002D72',    // Azul Oscuro (Títulos y texto principal)
        background: '#F4F6F8'   // Gris muy pálido (Fondo de gráficos)
    },

    // --- 2. CATEGORICAL PALETTE (Alto Contraste) ---
    // 8 colores diseñados para usarse en orden. 
    // Patrón: Oscuro -> Claro -> Oscuro -> Claro. 
    // Garantiza que barras o rebanadas adyacentes siempre tengan contraste visual.
    categorical: [
        '#A8B6CC', // 4. Gris Lavanda (Claro - contraste alto vs Verde)
        '#002D72', // 1. Azul Oscuro (Base fuerte)
        '#E5C585', // 2. Arena Dorado (Claro - contraste alto vs Azul)
        '#215347', // 3. Verde Posgrados (Oscuro - contraste alto vs Arena)
        '#8A1538', // 5. Rojo Vino (Oscuro - contraste alto vs Gris)
        '#4DA99C', // 6. Teal Menta (Claro - contraste alto vs Vino)
        '#2D3E50', // 7. Slate Profundo (Oscuro - contraste alto vs Teal)
        '#B9975B'  // 8. Dorado Institucional (Medio/Claro - cierre)
    ],

    // --- 3. DIVERGENT PALETTE (Semáforo Institucional) ---
    // Interpolación: Rojo Vino -> Blanco Neutro -> Verde Posgrados
    // Uso: Gráficos de desviación (pérdida vs ganancia).
    divergent: [
        '#580E24', // 1. Rojo Vino Profundo (Muy negativo)
        '#8A1538', // 2. Rojo Vino Base
        '#B34D63', // 3. Rojo medio
        '#D68A99', // 4. Rojo claro
        '#F2D4DA', // 5. Rojo pálido (Ligeramente negativo)
        '#D6E6E3', // 6. Verde pálido (Ligeramente positivo)
        '#8FBDB6', // 7. Verde medio claro
        '#00685E', // 8. Verde Azulado
        '#215347', // 9. Verde Posgrados
        '#0E2922'  // 10. Verde Profundo (Excelencia)
    ],

    // --- 4. POSITIVE SEQUENTIAL (Rampa de Valor/Esperanza) ---
    // Interpolación: Blanco -> Dorado -> Verde
    // Uso: Mapas de calor de cosas buenas (ej. Cobertura, Escolaridad).
    positiveSequential: [
        '#FFFFFF', // Inicio (Vacío)
        '#F3EAD8', // Transición suave
        '#B9975B', // Medio (Dorado)
        '#00685E', // Transición Teal
        '#215347'  // Fin (Verde Fuerte)
    ],

    // --- 5. NEGATIVE SEQUENTIAL (Rampa de Alerta) ---
    // Interpolación: Blanco -> Salmón -> Vino
    // Uso: Mapas de calor de cosas malas (ej. Deserción, Pobreza de Aprendizaje).
    negativeSequential: [
        '#FFFFFF', // Inicio (Vacío)
        '#F2D4DA', // Rosado pálido
        '#D68A99', // Rojo medio
        '#8A1538', // Fin (Vino Fuerte)
        '#42080F'  // Extra Dark (Para valores extremos fuera de escala)
    ],

    // --- HELPERS (Generadores de Escalas D3) ---
    // Pasa estas funciones a tus escalas d3 (domain se define en el gráfico).
    getScale: function (type) {
        switch (type) {
            case 'categorical':
                return d3.scaleOrdinal(this.categorical);

            case 'divergent':
                // Requiere dominio de 3 puntos: [min, centro, max]
                return d3.scaleDiverging()
                    .interpolator(d3.interpolateRgbBasis(this.divergent));

            case 'seq-positive':
                return d3.scaleSequential()
                    .interpolator(d3.interpolateRgbBasis(this.positiveSequential));

            case 'seq-negative':
                return d3.scaleSequential()
                    .interpolator(d3.interpolateRgbBasis(this.negativeSequential));

            default:
                return d3.scaleOrdinal(this.categorical);
        }
    }
};
