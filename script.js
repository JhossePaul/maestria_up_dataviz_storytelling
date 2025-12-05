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
    function getYearColor(data) {
        return data.date.getTime() === pandemicStart.getTime() ?
            colorPalette.story.crisisHighlight :
            yearColors[data.year] || colorPalette.categorical[0];
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
        .attr('fill', d => getYearColor(d))
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
                return d3.color(getYearColorForUpdate(d)).brighter(0.3);
            } else {
                // Post-pandemia interpola hacia negro según progress
                return pandemicColor(progress, d);
            }
        })
}


// Helper para obtener color de año en update
function getYearColorForUpdate(data) {
    const yearColors = {
        2019: colorPalette.categorical[0],
        2020: colorPalette.categorical[1],
        2021: colorPalette.categorical[2],
        2022: colorPalette.categorical[3]
    };
    const pandemicStart = new Date('2020-03-23');

    return data.date.getTime() === pandemicStart.getTime() ?
        colorPalette.story.crisisHighlight :
        yearColors[data.year] || colorPalette.categorical[0];
}

function pandemicColor(progress, data) {
    const initColor = getYearColorForUpdate(data);
    const pandemicStart = new Date('2020-03-23');
    const pandemicColorScale = d3.scaleLinear()
        .domain([0, 1])
        .range([initColor, "#1a1a1a"]);

    return data.date.getTime() === pandemicStart.getTime() ?
        colorPalette.story.crisisHighlight :
        pandemicColorScale(progress);
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

    // MÁRGENES: Izquierdo más grande para título Y, Derecho grande para leyenda
    const vizMargin = {
        top: 80,
        right: 80,  // Espacio para leyenda a la derecha
        bottom: 80,
        left: 80, // Espacio para título del eje Y
        titleSpace: 50,
        legendSpace: 300
    };

    if (substep === 1) {
        // SUBSTEP 1: Construir todo desde cero
        svg.selectAll('*').remove();
        currentStep2Substep = substep;

        // Escalas
        const xScale = d3.scaleLinear()
            .domain([2015, 2022])
            .range([vizMargin.left + vizMargin.titleSpace, width - vizMargin.right - vizMargin.legendSpace]);

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
            .attr('y', vizMargin.top / 2)
            .attr('text-anchor', 'middle')
            .attr('alignment-baseline', 'hanging')
            .attr('font-size', '20px')
            .attr('font-weight', '600')
            .attr('fill', colorPalette.story.textMain)
            .text('Pobreza del Aprendizaje en el Mundo');

        // Ejes
        const xAxis = d3.axisBottom(xScale)
            .tickValues([2015, 2019, 2022])
            .tickFormat(d3.format('d'));

        svg.append('g')
            .attr('transform', `translate(0,${height - vizMargin.bottom})`)
            .call(xAxis)
            .style('font-size', '16px');

        svg.append('g')
            .attr('transform', `translate(${vizMargin.left + vizMargin.titleSpace},0)`)
            .call(d3.axisLeft(yScale))
            .style('font-size', '16px');

        // Título del Eje Y 
        svg.append('text')
            .attr('transform', 'rotate(-90)')
            .attr('x', -height / 2)
            .attr('y', vizMargin.top)
            .attr('text-anchor', 'middle')
            .attr('font-size', '18px')
            .attr('font-weight', '600')
            .attr('fill', colorPalette.story.textMain)
            .text('Pobreza del aprendizaje (%)');

        // 6 regiones (sin LATAM)
        const regionColors = [
            colorPalette.story.context,
            colorPalette.categorical[0],
            colorPalette.categorical[1],
            colorPalette.categorical[2],
            colorPalette.categorical[3],
            colorPalette.categorical[4]
        ];

        let colorIndex = 0;
        const legendItems = [];

        regions.forEach(regionData => {
            if (regionData.region === 'América Latina y el Caribe') return;

            const color = regionColors[colorIndex % regionColors.length];
            const strokeWidth = regionData.region === 'Global (Ingreso bajo y medio)' ? 5 : 2.5;

            // Línea con data-attribute para identificación
            svg.append('path')
                .attr('class', 'region-line')
                .attr('data-region', regionData.region)
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

        svg.append('line')
            .attr("y1", yScale(0))
            .attr("y2", yScale(100))
            .attr("x1", xScale(2019))
            .attr("x2", xScale(2019))
            .attr("stroke", colorPalette.story.crisis)
            .attr("stroke-width", 2)
            .attr("stroke-dasharray", "5, 5")
            .attr("opacity", 0.8);

        // LEYENDA A LA DERECHA
        const legendX = width - vizMargin.right - vizMargin.legendSpace + 20;
        const legendY = vizMargin.top + 20;
        const lineHeight = 35;

        legendItems.forEach((item, i) => {
            const y = legendY + (i * lineHeight);

            svg.append('rect')
                .attr('class', 'legend-item')
                .attr('x', legendX)
                .attr('y', y - 8)
                .attr('width', 20)
                .attr('height', 3)
                .attr('fill', item.color);

            svg.append('text')
                .attr('class', 'legend-item')
                .attr('x', legendX + 25)
                .attr('y', y)
                .attr('font-size', '16px')
                .attr('fill', colorPalette.story.textMain)
                .text(item.label);
            // .call(wrap, vizMargin.right - 50);
        });

    } else if (substep === 2) {
        // SUBSTEP 2: Transición sin reconstruir todo
        currentStep2Substep = substep;

        // Obtener las mismas escalas
        const xScale = d3.scaleLinear()
            .domain([2015, 2022])
            .range([vizMargin.left + vizMargin.titleSpace, width - vizMargin.right - vizMargin.legendSpace]);

        const yScale = d3.scaleLinear()
            .domain([0, 100])
            .range([height - vizMargin.bottom, vizMargin.top]);

        const line = d3.line()
            .x(d => xScale(d.year))
            .y(d => yScale(d.value));

        // 1. Remover líneas que NO sean Global
        svg.selectAll('.region-line')
            .filter(function () {
                const region = d3.select(this).attr('data-region');
                return region !== 'Global (Ingreso bajo y medio)';
            })
            .transition()
            .duration(600)
            .attr('opacity', 0)
            .remove();

        // 3. Agregar línea COMPLETA de LATAM (2015-2019-2022) con animación
        setTimeout(() => {
            const latamData = regions.find(r => r.region === 'América Latina y el Caribe');

            const latamPath = svg.append('path')
                .attr('class', 'region-line')
                .attr('data-region', 'América Latina y el Caribe')
                .datum(latamData.values)
                .attr('fill', 'none')
                .attr('stroke', colorPalette.story.crisisHighlight)
                .attr('stroke-width', 4)
                .attr('d', line);

            // Animación de dibujado con stroke-dasharray
            const pathLength = latamPath.node().getTotalLength();

            latamPath
                .attr('stroke-dasharray', `${pathLength} ${pathLength}`)
                .attr('stroke-dashoffset', pathLength)
                .transition()
                .duration(2000)
                .ease(d3.easeQuadInOut)
                .attr('stroke-dashoffset', 0);
        }, 600);

        // 4. Actualizar leyenda
        svg.selectAll('.legend-item')
            .transition()
            .duration(600)
            .attr('opacity', 0)
            .remove();

        setTimeout(() => {
            const legendX = width - vizMargin.right - vizMargin.legendSpace + 20;
            const legendY = vizMargin.top + 20;
            const lineHeight = 50;

            const newLegendItems = [
                { label: 'Global (Ingreso bajo y medio)', color: colorPalette.story.context },
                { label: 'América Latina y el Caribe', color: colorPalette.story.crisisHighlight }
            ];

            newLegendItems.forEach((item, i) => {
                const y = legendY + (i * lineHeight);

                svg.append('rect')
                    .attr('class', 'legend-item')
                    .attr('x', legendX)
                    .attr('y', y - 8)
                    .attr('width', 20)
                    .attr('height', 3)
                    .attr('fill', item.color)
                    .attr('opacity', 0)
                    .transition()
                    .duration(500)
                    .attr('opacity', 1);

                svg.append('text')
                    .attr('class', 'legend-item')
                    .attr('x', legendX + 25)
                    .attr('y', y)
                    .attr('font-size', '14px')
                    .attr('font-weight', i === 1 ? '600' : 'normal')
                    .attr('fill', colorPalette.story.textMain)
                    .text(item.label)
                    .attr('opacity', 0)
                    .transition()
                    .duration(500)
                    .attr('opacity', 1);
            });
        }, 600);
    } else if (substep === 3) {
        svg.selectAll("*").remove();

        const children = d3.range(5).map(d => ({
            x: width / 5 * d,
            y: height / 2,
            class: d === 0 ? 'child-green' : 'child-red'
        }));


        svg.selectAll('image')
            .data(children)
            .enter()
            .append('image')
            .attr('class', d => d.class)
            .attr('xlink:href', 'images/child.png')
            .attr('width', width / 5)
            .attr('height', height / 5)
            .attr('x', d => d.x)
            .attr('y', d => d.y);
    }
}

// Helper para wrap de texto largo en leyenda
function wrap(text, width) {
    text.each(function () {
        const text = d3.select(this);
        const words = text.text().split(/\s+/).reverse();
        let word;
        let line = [];
        let lineNumber = 0;
        const lineHeight = 1.2;
        const y = text.attr('y');
        const x = text.attr('x');
        let tspan = text.text(null).append('tspan').attr('x', x).attr('y', y);

        while (word = words.pop()) {
            line.push(word);
            tspan.text(line.join(' '));
            if (tspan.node().getComputedTextLength() > width) {
                line.pop();
                tspan.text(line.join(' '));
                line = [word];
                tspan = text.append('tspan').attr('x', x).attr('y', y).attr('dy', ++lineNumber * lineHeight + 'em').text(word);
            }
        }
    });
}

// ========================================
// STEP 3: PISA TIME SERIES (2003-2022)
// ========================================

let pisaData = null;
let currentStep3Substep = 1;

// Cargar datos de PISA
async function loadPISAData() {
    if (!pisaData) {
        const response = await fetch('data/pisa.json');
        const jsonData = await response.json();
        pisaData = jsonData.pisa_data;
    }
    return pisaData;
}

async function drawTimeSeries(substep = 1) {
    const data = await loadPISAData();

    // Márgenes iguales a Step 2
    const vizMargin = {
        top: 80,
        right: 80,
        bottom: 80,
        left: 80,
        titleSpace: 50,
        legendSpace: 300
    };

    // Escalas
    const xScale = d3.scaleLinear()
        .domain([2003, 2022])
        .range([vizMargin.left + vizMargin.titleSpace, width - vizMargin.right - vizMargin.legendSpace]);

    const yScale = d3.scaleLinear()
        .domain([350, 520])
        .range([height - vizMargin.bottom, vizMargin.top]);

    // Animar líneas por subject
    const subjects = ['matematicas', 'lectura', 'ciencias'];

    if (substep === 1) {
        // SUBSTEP 1: Construir todo y animar tendencias globales
        svg.selectAll('*').remove();
        currentStep3Substep = substep;

        // Título
        svg.append('text')
            .attr('x', width / 2)
            .attr('y', vizMargin.top / 2)
            .attr('text-anchor', 'middle')
            .attr('alignment-baseline', 'hanging')
            .attr('font-size', '20px')
            .attr('font-weight', '600')
            .attr('fill', colorPalette.story.textMain)
            .text('Evolución del Desempeño en Matemáticas de México');

        // Ejes
        const xAxis = d3.axisBottom(xScale)
            .tickValues([2003, 2006, 2009, 2012, 2015, 2018, 2022])
            .tickFormat(d3.format('d'));

        svg.append('g')
            .attr('transform', `translate(0,${height - vizMargin.bottom})`)
            .call(xAxis)
            .style('font-size', '16px');

        svg.append('g')
            .attr('transform', `translate(${vizMargin.left + vizMargin.titleSpace},0)`)
            .call(d3.axisLeft(yScale))
            .style('font-size', '16px');

        // Título del Eje Y
        svg.append('text')
            .attr('transform', 'rotate(-90)')
            .attr('x', -height / 2)
            .attr('y', vizMargin.left)
            .attr('text-anchor', 'middle')
            .attr('font-size', '18px')
            .attr('font-weight', '600')
            .attr('fill', colorPalette.story.textMain)
            .text('Puntaje PISA');

        subjects.forEach((subject, subjectIndex) => {
            const subjectData = data.mexico_evolucion;

            // Dibujar todos los segmentos excepto el último (con colores apagados)
            for (let i = 0; i < subjectData.length - 2; i++) {
                const segment = [subjectData[i], subjectData[i + 1]];

                const line = d3.line()
                    .x(d => xScale(d.anio))
                    .y(d => yScale(d[subject]));

                const path = svg.append('path')
                    .datum(segment)
                    .attr('fill', 'none')
                    .attr('stroke', colorPalette.categorical[subjectIndex])
                    .attr('stroke-width', 2.5)
                    .attr('opacity', 0.3)
                    .attr('d', line);

                // Animación stroke-dasharray
                const pathLength = path.node().getTotalLength();
                path
                    .attr('stroke-dasharray', `${pathLength} ${pathLength}`)
                    .attr('stroke-dashoffset', pathLength)
                    .transition()
                    .delay(subjectIndex * 400 + i * 200)
                    .duration(500)
                    .ease(d3.easeLinear)
                    .attr('stroke-dashoffset', 0);
            }
        });

    } else if (substep === 2) {
        // Ultimo segmento de matematicas de México
        subjects.forEach((subject, subjectIndex) => {
            const subjectData = data.mexico_evolucion;

            const lastSegment = subjectData.slice(-2);

            const lastLine = d3.line()
                .x(d => xScale(d.anio))
                .y(d => yScale(d[subject]));

            const lastPath = svg.append('path')
                .datum(lastSegment)
                .attr('fill', 'none')
                .attr('stroke', colorPalette.story.crisisHighlight)
                .attr('stroke-width', 3)
                .attr('opacity', 1)
                .attr('d', lastLine);

            const lastPathLength = lastPath.node().getTotalLength();
            lastPath
                .attr('stroke-dasharray', `${lastPathLength} ${lastPathLength}`)
                .attr('stroke-dashoffset', lastPathLength)
                .transition()
                .delay(subjectIndex * 400 + (subjectData.length - 2) * 200)
                .duration(500)
                .ease(d3.easeLinear)
                .attr('stroke-dashoffset', 0);
        });
    } else if (substep === 3) {
        // SUBSTEP 3: Donut chart - 43% hogares con computadora
        currentStep3Substep = substep;

        // Remover gráficos anteriores
        svg.selectAll('*').remove();

        // Datos del donut
        const donutData = [
            { label: 'Con computadora', value: 43, color: colorPalette.story.hope },
            { label: 'Sin computadora', value: 57, color: colorPalette.story.context }
        ];

        // Dimensiones del donut
        const donutWidth = Math.min(width - vizMargin.left - vizMargin.right - vizMargin.titleSpace - vizMargin.legendSpace, 500);
        const donutHeight = Math.min(height - vizMargin.top - vizMargin.bottom, 500);
        const radius = Math.min(donutWidth, donutHeight) / 2;
        const innerRadius = radius * 0.6; // Ancho del donut

        // Centrar el donut
        const centerX = vizMargin.left + vizMargin.titleSpace + (width - vizMargin.left - vizMargin.right - vizMargin.titleSpace - vizMargin.legendSpace) / 2;
        const centerY = vizMargin.top + (height - vizMargin.top - vizMargin.bottom) / 2;

        // Título
        svg.append('text')
            .attr('x', width / 2)
            .attr('y', vizMargin.top / 2)
            .attr('text-anchor', 'middle')
            .attr('alignment-baseline', 'hanging')
            .attr('font-size', '20px')
            .attr('font-weight', '600')
            .attr('fill', colorPalette.story.textMain)
            .text('Acceso a Computadora en Hogares Mexicanos');

        // Generador de arcos
        const arc = d3.arc()
            .innerRadius(innerRadius)
            .outerRadius(radius);

        const pie = d3.pie()
            .value(d => d.value)
            .sort(null);

        // Grupo para el donut
        const donutGroup = svg.append('g')
            .attr('transform', `translate(${centerX},${centerY})`);

        // Dibujar arcos
        const arcs = donutGroup.selectAll('.arc')
            .data(pie(donutData))
            .enter()
            .append('g')
            .attr('class', 'arc');

        arcs.append('path')
            .attr('d', arc)
            .attr('fill', d => d.data.color)
            .attr('opacity', 0)
            .transition()
            .duration(1000)
            .attr('opacity', 0.9)
            .attr('stroke', '#ffffff')
            .attr('stroke-width', 3);

        // Texto central - Porcentaje
        svg.append('text')
            .attr('x', centerX)
            .attr('y', centerY - 20)
            .attr('text-anchor', 'middle')
            .attr('font-size', '64px')
            .attr('font-weight', '700')
            .attr('fill', colorPalette.story.hope)
            .attr('opacity', 0)
            .text('43%')
            .transition()
            .delay(500)
            .duration(800)
            .attr('opacity', 1);

        // Texto central - Descripción
        svg.append('text')
            .attr('x', centerX)
            .attr('y', centerY + 25)
            .attr('text-anchor', 'middle')
            .attr('font-size', '18px')
            .attr('font-weight', '400')
            .attr('fill', colorPalette.story.textMain)
            .attr('opacity', 0)
            .text('de hogares con')
            .transition()
            .delay(800)
            .duration(600)
            .attr('opacity', 0.8);

        svg.append('text')
            .attr('x', centerX)
            .attr('y', centerY + 50)
            .attr('text-anchor', 'middle')
            .attr('font-size', '18px')
            .attr('font-weight', '600')
            .attr('fill', colorPalette.story.textMain)
            .attr('opacity', 0)
            .text('computadora')
            .transition()
            .delay(1000)
            .duration(600)
            .attr('opacity', 1);

        // Leyenda
        const legendX = width - vizMargin.right - vizMargin.legendSpace + 20;
        const legendY = vizMargin.top + 20;

        donutData.forEach((item, i) => {
            const y = legendY + (i * 60);

            svg.append('rect')
                .attr('x', legendX)
                .attr('y', y - 8)
                .attr('width', 20)
                .attr('height', 20)
                .attr('fill', item.color)
                .attr('rx', 2)
                .attr('opacity', 0)
                .transition()
                .delay(1200 + i * 200)
                .duration(400)
                .attr('opacity', 0.9);

            svg.append('text')
                .attr('x', legendX + 30)
                .attr('y', y)
                .attr('font-size', '16px')
                .attr('fill', colorPalette.story.textMain)
                .attr('opacity', 0)
                .text(item.label)
                .transition()
                .delay(1200 + i * 200)
                .duration(400)
                .attr('opacity', 1);

            svg.append('text')
                .attr('x', legendX + 30)
                .attr('y', y + 20)
                .attr('font-size', '24px')
                .attr('font-weight', '700')
                .attr('fill', item.color)
                .attr('opacity', 0)
                .text(`${item.value}%`)
                .transition()
                .delay(1200 + i * 200)
                .duration(400)
                .attr('opacity', 1);
        });
    }
}

// ========================================
// STEP 4: SANKEY DIAGRAM (Simplified)
// ========================================
// ========================================
// STEP 4: SANKEY DIAGRAM - Trabajo Infantil
// ========================================

let sankeyData = null;
let currentStep4Substep = 1;

// Cargar datos de abandono escolar
async function loadSankeyData() {
    if (!sankeyData) {
        const response = await fetch('data/abandono_escolar.json');
        sankeyData = await response.json();
    }
    return sankeyData;
}

async function drawSankeyDiagram(substep = 1) {
    const data = await loadSankeyData();
    currentStep4Substep = substep;

    // Márgenes
    const vizMargin = {
        top: 200,
        right: 150,
        bottom: 80,
        left: 80,
        titleSpace: 50,
        legendSpace: 0
    };

    if (substep === 1) {
        svg.selectAll('*').remove();

        // Título
        svg.append('text')
            .attr('x', width / 2)
            .attr('y', vizMargin.top / 2)
            .attr('text-anchor', 'middle')
            .attr('alignment-baseline', 'hanging')
            .attr('font-size', '20px')
            .attr('font-weight', '600')
            .attr('fill', colorPalette.story.textMain)
            .text('Ocupación infantil en México');

        // Calcular depth de cada nodo
        const nodeDepths = {};
        const visited = new Set();

        function calculateDepth(nodeId, depth = 0) {
            if (visited.has(nodeId)) return;
            visited.add(nodeId);
            nodeDepths[nodeId] = depth;

            data.links.forEach(link => {
                if (link.source === nodeId) {
                    calculateDepth(link.target, depth + 1);
                }
            });
        }

        calculateDepth(0);

        // Calcular valor de cada nodo (suma de links salientes o entrantes)
        const nodeValues = {};
        data.nodes.forEach(node => {
            nodeValues[node.id] = 0;
        });

        // Para cada nodo, sumar los valores de links que SALEN
        data.links.forEach(link => {
            if (!nodeValues[link.source]) nodeValues[link.source] = 0;
            nodeValues[link.source] = Math.max(nodeValues[link.source], link.value);
        });

        // Para los nodos sin salidas, usar la suma de entradas
        data.nodes.forEach(node => {
            const outgoingSum = data.links
                .filter(l => l.source === node.id)
                .reduce((sum, l) => sum + l.value, 0);

            const incomingSum = data.links
                .filter(l => l.target === node.id)
                .reduce((sum, l) => sum + l.value, 0);

            nodeValues[node.id] = Math.max(outgoingSum, incomingSum);
        });

        // Escala de colores divergente
        const maxDepth = Math.max(...Object.values(nodeDepths));
        const depthColorScale = d3.scaleLinear()
            .domain([0, maxDepth])
            .range([colorPalette.story.hope, colorPalette.story.crisis]);

        // Organizar nodos por profundidad
        const nodesByDepth = {};
        data.nodes.forEach(node => {
            const depth = nodeDepths[node.id];
            if (!nodesByDepth[depth]) nodesByDepth[depth] = [];
            nodesByDepth[depth].push(node);
        });

        // Dimensiones del Sankey
        const sankeyWidth = width - vizMargin.left - vizMargin.right - vizMargin.titleSpace;
        const sankeyHeight = height - vizMargin.top - vizMargin.bottom;
        const nodeWidth = 25;
        const nodePadding = 60;

        // Escala para altura de nodos
        const maxValue = Math.max(...Object.values(nodeValues));
        const heightScale = d3.scaleLinear()
            .domain([0, maxValue])
            .range([0, sankeyHeight * 0.8]);

        // Calcular posiciones de nodos
        const depths = Object.keys(nodesByDepth).map(Number).sort((a, b) => a - b);
        const depthSpacing = sankeyWidth / (depths.length + 1);

        data.nodes.forEach(node => {
            const depth = nodeDepths[node.id];
            const nodesAtDepth = nodesByDepth[depth];
            const index = nodesAtDepth.indexOf(node);

            node.x = vizMargin.left + vizMargin.titleSpace + (depth + 1) * depthSpacing - nodeWidth / 2;
            node.value = nodeValues[node.id];
            node.height = heightScale(node.value);
            node.depth = depth;

            // Distribuir verticalmente
            const totalHeight = nodesAtDepth.reduce((sum, n) => sum + heightScale(nodeValues[n.id]), 0);
            const totalPadding = nodePadding * (nodesAtDepth.length - 1);
            const startY = vizMargin.top + (sankeyHeight - totalHeight - totalPadding) / 2;

            let yOffset = startY;
            for (let i = 0; i < index; i++) {
                yOffset += heightScale(nodeValues[nodesAtDepth[i].id]) + nodePadding;
            }

            node.y = yOffset;
        });

        // Calcular posiciones Y de los links dentro de cada nodo
        const linkPositions = new Map();

        data.nodes.forEach(node => {
            const outgoingLinks = data.links.filter(l => l.source === node.id);
            const incomingLinks = data.links.filter(l => l.target === node.id);

            let outgoingY = node.y;
            outgoingLinks.forEach(link => {
                const linkHeight = heightScale(link.value);
                linkPositions.set(`${link.source}-${link.target}-source`, {
                    y: outgoingY + linkHeight / 2,
                    height: linkHeight
                });
                outgoingY += linkHeight;
            });

            let incomingY = node.y;
            incomingLinks.forEach(link => {
                const linkHeight = heightScale(link.value);
                linkPositions.set(`${link.source}-${link.target}-target`, {
                    y: incomingY + linkHeight / 2,
                    height: linkHeight
                });
                incomingY += linkHeight;
            });
        });

        // Crear generador de links con gradiente
        function createLinkPath(link) {
            const sourceNode = data.nodes.find(n => n.id === link.source);
            const targetNode = data.nodes.find(n => n.id === link.target);

            const sourcePos = linkPositions.get(`${link.source}-${link.target}-source`);
            const targetPos = linkPositions.get(`${link.source}-${link.target}-target`);

            const x0 = sourceNode.x + nodeWidth;
            const x1 = targetNode.x;
            const y0 = sourcePos.y;
            const y1 = targetPos.y;

            const curvature = 0.5;
            const xi = d3.interpolateNumber(x0, x1);
            const x2 = xi(curvature);
            const x3 = xi(1 - curvature);

            return `M${x0},${y0} C${x2},${y0} ${x3},${y1} ${x1},${y1}`;
        }

        // Dibujar links primero
        const linkGroup = svg.append('g').attr('class', 'links');

        data.links.forEach((link, i) => {
            const linkHeight = heightScale(link.value);
            const linkColor = link.color || depthColorScale(nodeDepths[link.source]);

            linkGroup.append('path')
                .attr('d', createLinkPath(link))
                .attr('stroke', linkColor)
                .attr('stroke-width', linkHeight)
                .attr('fill', 'none')
                .attr('opacity', 0)
                .transition()
                .delay(1000 + i * 200)
                .duration(600)
                .attr('opacity', 1);
        });

        // Dibujar nodos
        const nodeGroup = svg.append('g').attr('class', 'nodes');

        depths.forEach((depth, depthIndex) => {
            nodesByDepth[depth].forEach((node, nodeIndex) => {
                const nodeColor = node.color || depthColorScale(depth);
                const nodeData = data.nodes.find(n => n.id === node.id);

                // Grupo para nodo (para tooltip)
                const nodeG = nodeGroup.append('g')
                    .attr('class', 'node-group');

                // Rectángulo del nodo
                nodeG.append('rect')
                    .attr('x', node.x)
                    .attr('y', node.y)
                    .attr('width', 0)
                    .attr('height', node.height)
                    .attr('fill', nodeColor)
                    .attr('rx', 3)
                    .attr('opacity', 0.9)
                    .transition()
                    .delay(depthIndex * 500 + nodeIndex * 150)
                    .duration(500)
                    .attr('width', nodeWidth);

                // Etiqueta del nodo
                const labelX = node.x + nodeWidth + 8;
                const labelY = node.y + node.height / 2;

                nodeG.append('text')
                    .attr('x', labelX)
                    .attr('y', labelY)
                    .attr('dy', '-0.3em')
                    .attr('font-size', '13px')
                    .attr('font-weight', '600')
                    .attr('fill', colorPalette.story.textMain)
                    .attr('opacity', 0)
                    .text(node.label)
                    .transition()
                    .delay(depthIndex * 500 + nodeIndex * 150 + 250)
                    .duration(300)
                    .attr('opacity', 1);

                // Valor del nodo - formato especial para nodo 10 (Conflictos con la ley)
                let valueText;
                if (node.id === 10) {
                    // Mostrar en miles
                    valueText = `${(node.value * 1000).toFixed(0)}K`;
                } else {
                    // Mostrar en millones
                    valueText = `${node.value.toFixed(1)}M`;
                }

                nodeG.append('text')
                    .attr('x', labelX)
                    .attr('y', labelY + 16)
                    .attr('dy', '0em')
                    .attr('font-size', '15px')
                    .attr('font-weight', '700')
                    .attr('fill', nodeColor)
                    .attr('opacity', 0)
                    .text(valueText)
                    .transition()
                    .delay(depthIndex * 500 + nodeIndex * 150 + 400)
                    .duration(300)
                    .attr('opacity', 1);

                // Tooltip (área invisible para hover)
                if (nodeData.tooltip) {
                    nodeG.append('title')
                        .text(nodeData.tooltip);
                }
            });
        });
    }
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
                    drawLearningPoverty(substep);
                }
                break;
            case '3':
                // Step 3 tiene substeps
                const substep3 = parseInt(response.element.dataset.substep) || 1;
                if (!svg.select('path').node() || substep3 !== currentStep3Substep) {
                    drawTimeSeries(substep3);
                }
                break;
            case '4':
                // Step 4 tiene substeps
                const substep4 = parseInt(response.element.dataset.substep) || 1;
                if (!svg.select('.nodes').node() || substep4 !== currentStep4Substep) {
                    drawSankeyDiagram(substep4);
                }
                break;
            case '5':
                transitionToVisualization(drawComparativeBarChart);
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
            const totalSubsteps = 2;

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
