// ========================================
// PALETA DE COLORES PARA GRÁFICAS D3.js
// ========================================
const colorPalette = {
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


// ========================================
// SCROLLYTELLING - VISUALIZACIONES D3.js
// ========================================

// Configuración del contenedor de visualización
const container = d3.select('#vis');
const width = container.node().getBoundingClientRect().width;
const height = 500;
const margin = { top: 40, right: 40, bottom: 40, left: 40 };

// Crear SVG
const svg = container.append('svg')
    .attr('width', width)
    .attr('height', height);

// ========================================
// STEP 1: CALENDAR HEATMAP - School Closure
// ========================================

// Variable global para controlar el substep actual
let currentSubstep = 1;

function drawCalendarHeatmap(substep = 1) {
    svg.selectAll('*').remove();
    currentSubstep = substep;

    // Generar datos: días desde Enero 2019 hasta Diciembre 2022
    const startDate = new Date('2019-01-01');
    const endDate = new Date('2022-12-31');
    const pandemicStart = new Date('2020-03-23');

    const daysData = [];
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
        const year = currentDate.getFullYear();
        daysData.push({
            date: new Date(currentDate),
            year: year,
            isPandemic: currentDate >= pandemicStart
        });
        currentDate.setDate(currentDate.getDate() + 1);
    }

    // Tamaño de celda y padding
    const cellSize = 10;
    const cellPadding = 1;
    const cellSide = cellSize + cellPadding;

    // Espacio para ejes y labels
    const leftMargin = 80;
    const topMargin = 80;
    const rightMargin = 80;
    const bottomMargin = 100;

    // Calcular dimensiones
    const startX = leftMargin;
    const startY = topMargin;
    const availableWidth = width - leftMargin - rightMargin;
    const availableHeight = height - topMargin - bottomMargin;
    const cellsPerRow = Math.floor(availableWidth / cellSide);
    const cellsPerColumn = Math.floor(availableHeight / cellSide);
    const heatmapHeight = cellsPerColumn * cellSide;

    function getPosition(d, index) {
        const x = startX + (index % cellsPerRow) * cellSide;
        const y = startY + Math.floor(index / cellsPerRow) * cellSide;
        return { x, y };
    }

    // Colores por año (paleta institucional con contraste RGB)
    const yearColors = {
        2019: colorPalette.categorical[0],  // Dorado #B9975B
        2020: colorPalette.categorical[1],  // Azul #002D72 (opuesto al dorado)
        2021: colorPalette.categorical[2],  // Vino #8A1538 (opuesto al verde)
        2022: colorPalette.categorical[3]   // Verde #215347 (opuesto al rojo)
    };

    // Función para obtener color de fondo por año
    function getYearColor(year) {
        return yearColors[year] || colorPalette.categorical[0];
    }

    // Título
    svg.append('text')
        .attr('x', width / 2)
        .attr('y', 30)
        .attr('text-anchor', 'middle')
        .attr('font-size', '20px')
        .attr('font-weight', '600')
        .attr('fill', colorPalette.story.textMain)
        .text('Clases 2019-2022');

    // Dibujar días como rectángulos
    svg.selectAll('rect.day')
        .data(daysData)
        .join('rect')
        .attr('class', 'day')
        .attr('x', (d, i) => getPosition(d, i).x)
        .attr('y', (d, i) => getPosition(d, i).y)
        .attr('width', cellSize)
        .attr('height', cellSize)
        .attr('rx', 1)
        .attr('fill', d => getYearColor(d.year))
        .attr('opacity', 0.8)
        .attr('stroke', '#ffffff')
        .attr('stroke-width', 0.5);

    // Leyenda centrada en la parte inferior
    const legendY = startY + heatmapHeight + 40;
    const legendItemWidth = 120;
    const legendStartX = (width - (legendItemWidth * 4)) / 2;

    // Años con sus colores
    const years = [
        { year: 2019, color: yearColors[2019], label: '2019' },
        { year: 2020, color: yearColors[2020], label: '2020' },
        { year: 2021, color: yearColors[2021], label: '2021' },
        { year: 2022, color: yearColors[2022], label: '2022' }
    ];

    years.forEach((item, i) => {
        svg.append('rect')
            .attr('x', legendStartX + (i * legendItemWidth))
            .attr('y', legendY)
            .attr('width', 14)
            .attr('height', 14)
            .attr('rx', 2)
            .attr('fill', item.color)
            .attr('opacity', 0.8);

        svg.append('text')
            .attr('x', legendStartX + (i * legendItemWidth) + 20)
            .attr('y', legendY + 11)
            .attr('font-size', '20px')
            .attr('font-weight', '600')
            .attr('fill', colorPalette.texto)
            .text(item.label);
    });
}

