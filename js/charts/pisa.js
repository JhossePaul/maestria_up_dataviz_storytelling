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

export async function drawTimeSeries(containerId) {
    const data = await loadPISAData();

    // BOX MODEL
    const layout = new ChartLayout(containerId, {
        padding: { top: 80, right: 150, bottom: 80, left: 80 }
    });

    const { svg, g, width, height } = layout.createSVG(true);

    // Scales
    const xScale = d3.scaleLinear().domain([2003, 2022]).range([0, width]);
    const yScale = d3.scaleLinear().domain([350, 520]).range([height, 0]);

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

    // Legend Data
    const legendItems = subjects.map((s, i) => ({ label: s.charAt(0).toUpperCase() + s.slice(1), color: colorPalette.categorical[i] }));
    const legendX = width + 20;

    // Draw Legend
    legendItems.forEach((item, i) => {
        const y = 20 + i * 40;
        g.append('rect').attr('x', legendX).attr('y', y - 8).attr('width', 20).attr('height', 3).attr('fill', item.color);
        g.append('text').attr('x', legendX + 25).attr('y', y).attr('fill', colorPalette.story.textMain).text(item.label);
    });

    // === VISUALIZATION LOGIC ===

    subjects.forEach((subject, subjectIndex) => {
        const subjectData = data.mexico_evolucion[subject];
        const fullPathD = lineGenerator(subjectData);

        // Define Unique IDs for ClipPaths
        const clipId1 = `clip-pisa-${subject}-1`;
        const clipId2 = `clip-pisa-${subject}-2`;

        // 1. PHASE 1: PRE-2022 TREND (2003-2018)
        // We use the FULL path geometry but clip it to view only up to 2018.
        // This ensures the curve at 2018 is calculated with 2022 context (Spline continuity).

        // Create ClipPath for Phase 1
        const x2018 = xScale(2018);
        const totalW = xScale(2022); // Max width needed

        const clipRect1 = g.append('defs').append('clipPath')
            .attr('id', clipId1)
            .append('rect')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', 0) // Start hidden
            .attr('height', height);

        const path1 = g.append('path')
            .attr('clip-path', `url(#${clipId1})`)
            .attr('fill', 'none')
            .attr('stroke', colorPalette.categorical[subjectIndex])
            .attr('stroke-width', 2.5)
            .attr('opacity', 0.8)
            .attr('d', fullPathD); // Full Spline Geometry

        // Animate Phase 1 Reveal (Width 0 -> x2018)
        clipRect1.transition().duration(2000).ease(d3.easeLinear)
            .attr('width', x2018);

        // 2. PHASE 2: THE DROP (2018-2022)
        // Wait 5 seconds, then draw the drop segment in RED.
        // We clone the full path again, but clip distinctively to show only 2018+.

        const delayMs = 5000;

        setTimeout(() => {
            if (g.select('path').empty()) return;

            const clipRect2 = g.append('defs').append('clipPath')
                .attr('id', clipId2)
                .append('rect')
                .attr('x', x2018) // Start at 2018
                .attr('y', 0)
                .attr('width', 0) // Start hidden (reveal from left to right)
                .attr('height', height);

            const path2 = g.append('path')
                .attr('clip-path', `url(#${clipId2})`)
                .attr('fill', 'none')
                .attr('stroke', colorPalette.story.crisisHighlight) // Red for drop
                .attr('stroke-width', 4)
                .attr('d', fullPathD); // Same Geometry for perfect overlap/continuity

            // Animate Phase 2 Reveal (Width 0 -> x2022 - x2018)
            clipRect2.transition().duration(1000).ease(d3.easeLinear)
                .attr('width', totalW - x2018);

        }, delayMs);
    });
}
