
import { colorPalette } from '../theme.js';
import { ChartLayout } from '../utils/layout.js';

export function drawEconomicLossGDP(containerId) {
    // Clear and Setup Layout
    const layout = new ChartLayout(containerId, {
        padding: { top: 80, right: 100, bottom: 80, left: 100 }
    });
    const { svg, g, width, height } = layout.createSVG(true);

    // === GDP BARS ===
    const data = [
        { label: 'Pérdida Económica', value: 3426, color: colorPalette.story.crisis },
        { label: 'PIB 2019', value: 2519, color: colorPalette.story.hope }
    ];

    const x = d3.scaleBand().domain(data.map(d => d.label)).range([0, width]).padding(0.4);
    const y = d3.scaleLinear().domain([0, 4000]).range([height, 0]);

    svg.append('text').attr('x', layout.totalWidth / 2).attr('y', 40).attr('text-anchor', 'middle')
        .text('Pérdida Económica vs PIB').attr('font-weight', 'bold')
        .attr('font-size', '20px') // Standardized
        .attr('fill', colorPalette.story.textMain);

    g.selectAll('rect').data(data).enter().append('rect')
        .attr('x', d => x(d.label)).attr('width', x.bandwidth())
        .attr('y', height).attr('height', 0).attr('fill', d => d.color)
        .transition().duration(800).attr('y', d => y(d.value)).attr('height', d => height - y(d.value));

    g.append('g').attr('transform', `translate(0,${height})`).call(d3.axisBottom(x)).style('font-size', '14px');
    g.append('g').call(d3.axisLeft(y)).style('font-size', '14px');
}