// Función para actualizar solo los colores basado en progreso de scroll
function updateCalendarColors(progress) {
    svg.selectAll('rect.day')
        .transition()
        .duration(10)
        .attr('fill', function (d) {
            if (!d.isPandemic) {
                // Pre-pandemia mantiene color de año con más opacidad
                return d3.color(getYearColorForUpdate(d.year)).brighter(0.3);
            } else {
                // Post-pandemia interpola hacia negro según progress
                return pandemicColor(progress, d.year);
            }
        })
}


// Helper para obtener color de año en update
function getYearColorForUpdate(year) {
    const yearColors = {
        2019: colorPalette.categorical[0],
        2020: colorPalette.categorical[1],
        2021: colorPalette.categorical[2],
        2022: colorPalette.categorical[3]
    };
    return yearColors[year] || colorPalette.categorical[0];
}

function pandemicColor(progress, year) {
    const initColor = getYearColorForUpdate(year);
    const pandemicColorScale = d3.scaleLinear()
        .domain([0, 1])
        .range([initColor, "#1a1a1a"]);
    return pandemicColorScale(progress);
}

// ========================================
// STEP 2: LEARNING POVERTY VISUALIZATION
// ========================================

let learningPovertyData = null;
let currentStep2Substep = 1;

// Cargar datos de learning poverty
async function loadLearningPovertyData() {
    if (!learningPovertyData) {
        const response = await fetch('data/learning_poverty.json');
        learningPovertyData = await response.json();
    }
    return learningPovertyData;
}

