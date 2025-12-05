import { colorPalette } from '../theme.js';
import { ChartLayout } from '../utils/layout.js';

let pisaData = null;

async function loadPISAData() {
    if (!pisaData) {
        const response = await fetch('data/pisa.json');
        const jsonData = await response.json();
        pisaData = jsonData.pisa_data;
    }
    return pisaData;
}

let chartState = {
    animated: false,
    g: null,
    scales: null,
    lineGen: null,
    data: null
};

export async function drawTimeSeries(containerId) {
    chartState.animated = false;
    const data = await loadPISAData();
    chartState.data = data;

    // BOX MODEL
    const layout = new ChartLayout(containerId, {
        padding: { top: 80, right: 150, bottom: 80, left: 80 }
    });

    const { svg, g, width, height } = layout.createSVG(true);
    chartState.g = g;

    // Scales
    const xScale = d3.scaleLinear().domain([2003, 2022]).range([0, width]);
    const yScale = d3.scaleLinear().domain([350, 520]).range([height, 0]);
    chartState.scales = { x: xScale, y: yScale };

    // Title
    svg.append('text')
        .attr('x', (layout.totalWidth - layout.margin.left - layout.margin.right) / 2)
        .attr('y', 40)
        .attr('text-anchor', 'middle').attr('font-size', '20px').attr('font-weight', '600')
        .attr('fill', colorPalette.story.textMain)
        .text('Evolución del Desempeño en Matemáticas de México');

    // Axes
    g.append('g').attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(xScale).tickValues([2003, 2006, 2009, 2012, 2015, 2018, 2022]).tickFormat(d3.format('d')))
        .style('font-size', '16px');

    g.append('g').call(d3.axisLeft(yScale)).style('font-size', '16px');

    svg.append('text').attr('transform', 'rotate(-90)')
        .attr('x', -layout.totalHeight / 2).attr('y', 30)
        .attr('text-anchor', 'middle').attr('font-size', '18px').attr('font-weight', '600')
        .attr('fill', colorPalette.story.textMain).text('Puntaje PISA');

    const subjects = ['matematicas', 'lectura', 'ciencias'];

    // Curve Spline (Monotone X)
    const lineGenerator = d3.line()
        .curve(d3.curveMonotoneX)
        .x(d => xScale(d.anio))
        .y(d => yScale(d.value));
    chartState.lineGen = lineGenerator;

    // Legend Data
    const legendItems = subjects.map((s, i) => ({ label: s.charAt(0).toUpperCase() + s.slice(1), color: colorPalette.categorical[i] }));
    const legendX = width + 20;

    // Draw Legend
    legendItems.forEach((item, i) => {
        const y = 20 + i * 40;
        g.append('rect').attr('x', legendX).attr('y', y - 8).attr('width', 20).attr('height', 3).attr('fill', item.color);
        g.append('text').attr('x', legendX + 25).attr('y', y).attr('fill', colorPalette.story.textMain).text(item.label);
    });

    // === VISUALIZATION LOGIC (Phase 1: Pre-2022) ===

    subjects.forEach((subject, subjectIndex) => {
        const subjectData = data.mexico_evolucion[subject];
        const fullPathD = lineGenerator(subjectData);

        // Define Unique IDs for ClipPaths
        const clipId1 = `clip-pisa-${subject}-1`;

        // Create ClipPath for Phase 1 (Only show up to 2018 initially, or animate complete reveal?)
        // The original requirement was "Spline continuity".
        // To show "Evolution up to 2018", we clip at 2018.

        const x2018 = xScale(2018);

        const clipRect1 = g.append('defs').append('clipPath')
            .attr('id', clipId1)
            .append('rect')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', 0) // Start hidden
            .attr('height', height);

        g.append('path')
            .attr('clip-path', `url(#${clipId1})`)
            .attr('fill', 'none')
            .attr('stroke', colorPalette.categorical[subjectIndex])
            .attr('stroke-width', 2.5)
            .attr('opacity', 0.8)
            .attr('d', fullPathD); // Full Spline Geometry

        // Animate Phase 1 Reveal (Width 0 -> x2018)
        clipRect1.transition().duration(2000).ease(d3.easeLinear)
            .attr('width', x2018);

        // Store subject data/colors for Phase 2 if needed, but easier to just loop subjects again in animate
    });
}

export function animatePisaDrop(containerId) {
    if (chartState.animated) return;
    chartState.animated = true;

    const { g, scales, lineGen, data } = chartState;
    if (!g || !g.node()) return;

    const subjects = ['matematicas', 'lectura', 'ciencias'];
    const xScale = scales.x;
    const height = scales.y.range()[0]; // range [height, 0], so index 0 is height
    const x2018 = xScale(2018);
    const totalW = xScale(2022);

    subjects.forEach((subject, subjectIndex) => {
        const subjectData = data.mexico_evolucion[subject];
        const fullPathD = lineGen(subjectData);
        const clipId2 = `clip-pisa-${subject}-2`;

        // PHASE 2: THE DROP (2018-2022) - RED LINE
        const clipRect2 = g.append('defs').append('clipPath')
            .attr('id', clipId2)
            .append('rect')
            .attr('x', x2018) // Start at 2018
            .attr('y', 0)
            .attr('width', 0) // Start hidden
            .attr('height', height);

        g.append('path')
            .attr('clip-path', `url(#${clipId2})`)
            .attr('fill', 'none')
            .attr('stroke', colorPalette.story.crisisHighlight) // Red for drop
            .attr('stroke-width', 4)
            .attr('d', fullPathD);

        // Animate Phase 2 Reveal
        clipRect2.transition().duration(1000).ease(d3.easeLinear)
            .attr('width', totalW - x2018);
    });
}
