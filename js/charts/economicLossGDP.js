import { colorPalette } from '../theme.js';
import { ChartLayout } from '../utils/layout.js';

export function drawEconomicLossGDP(containerId) {
    // 1. LAYOUT
    // Adopt margins from user's manual "vizMargin" into strict ChartLayout padding
    // vizMargin: { top: 100, right: 100, bottom: 100, left: 150 }
    const layout = new ChartLayout(containerId, {
        padding: { top: 100, right: 60, bottom: 100, left: 60 }
    });

    const { svg, g, width, height } = layout.createSVG(true);

    // Título (Draw on SVG)
    svg.append('text')
        .attr('x', (layout.totalWidth - layout.margin.left - layout.margin.right) / 2)
        .attr('y', 50)
        .attr('text-anchor', 'middle')
        .attr('font-size', '20px')
        .attr('font-weight', '600')
        .attr('fill', colorPalette.story.textMain)
        .text('Pérdida Económica vs PIB de México');

    // Datos en miles de millones USD
    const data = [
        {
            label: 'Pérdida Económica',
            value: 3426,
            color: colorPalette.story.crisis,
            description: '$3,426'
        },
        {
            label: 'PIB 2019',
            value: 2519,
            color: colorPalette.story.hope,
            description: '$2,519'
        }
    ];

    // Escalas
    const xScale = d3.scaleBand()
        .domain(data.map(d => d.label))
        .range([0, width])
        .padding(0.3);

    const maxValue = Math.max(...data.map(d => d.value));
    const yScale = d3.scaleLinear()
        .domain([0, maxValue * 1.1])
        .range([height, 0]);

    // Ejes
    // X Axis
    g.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(xScale))
        .style('font-size', '14px')
        .selectAll('text')
        .style('text-anchor', 'middle');

    // Y Axis
    g.append('g')
        .call(d3.axisLeft(yScale).ticks(5).tickFormat(d => `$${d.toLocaleString()}`))
        .style('font-size', '14px');

    // Título eje Y
    g.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -height / 2)
        .attr('y', -90)
        .attr('text-anchor', 'middle')
        .attr('font-size', '16px')
        .attr('font-weight', '600')
        .attr('fill', colorPalette.story.textMain)
        .text('Miles de Millones USD (PPP)');

    // Dibujar barras con animación
    data.forEach((d, i) => {
        // Barra
        g.append('rect')
            .attr('x', xScale(d.label))
            .attr('y', height)
            .attr('width', xScale.bandwidth())
            .attr('height', 0)
            .attr('fill', d.color)
            .attr('opacity', 0.85)
            .transition()
            .delay(i * 400)
            .duration(800)
            .attr('y', yScale(d.value))
            .attr('height', height - yScale(d.value));

        // Valor en la parte superior
        g.append('text')
            .attr('x', xScale(d.label) + xScale.bandwidth() / 2)
            .attr('y', yScale(d.value) - 10)
            .attr('text-anchor', 'middle')
            .attr('font-size', '18px')
            .attr('font-weight', '700')
            .attr('fill', d.color)
            .attr('opacity', 0)
            .text(d.description)
            .transition()
            .delay(i * 400 + 800)
            .duration(400)
            .attr('opacity', 1);
    });

    // Nota explicativa
    // Put on SVG to ensure it's centered relative to total width and nice spacing
    svg.append('text')
        .attr('x', (layout.totalWidth - layout.margin.left - layout.margin.right) / 2)
        .attr('y', layout.totalHeight - 40)
        .attr('text-anchor', 'middle')
        .attr('font-size', '14px')
        .attr('font-style', 'italic')
        .attr('fill', colorPalette.story.textSecondary)
        .attr('opacity', 0)
        .text('La pérdida económica acumulada esperada para el resto del XXI representa 136% del PIB de México (2019)')
        .transition()
        .delay(1200)
        .duration(600)
        .attr('opacity', 0.8);
}