async function drawLearningPoverty(substep = 1) {
    svg.selectAll('*').remove();
    currentStep2Substep = substep;

    const data = await loadLearningPovertyData();

    // Transformar datos para D3
    const years = [2015, 2019, 2022];
    const regions = data.map(d => ({
        region: d.region,
        values: years.map(year => ({
            year: year,
            value: d[year.toString()]
        }))
    }));

    // MISMOS MÁRGENES QUE STEP 1
    const vizMargin = {
        top: 80,
        right: 80,
        bottom: 100,
        left: 80
    };

    // Escalas
    const xScale = d3.scaleLinear()
        .domain([2015, 2022])
        .range([vizMargin.left, width - vizMargin.right]);

    const yScale = d3.scaleLinear()
        .domain([0, 100])
        .range([height - vizMargin.bottom, vizMargin.top]);

    // Generador de línea
    const line = d3.line()
        .x(d => xScale(d.year))
        .y(d => yScale(d.value));

    // Título
    svg.append('text')
        .attr('x', width / 2)
        .attr('y', 30)
        .attr('text-anchor', 'middle')
        .attr('font-size', '20px')
        .attr('font-weight', '600')
        .attr('fill', colorPalette.story.textMain)
        .text('Pobreza del Aprendizaje en el Mundo');

    // Ejes con ticks personalizados
    const xAxis = d3.axisBottom(xScale)
        .tickValues([2015, 2019, 2022])
        .tickFormat(d3.format('d'));

    svg.append('g')
        .attr('transform', `translate(0,${height - vizMargin.bottom})`)
        .call(xAxis)
        .style('font-size', '16px');

    svg.append('g')
        .attr('transform', `translate(${vizMargin.left},0)`)
        .call(d3.axisLeft(yScale))
        .style('font-size', '16px');

    // Label Y
    svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -height / 2)
        .attr('y', 20)
        .attr('text-anchor', 'middle')
        .attr('font-size', '18px')
        .attr('font-weight', '600')
        .attr('fill', colorPalette.story.textMain)
        .text('Pobreza del aprendizaje (%)');

    if (substep === 1) {
        // SUBSTEP 1: 6 regiones (sin LATAM, sin destacar Global)
        const regionColors = [
            colorPalette.story.context, // 4. Gris Lavanda (Claro - contraste alto vs Verde)
            colorPalette.categorical[0],
            colorPalette.categorical[1],
            colorPalette.categorical[2],
            colorPalette.categorical[3],
            colorPalette.categorical[4],
            colorPalette.categorical[5]
        ];

        let colorIndex = 0;
        const legendItems = [];

        regions.forEach(regionData => {
            if (regionData.region === 'América Latina y el Caribe') return;

            const color = regionColors[colorIndex % regionColors.length];
            const strokeWidth = regionData.region === 'Global (Ingreso bajo y medio)' ? 5 : 2.5;
            console.log(regionData.region, strokeWidth);

            // Línea
            svg.append('path')
                .attr('class', 'region-line')
                .datum(regionData.values)
                .attr('fill', 'none')
                .attr('stroke', color)
                .attr('stroke-width', strokeWidth)
                .attr('opacity', 0.8)
                .attr('d', line);

            legendItems.push({
                label: regionData.region,
                color: color
            });

            colorIndex++;
        });

        // LEYENDA SUBSTEP 1
        const legendY = height - vizMargin.bottom + 60;
        const legendItemWidth = 280;
        const legendRows = 2;
        const legendCols = 3;

        legendItems.forEach((item, i) => {
            const row = Math.floor(i / legendCols);
            const col = i % legendCols;
            const x = vizMargin.left + (col * legendItemWidth);
            const y = legendY + (row * 25);

            svg.append('rect')
                .attr('x', x)
                .attr('y', y - 10)
                .attr('width', 14)
                .attr('height', 3)
                .attr('fill', item.color);

            svg.append('text')
                .attr('x', x + 20)
                .attr('y', y - 3)
                .attr('font-size', '16px')
                .attr('fill', colorPalette.texto)
                .text(item.label);
        });

    } else if (substep === 2) {
        // SUBSTEP 2: Comparativo con LATAM
        // Remover todas las líneas menos Global
        svg.selectAll('.region-line').remove();

        // 1. Dibujar línea COMPLETA de Global (todos los segmentos)
        const globalData = regions.find(r => r.region === 'Global (Ingreso bajo y medio)');
        svg.append('path')
            .datum(globalData.values)
            .attr('fill', 'none')
            .attr('stroke', colorPalette.story.context)
            .attr('stroke-width', 5)
            .attr('opacity', 0.7)
            .attr('d', line);

        // 2. Remover todas las líneas menos global
        const latamData = regions.find(r => r.region === 'América Latina y el Caribe');
        const latamPath = svg.append('path')
            .datum(latamData.values)
            .attr('fill', 'none')
            .attr('stroke', '#dc2626')
            .attr('stroke-width', 3)
            .attr('opacity', 0.7)
            .attr('d', line);

        // Animación stroke-dasharray
        const pathLength = latamPath.node().getTotalLength();

        latamPath
            .attr('stroke-dasharray', `${pathLength} ${pathLength}`)
            .attr('stroke-dashoffset', pathLength)
            .transition()
            .duration(2000)
            .ease(d3.easeQuadInOut)
            .attr('stroke-dashoffset', 0);

        // LEYENDA SUBSTEP 2
        const legendY = height - vizMargin.bottom + 60;
        const legendItemWidth = 200;
        const legendStartX = (width - (legendItemWidth * 2)) / 2;

        const legendItems = [
            { label: 'Global (Ingreso bajo y medio)', color: colorPalette.primario },
            { label: 'América Latina y el Caribe', color: '#dc2626' }
        ];

        legendItems.forEach((item, i) => {
            const x = legendStartX + (i * legendItemWidth);

            svg.append('rect')
                .attr('x', x)
                .attr('y', legendY - 10)
                .attr('width', 14)
                .attr('height', 3)
                .attr('fill', item.color);

            svg.append('text')
                .attr('x', x + 20)
                .attr('y', legendY - 3)
                .attr('font-size', '12px')
                .attr('font-weight', i === 1 ? '600' : 'normal')
                .attr('fill', colorPalette.texto)
                .text(item.label);
        });
    }
}

