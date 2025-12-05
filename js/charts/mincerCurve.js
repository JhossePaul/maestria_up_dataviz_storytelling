
import { colorPalette } from '../theme.js';
import { ChartLayout } from '../utils/layout.js';

export function drawMincerCurve(containerId) {
    // Clear and Setup Layout
    const layout = new ChartLayout(containerId, {
        padding: { top: 80, right: 100, bottom: 80, left: 100 }
    });
    const { svg, g, width, height } = layout.createSVG(true);

    // === MINCER CURVE ===
    const edadInicio = 22, edadRetiro = 65, edadFin = 80;
    const data = [];
    for (let edad = edadInicio; edad <= edadFin; edad++) {
        let salarioBase;
        const exp = edad - edadInicio;
        if (edad < edadRetiro) salarioBase = 100 + (3.5 * exp) - (0.06 * Math.pow(exp, 2));
        else {
            const expFinal = (edadRetiro - 1) - edadInicio;
            salarioBase = (100 + (3.5 * expFinal) - (0.06 * Math.pow(expFinal, 2))) * 0.55;
        }
        data.push({ edad, ingresoBase: salarioBase, ingresoReal: salarioBase * 0.92 });
    }

    const x = d3.scaleLinear().domain([edadInicio, edadFin]).range([0, width]);
    const y = d3.scaleLinear().domain([0, d3.max(data, d => d.ingresoBase) * 1.1]).range([height, 0]);

    svg.append('text').attr('x', layout.totalWidth / 2).attr('y', 40).attr('text-anchor', 'middle')
        .text('El Ciclo de Vida del Ingreso').attr('font-weight', 'bold')
        .attr('font-size', '20px') // Standardized
        .attr('fill', colorPalette.story.textMain);

    const lineBase = d3.line().x(d => x(d.edad)).y(d => y(d.ingresoBase));
    const lineReal = d3.line().x(d => x(d.edad)).y(d => y(d.ingresoReal));
    const areaLoss = d3.area().x(d => x(d.edad)).y0(d => y(d.ingresoBase)).y1(d => y(d.ingresoReal));

    g.append('path').datum(data).attr('fill', colorPalette.story.crisis).attr('opacity', 0.2).attr('d', areaLoss);
    g.append('path').datum(data).attr('fill', 'none').attr('stroke', colorPalette.story.hope).attr('stroke-width', 2).attr('d', lineBase);
    g.append('path').datum(data).attr('fill', 'none').attr('stroke', colorPalette.story.crisis).attr('stroke-width', 2).attr('d', lineReal);

    g.append('g').attr('transform', `translate(0,${height})`).call(d3.axisBottom(x)).style('font-size', '14px');
    g.append('g').call(d3.axisLeft(y)).style('font-size', '14px');
}
