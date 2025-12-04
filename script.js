// ========================================
// PALETA DE COLORES PARA GRÁFICAS D3.js
// ========================================

const colorPalette = {
    // Colores principales
    azulOscuro: '#002D72',
    rojoVino: '#8A1538',
    verdeOscuro: '#215347',
    verdeAzulado: '#00685E',
    dorado: '#B9975B',
    negro: '#000000',
    blanco: '#FFFFFF',

    // Alias para uso común
    primario: '#215347',        // Verde Posgrados
    secundario: '#8A1538',
    acento1: '#00685E',
    acento2: '#B9975B',         // Dorado Institucional

    // Arrays para usar en escalas de colores D3
    coloresPrincipales: ['#215347', '#B9975B', '#002D72', '#00685E', '#8A1538'],
    coloresCategoricos: ['#215347', '#B9975B', '#00685E', '#002D72', '#8A1538'],
    coloresSecuenciales: ['#B9975B', '#00685E', '#215347', '#8A1538', '#002D72'],

    // Función helper para obtener una escala de colores D3
    getD3ColorScale: function (type = 'ordinal') {
        if (type === 'ordinal' || type === 'categorical') {
            return d3.scaleOrdinal(this.coloresCategoricos);
        } else if (type === 'sequential') {
            return d3.scaleSequential()
                .interpolator(d3.interpolateRgbBasis(this.coloresSecuenciales));
        } else if (type === 'diverging') {
            return d3.scaleDiverging()
                .interpolator(d3.interpolateRgbBasis([this.rojoVino, this.blanco, this.primario]));
        }
        return d3.scaleOrdinal(this.coloresPrincipales);
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
        2019: colorPalette.acento2,      // Dorado #B9975B
        2020: colorPalette.azulOscuro,   // Azul #002D72 (opuesto al dorado)
        2021: colorPalette.rojoVino,     // Vino #8A1538 (opuesto al verde)
        2022: colorPalette.verdeOscuro   // Verde #215347 (opuesto al rojo)
    };

    // Función para obtener color de fondo por año
    function getYearColor(year) {
        return yearColors[year] || colorPalette.acento2;
    }

    // Título
    svg.append('text')
        .attr('x', width / 2)
        .attr('y', 30)
        .attr('text-anchor', 'middle')
        .attr('font-size', '20px')
        .attr('font-weight', '600')
        .attr('fill', colorPalette.primario)
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
        2019: colorPalette.acento2,
        2020: colorPalette.azulOscuro,
        2021: colorPalette.rojoVino,
        2022: colorPalette.verdeOscuro
    };
    return yearColors[year] || colorPalette.acento2;
}

function pandemicColor(progress, year) {
    const initColor = getYearColorForUpdate(year);
    const pandemicColorScale = d3.scaleLinear()
        .domain([0, 1])
        .range([initColor, "#1a1a1a"]);
    return pandemicColorScale(progress);
}

// ========================================
// STEP 2: MULTI-LINE CHART
// ========================================
function drawMultiLineChart() {
    svg.selectAll('*').remove();

    const years = [2015, 2019, 2022];
    const numLines = 8;

    // Generar datos para 8 líneas
    const data = Array.from({ length: numLines }, (_, i) => ({
        id: i,
        values: years.map((year, idx) => {
            let value;
            if (i === 3) { // Línea especial con tendencia positiva
                value = idx === 0 ? 40 : idx === 1 ? 45 : 75; // Salto dramático 2019-2022
            } else {
                value = 30 + Math.random() * 40 + (idx * 5);
            }
            return { year, value };
        })
    }));

    // Escalas
    const xScale = d3.scaleLinear()
        .domain([2015, 2022])
        .range([margin.left, width - margin.right]);

    const yScale = d3.scaleLinear()
        .domain([0, 100])
        .range([height - margin.bottom, margin.top]);

    // Generador de línea
    const line = d3.line()
        .x(d => xScale(d.year))
        .y(d => yScale(d.value));

    // Dibujar líneas
    const colors = colorPalette.coloresCategoricos;

    data.forEach((lineData, i) => {
        svg.append('path')
            .datum(lineData.values)
            .attr('fill', 'none')
            .attr('stroke', colors[i % colors.length])
            .attr('stroke-width', i === 3 ? 3 : 2)
            .attr('opacity', i === 3 ? 1 : 0.6)
            .attr('d', line);

        // Segmento rojo para línea especial (2019-2022)
        if (i === 3) {
            const segmentData = lineData.values.slice(1, 3);
            svg.append('path')
                .datum(segmentData)
                .attr('fill', 'none')
                .attr('stroke', '#dc2626')
                .attr('stroke-width', 4)
                .attr('d', line)
                .attr('stroke-dasharray', function () {
                    const length = this.getTotalLength();
                    return `${length} ${length}`;
                })
                .attr('stroke-dashoffset', function () {
                    return this.getTotalLength();
                })
                .transition()
                .duration(2000)
                .attr('stroke-dashoffset', 0);
        }
    });

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
        .attr('fill', colorPalette.texto)
        .text('Pobreza del Aprendizaje (%)');
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

        // Cambiar visualización según el paso
        switch (step) {
            case '1':
                // Dibujar el calendario solo la primera vez
                if (!svg.select('rect.day').node()) {
                    drawCalendarHeatmap(1);
                }
                break;
            case '2':
                drawMultiLineChart();
                break;
            case '3':
                drawTimeSeries();
                break;
            case '4':
                drawSankeyDiagram();
                break;
            case '5':
                drawComparativeBarChart();
                break;
            case '6':
                drawRAPIDPillars();
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