// ========================================
// STEP 3: TIME SERIES (2003-2022)
// ========================================
function drawTimeSeries() {
    svg.selectAll('*').remove();

    // Generar datos con retroceso al final
    const startYear = 2003;
    const endYear = 2022;
    const initialValue = 395;

    const data = [];
    for (let year = startYear; year <= endYear; year++) {
        let value;
        if (year === startYear) {
            value = initialValue;
        } else if (year <= 2018) {
            value = data[data.length - 1].value + (Math.random() * 10 - 3);
        } else {
            // Declive después de 2019
            value = data[data.length - 1].value - (Math.random() * 8 + 2);
        }
        data.push({ year, value });
    }

    // Ajustar valor final para que sea igual al inicial
    data[data.length - 1].value = initialValue + (Math.random() * 10 - 5);

    // Escalas
    const xScale = d3.scaleLinear()
        .domain([startYear, endYear])
        .range([margin.left, width - margin.right]);

    const yScale = d3.scaleLinear()
        .domain([d3.min(data, d => d.value) - 10, d3.max(data, d => d.value) + 10])
        .range([height - margin.bottom, margin.top]);

    // Línea
    const line = d3.line()
        .x(d => xScale(d.year))
        .y(d => yScale(d.value));

    // Dibujar línea principal
    svg.append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', colorPalette.primario)
        .attr('stroke-width', 3)
        .attr('d', line);

    // Segmento de retroceso en rojo (2019-2022)
    const regressionData = data.filter(d => d.year >= 2019);
    svg.append('path')
        .datum(regressionData)
        .attr('fill', 'none')
        .attr('stroke', '#dc2626')
        .attr('stroke-width', 4)
        .attr('d', line);

    // Etiqueta "Retroceso de 20 años"
    const lastPoint = data[data.length - 1];
    svg.append('text')
        .attr('x', xScale(lastPoint.year) - 10)
        .attr('y', yScale(lastPoint.value) - 15)
        .attr('text-anchor', 'end')
        .attr('font-size', '14px')
        .attr('font-weight', '600')
        .attr('fill', '#dc2626')
        .text('Retroceso de 20 años');

    // Ejes
    svg.append('g')
        .attr('transform', `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(xScale).tickFormat(d3.format('d')));

    svg.append('g')
        .attr('transform', `translate(${margin.left},0)`)
        .call(d3.axisLeft(yScale));

    // Label Y
    svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -height / 2)
        .attr('y', 15)
        .attr('text-anchor', 'middle')
        .attr('font-size', '12px')
        .text('Puntajes PISA en Matemáticas');
}

// ========================================
// STEP 4: SANKEY DIAGRAM (Simplified)
// ========================================
function drawSankeyDiagram() {
    svg.selectAll('*').remove();

    // Datos simplificados
    const totalStudents = 100;
    const dropout = 15;
    const suicide = 1.5;
    const childLabor = 10;
    const crime = 5;
    const remaining = dropout - suicide - childLabor - crime; // -1.5, pero conceptualmente

    const nodeWidth = 20;
    const nodeGap = 80;
    const startX = 100;
    const startY = height / 2 - 50;

    // Nodo: 100% estudiantes
    svg.append('rect')
        .attr('x', startX)
        .attr('y', startY)
        .attr('width', nodeWidth)
        .attr('height', 100)
        .attr('fill', colorPalette.primario);

    svg.append('text')
        .attr('x', startX - 10)
        .attr('y', startY + 50)
        .attr('text-anchor', 'end')
        .attr('font-size', '12px')
        .text('100% Estudiantes');

    // Nodo: 15% abandonan
    svg.append('rect')
        .attr('x', startX + nodeGap + nodeWidth)
        .attr('y', startY + 85)
        .attr('width', nodeWidth)
        .attr('height', 15)
        .attr('fill', '#dc2626');

    svg.append('text')
        .attr('x', startX + nodeGap + nodeWidth + 30)
        .attr('y', startY + 95)
        .attr('font-size', '11px')
        .text('15% Abandonan');

    // Flujos hacia outcomes
    const outcomes = [
        { label: '1.5% Suicidio', value: 1.5, y: startY + 85 },
        { label: '10% Trabajo Infantil', value: 10, y: startY + 100 },
        { label: '5% Crimen', value: 5, y: startY + 115 }
    ];

    outcomes.forEach((outcome, i) => {
        const outcomeX = startX + (nodeGap + nodeWidth) * 2;
        const outcomeY = startY + 70 + (i * 20);

        // Nodo outcome
        svg.append('rect')
            .attr('x', outcomeX)
            .attr('y', outcomeY)
            .attr('width', nodeWidth)
            .attr('height', outcome.value)
            .attr('fill', colorPalette.secundario)
            .attr('opacity', 0.8);

        // Label
        svg.append('text')
            .attr('x', outcomeX + nodeWidth + 10)
            .attr('y', outcomeY + outcome.value / 2 + 4)
            .attr('font-size', '10px')
            .text(outcome.label);
    });

    // Título
    svg.append('text')
        .attr('x', width / 2)
        .attr('y', 30)
        .attr('text-anchor', 'middle')
        .attr('font-size', '16px')
        .attr('font-weight', '600')
        .attr('fill', colorPalette.primario)
        .text('Flujo de Estudiantes');
}

// ========================================
// STEP 5: COMPARATIVE BAR CHART (2025 vs 2045)
// ========================================
function drawComparativeBarChart() {
    svg.selectAll('*').remove();

    const gdp2025 = 100;
    const gdpLost = 100; // Mismo tamaño
    const gdpMarginal = 50;

    const data = [
        { year: '2025', value: gdp2025, type: 'current' },
        { year: '2045', valueLost: gdpLost, valueMarginal: gdpMarginal, type: 'future' }
    ];

    const xScale = d3.scaleBand()
        .domain(['2025', '2045'])
        .range([margin.left + 50, width - margin.right - 50])
        .padding(0.4);

    const yScale = d3.scaleLinear()
        .domain([0, gdpLost + gdpMarginal + 20])
        .range([height - margin.bottom, margin.top]);

    // Barra 2025
    svg.append('rect')
        .attr('x', xScale('2025'))
        .attr('y', yScale(gdp2025))
        .attr('width', xScale.bandwidth())
        .attr('height', yScale(0) - yScale(gdp2025))
        .attr('fill', colorPalette.primario);

    svg.append('text')
        .attr('x', xScale('2025') + xScale.bandwidth() / 2)
        .attr('y', yScale(gdp2025) - 10)
        .attr('text-anchor', 'middle')
        .attr('font-size', '14px')
        .attr('font-weight', '600')
        .text('100%');

    // Barra 2045 - PIB perdido (rojo)
    svg.append('rect')
        .attr('x', xScale('2045'))
        .attr('y', yScale(gdpLost))
        .attr('width', xScale.bandwidth())
        .attr('height', yScale(0) - yScale(gdpLost))
        .attr('fill', '#dc2626')
        .attr('opacity', 0.8);

    svg.append('text')
        .attr('x', xScale('2045') + xScale.bandwidth() / 2)
        .attr('y', yScale(gdpLost / 2))
        .attr('text-anchor', 'middle')
        .attr('font-size', '12px')
        .attr('fill', 'white')
        .text('PIB Perdido');

    // Barra 2045 - PIB marginal (verde)
    svg.append('rect')
        .attr('x', xScale('2045'))
        .attr('y', yScale(gdpLost + gdpMarginal))
        .attr('width', xScale.bandwidth())
        .attr('height', yScale(gdpLost) - yScale(gdpLost + gdpMarginal))
        .attr('fill', colorPalette.primario);

    svg.append('text')
        .attr('x', xScale('2045') + xScale.bandwidth() / 2)
        .attr('y', yScale(gdpLost + gdpMarginal / 2))
        .attr('text-anchor', 'middle')
        .attr('font-size', '12px')
        .attr('fill', 'white')
        .text('PIB Marginal');

    // Ejes
    svg.append('g')
        .attr('transform', `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(xScale));

    svg.append('g')
        .attr('transform', `translate(${margin.left + 50},0)`)
        .call(d3.axisLeft(yScale));

    // Label Y
    svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -height / 2)
        .attr('y', margin.left - 10)
        .attr('text-anchor', 'middle')
        .attr('font-size', '12px')
        .text('PIB (% relativo)');
}

