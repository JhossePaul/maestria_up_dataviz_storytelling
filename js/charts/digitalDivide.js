import { colorPalette } from '../theme.js';
import { ChartLayout } from '../utils/layout.js';

export function drawDigitalDivide(containerId) {
    // Layout
    const layout = new ChartLayout(containerId, {
        padding: { top: 80, right: 20, bottom: 100, left: 20 } // Increased bottom for legend, reduced sides
    });

    // Always clear/create fresh
    const { svg, g, width, height } = layout.createSVG(true);

    // Data
    const donutData = [
        { label: 'Con computadora', value: 43, color: colorPalette.story.hope },
        { label: 'Sin computadora', value: 57, color: colorPalette.story.context }
    ];

    // Dimensions
    const radius = Math.min(width, height) / 2;
    const innerRadius = radius * 0.6;

    // Center Group
    const centerX = width / 2;
    const centerY = height / 2;

    // Title
    svg.append('text')
        .attr('x', (layout.totalWidth - layout.margin.left - layout.margin.right) / 2) // Re-center based on margins
        .attr('y', 40)
        .attr('text-anchor', 'middle')
        .attr('font-size', '20px')
        .attr('font-weight', '600')
        .attr('fill', colorPalette.story.textMain)
        .text('Acceso a Computadora en Hogares Mexicanos');

    const arc = d3.arc().innerRadius(innerRadius).outerRadius(radius);
    const pie = d3.pie().value(d => d.value).sort(null);

    const donutGroup = g.append('g').attr('transform', `translate(${centerX},${centerY})`);

    const arcs = donutGroup.selectAll('.arc')
        .data(pie(donutData)).enter().append('g').attr('class', 'arc');

    // Draw Slices
    const path = arcs.append('path')
        .attr('d', arc).attr('fill', d => d.data.color).attr('opacity', 0);

    path.transition().duration(1000).attr('opacity', 0.9).attr('stroke', '#ffffff').attr('stroke-width', 3);

    // SLICE TEXT LABEL (Percentage in White)
    arcs.append('text')
        .attr('transform', d => `translate(${arc.centroid(d)})`)
        .attr('text-anchor', 'middle')
        .attr('font-size', '24px') // Prominent
        .attr('font-weight', '700')
        .attr('fill', '#ffffff') // White
        .attr('dy', '0.35em') // Vertical center
        .text(d => `${d.data.value}%`)
        .attr('opacity', 0)
        .transition().delay(800).duration(500).attr('opacity', 1);

    // LEGEND AT THE BOTTOM
    // Calculate total width of legend to center it
    const itemSpacing = 200; // Spacing between items
    const legendWidth = (donutData.length * itemSpacing) - (itemSpacing - 20); // Approx width
    const legendStartX = (width - legendWidth) / 2 - 50; // Centered relative to chart width
    // Position below chart. Since margin.bottom is 80 (from padding), we can draw at height + 40
    const legendY = height + 40;

    donutData.forEach((item, i) => {
        const x = legendStartX + (i * itemSpacing);

        // Rect
        g.append('rect')
            .attr('x', x).attr('y', legendY - 15).attr('width', 20).attr('height', 20)
            .attr('fill', item.color).attr('rx', 2).attr('opacity', 0)
            .transition().delay(1200 + i * 200).duration(400).attr('opacity', 0.9);

        // Label
        g.append('text')
            .attr('x', x + 30).attr('y', legendY).attr('font-size', '16px').attr('fill', colorPalette.story.textMain)
            .text(item.label).attr('opacity', 0).transition().delay(1200 + i * 200).duration(400).attr('opacity', 1);
    });
}
