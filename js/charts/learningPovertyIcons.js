import { ChartLayout } from '../utils/layout.js';

export function drawLearningPovertyIcons(containerId) {
    // Layout creates clean SVG
    // Using Box Model with equal padding (or adjust as needed)
    const layout = new ChartLayout(containerId, {
        padding: { top: 80, right: 80, bottom: 80, left: 80 }
    });

    // Always clear and create fresh SVG for this step
    const { width, height, g } = layout.createSVG(true);

    const children = d3.range(5).map(d => ({
        x: width / 5 * d,
        y: height / 2,
        class: d === 0 ? 'child-green' : 'child-red'  // 1 green (ok), 4 red (poverty)
    }));

    g.selectAll('image')
        .data(children)
        .enter()
        .append('image')
        .attr('class', d => d.class)
        .attr('xlink:href', 'images/child.png')
        .attr('width', width / 5)
        .attr('height', width / 5) // Keep square aspect
        .attr('x', d => d.x)
        .attr('y', d => d.y - (width / 10)); // Center shift based on half size
}