// ========================================
// STEP 6: RAPID PILLARS
// ========================================
function drawRAPIDPillars() {
    svg.selectAll('*').remove();

    const letters = ['R', 'A', 'P', 'I', 'D'];
    const labels = ['Reach', 'Assess', 'Prioritize', 'Increase', 'Develop'];
    const pillarWidth = 80;
    const pillarHeight = 200;
    const spacing = 20;
    const totalWidth = (pillarWidth * 5) + (spacing * 4);
    const startX = (width - totalWidth) / 2;
    const startY = height - margin.bottom - pillarHeight - 40;

    letters.forEach((letter, i) => {
        const x = startX + (i * (pillarWidth + spacing));

        // Pilar
        svg.append('rect')
            .attr('x', x)
            .attr('y', startY)
            .attr('width', pillarWidth)
            .attr('height', pillarHeight)
            .attr('fill', colorPalette.acento2)
            .attr('opacity', 0.3)
            .transition()
            .delay(i * 200)
            .duration(800)
            .attr('fill', colorPalette.primario)
            .attr('opacity', 1);

        // Letra
        svg.append('text')
            .attr('x', x + pillarWidth / 2)
            .attr('y', startY + pillarHeight + 30)
            .attr('text-anchor', 'middle')
            .attr('font-size', '36px')
            .attr('font-weight', '600')
            .attr('fill', colorPalette.acento2)
            .text(letter)
            .transition()
            .delay(i * 200)
            .duration(800)
            .attr('fill', colorPalette.primario);

        // Label
        svg.append('text')
            .attr('x', x + pillarWidth / 2)
            .attr('y', startY - 10)
            .attr('text-anchor', 'middle')
            .attr('font-size', '11px')
            .attr('fill', colorPalette.texto)
            .text(labels[i]);
    });
}

// ========================================
// HELPER: Transiciones suaves entre gráficos
// ========================================
function transitionToVisualization(drawFunction) {
    // Fade out el contenido actual
    svg.selectAll('*')
        .transition()
        .duration(1000)
        .style('opacity', 0)
        .on('end', function (d, i, nodes) {
            // Solo ejecutar una vez (en el último elemento)
            if (i === nodes.length - 1) {
                // Limpiar todo
                svg.selectAll('*').remove();

                // Dibujar nuevo gráfico con opacidad 0
                drawFunction();

                // Fade in el nuevo contenido
                svg.selectAll('*')
                    .style('opacity', 0)
                    .transition()
                    .duration(1000)
                    .style('opacity', 1);
            }
        });
}

// ========================================
// NAVBAR DINÁMICA - Helper Functions
// ========================================

const navbar = document.getElementById('scrolly-navbar');
const navbarTitle = document.getElementById('navbar-title');
let currentTitle = '';

// Mostrar la navbar
function showNavbar() {
    navbar.classList.add('visible');
}

// Ocultar la navbar
function hideNavbar() {
    navbar.classList.remove('visible');
}

// Actualizar el título con transición suave
function updateNavbarTitle(step) {
    const titles = [
        "El Mounstro Invisible",
        "La Pobreza del Aprendizaje",
        "Retroceso en el Tiempo",
        "Las Víctimas",
        "La Sombra Económica",
        "El Arma para Vencer"
    ]
    const newTitle = titles[step - 1];

    if (newTitle === currentTitle) return;

    // Fade out
    navbarTitle.classList.add('fade-out');

    setTimeout(() => {
        // Cambiar texto
        navbarTitle.textContent = newTitle;
        currentTitle = newTitle;

        // Fade in
        navbarTitle.classList.remove('fade-out');
    }, 1000);
}

// ========================================
// CONFIGURACIÓN SCROLLAMA
// ========================================

// Configurar scrollama
const scroller = scrollama();

scroller
    .setup({
        step: '.step',
        offset: 0.5,
        debug: false,
        progress: true
    })
    .onStepEnter(response => {
        const step = response.element.dataset.step;

        // Remover clase activa de todos los pasos
        document.querySelectorAll('.step').forEach(s => s.classList.remove('is-active'));

        // Agregar clase activa al paso actual
        response.element.classList.add('is-active');

        // Mostrar navbar cuando entramos a cualquier step
        showNavbar();

        updateNavbarTitle(step);

        // Cambiar visualización según el paso
        switch (step) {
            case '1':
                // Dibujar el calendario solo la primera vez
                if (!svg.select('rect.day').node()) {
                    drawCalendarHeatmap(1);
                }
                break;
            case '2':
                // Step 2 tiene substeps
                const substep = parseInt(response.element.dataset.substep) || 1;
                if (!svg.select('path').node() || substep !== currentStep2Substep) {
                    transitionToVisualization(() => drawLearningPoverty(substep));
                }
                break;
            case '3':
                transitionToVisualization(drawTimeSeries);
                break;
            case '4':
                transitionToVisualization(drawSankeyDiagram);
                break;
            case '5':
                transitionToVisualization(drawComparativeBarChart);
                break;
            case '6':
                transitionToVisualization(drawRAPIDPillars);
                break;
        }
    })
    .onStepProgress(response => {
        const step = response.element.dataset.step;

        // Solo actualizar colores si estamos en Step 1
        if (step === '1') {
            // response.progress va de 0 a 1 dentro de cada substep
            // Necesitamos calcular el progreso total dentro del Step 1
            const substep = parseInt(response.element.dataset.substep);
            const totalSubsteps = 4;

            // Calcular progreso global (0-1 a través de todos los 4 substeps)
            const globalProgress = ((substep - 1) + response.progress) / totalSubsteps;

            // Actualizar colores con el progreso global
            if (svg.select('rect.day').node()) {
                updateCalendarColors(globalProgress);
            }
        }
    });

// Manejar resize
window.addEventListener('resize', scroller.resize);

// Inicializar con la primera visualización
drawCalendarHeatmap();
