
import { colorPalette } from '../theme.js';
import { ChartLayout } from '../utils/layout.js';

export function drawMincerCurve(containerId) {
    // 1. LAYOUT
    // Adopt margins from user's manual "vizMargin" into strict ChartLayout padding
    const layout = new ChartLayout(containerId, {
        padding: { top: 80, right: 50, bottom: 60, left: 60 }
    });

    // Use standard inner Group (g) which deals with margins automatically
    const { svg, g, width, height } = layout.createSVG(true);

    // --- Configuración del Modelo Económico ---
    const edadInicio = 22;
    const edadRetiro = 65;
    const edadFin = 80;

    // Generar datos
    const data = [];
    for (let edad = edadInicio; edad <= edadFin; edad++) {
        let salarioBase;
        const exp = edad - edadInicio;

        // 1. Fase Activa (Curva de Mincer)
        if (edad < edadRetiro) {
            salarioBase = 100 + (3.5 * exp) - (0.06 * Math.pow(exp, 2));
        }
        // 2. Fase de Retiro (Pensión)
        else {
            const expFinal = (edadRetiro - 1) - edadInicio;
            const ultimoSalario = 100 + (3.5 * expFinal) - (0.06 * Math.pow(expFinal, 2));
            salarioBase = ultimoSalario * 0.55; // Tasa de reemplazo 55%
        }

        data.push({
            edad: edad,
            ingresoBase: salarioBase,
            ingresoReal: salarioBase * (1 - 0.08) // El "Impuesto Educativo": -8%
        });
    }

    // --- Graficación ---

    // Título (Draw on SVG, outside margin-clipped area)
    svg.append('text')
        .attr('x', (layout.totalWidth - layout.margin.left - layout.margin.right) / 2)
        .attr('y', 40) // Fixed header position
        .attr('text-anchor', 'middle')
        .attr('font-size', '20px')
        .attr('font-weight', '600')
        .attr('fill', colorPalette.story.textMain)
        .text('El Ciclo de Vida del Ingreso en México');

    // Escalas (Map to inner width/height)
    const xScale = d3.scaleLinear()
        .domain([edadInicio, edadFin])
        .range([0, width]);

    const maxY = d3.max(data, d => d.ingresoBase);
    const yScale = d3.scaleLinear()
        .domain([0, maxY * 1.1])
        .range([height, 0]);

    // Ejes
    const xAxis = d3.axisBottom(xScale).tickFormat(d => `${d} años`);
    const yAxis = d3.axisLeft(yScale);

    g.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(xAxis)
        .style('font-size', '14px'); // Polished font size

    g.append('g')
        .call(yAxis)
        .style('font-size', '14px'); // Polished font size

    // Etiquetas de ejes
    // X Axis Label
    g.append('text')
        .attr('x', width / 2)
        .attr('y', height + 40)
        .attr('text-anchor', 'middle')
        .attr('font-size', '16px') // Polished font size
        .attr('fill', colorPalette.story.textSecondary)
        .text('Edad');

    // Y Axis Label
    g.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -height / 2)
        .attr('y', -45)
        .attr('text-anchor', 'middle')
        .attr('font-size', '16px') // Polished font size
        .attr('fill', colorPalette.story.textSecondary)
        .text('Nivel de Ingreso (Índice)');

    // Generadores de líneas y área
    const lineBase = d3.line()
        .x(d => xScale(d.edad))
        .y(d => yScale(d.ingresoBase))
        .curve(d3.curveMonotoneX);

    const lineReal = d3.line()
        .x(d => xScale(d.edad))
        .y(d => yScale(d.ingresoReal))
        .curve(d3.curveMonotoneX);

    const areaLoss = d3.area()
        .x(d => xScale(d.edad))
        .y0(d => yScale(d.ingresoBase))
        .y1(d => yScale(d.ingresoReal))
        .curve(d3.curveMonotoneX);

    // Grupo principal
    const chartG = g.append('g');

    // 1. Sombreado de la pérdida (Área)
    chartG.append('path')
        .datum(data)
        .attr('fill', colorPalette.story.crisis)
        .attr('fill-opacity', 0.15)
        .attr('d', areaLoss)
        .attr('opacity', 0)
        .transition()
        .duration(1000)
        .attr('opacity', 1);

    // 2. Línea Base (Vida sin Rezago) - Verde
    const pathBase = chartG.append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', colorPalette.story.hope)
        .attr('stroke-width', 2.5)
        .attr('d', lineBase);

    // Animación línea base
    const totalLengthBase = pathBase.node().getTotalLength();
    pathBase
        .attr('stroke-dasharray', totalLengthBase + ' ' + totalLengthBase)
        .attr('stroke-dashoffset', totalLengthBase)
        .transition()
        .duration(1500)
        .ease(d3.easeLinear)
        .attr('stroke-dashoffset', 0);

    // 3. Línea Real (Rezago -8%) - Vino
    const pathReal = chartG.append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', colorPalette.story.crisis)
        .attr('stroke-width', 2.5)
        .attr('d', lineReal);

    // Animación línea real (con un pequeño retraso)
    const totalLengthReal = pathReal.node().getTotalLength();
    pathReal
        .attr('stroke-dasharray', totalLengthReal + ' ' + totalLengthReal)
        .attr('stroke-dashoffset', totalLengthReal)
        .transition()
        .delay(500)
        .duration(1500)
        .ease(d3.easeLinear)
        .attr('stroke-dashoffset', 0);

    // 4. Línea de Retiro (Jubilación)
    const xRetiro = xScale(edadRetiro);
    chartG.append('line')
        .attr('x1', xRetiro)
        .attr('x2', xRetiro)
        .attr('y1', 0)
        .attr('y2', height)
        .attr('stroke', 'gray')
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', '4 4')
        .attr('opacity', 0.5);

    chartG.append('text')
        .attr('x', xRetiro + 5)
        .attr('y', yScale(10)) // Top of chart area
        .attr('font-size', '14px') // Polished font size
        .attr('fill', '#666')
        .text('Jubilación (65 años)');

    // 5. Anotaciones

    // Pico Salarial (aprox 50 años)
    const edadPico = 50;
    const valPico = data.find(d => d.edad === edadPico).ingresoBase;

    const annotationG = g.append('g').attr('opacity', 0); // Append to main g

    annotationG.append('text')
        .attr('x', xScale(edadPico) - 10)
        .attr('y', yScale(valPico) - 20)
        .attr('text-anchor', 'end')
        .attr('font-size', '14px') // Polished font size
        .attr('fill', '#666')
        .text('Pico Salarial');

    annotationG.append('line')
        .attr('x1', xScale(edadPico) - 5)
        .attr('y1', yScale(valPico) - 15)
        .attr('x2', xScale(edadPico))
        .attr('y2', yScale(valPico) - 5)
        .attr('stroke', '#666')
        .attr('stroke-width', 1)
        .attr('marker-end', 'url(#arrow)');

    // Menor Pensión
    const valFinalReal = data[data.length - 1].ingresoReal;

    annotationG.append('text')
        .attr('x', xScale(75))
        .attr('y', yScale(valFinalReal) - 50) // Shifted up for larger font
        .attr('text-anchor', 'middle')
        .attr('font-size', '14px') // Polished font size
        .attr('font-weight', 'bold')
        .attr('fill', colorPalette.story.crisis)
        .text('Menor Pensión');

    annotationG.append('text')
        .attr('x', xScale(75))
        .attr('y', yScale(valFinalReal) - 30) // Adjusted gap
        .attr('text-anchor', 'middle')
        .attr('font-size', '14px') // Polished font size
        .attr('font-weight', 'bold')
        .attr('fill', colorPalette.story.crisis)
        .text('(-8% Vitalicio)');

    annotationG.append('line')
        .attr('x1', xScale(75))
        .attr('y1', yScale(valFinalReal) - 25)
        .attr('x2', xScale(75))
        .attr('y2', yScale(valFinalReal) - 5)
        .attr('stroke', colorPalette.story.crisis)
        .attr('stroke-width', 1.5);

    annotationG.transition().delay(2000).duration(500).attr('opacity', 1);

    // Leyenda
    // Place inside Chart Area (Top Right)
    const legendG = g.append('g')
        .attr('transform', `translate(${width - 200}, 20)`);

    // Item 1
    legendG.append('line')
        .attr('x1', 0).attr('x2', 20).attr('y1', 0).attr('y2', 0)
        .attr('stroke', colorPalette.story.hope).attr('stroke-width', 2.5);
    legendG.append('text')
        .attr('x', 25).attr('y', 5) // Adjusted alignment
        .attr('font-size', '14px').attr('fill', colorPalette.story.textMain)
        .text('Vida sin Rezago Educativo');

    // Item 2
    legendG.append('line')
        .attr('x1', 0).attr('x2', 20).attr('y1', 25).attr('y2', 25) // Adjusted spacing
        .attr('stroke', colorPalette.story.crisis).attr('stroke-width', 2.5);
    legendG.append('text')
        .attr('x', 25).attr('y', 30)
        .attr('font-size', '14px').attr('fill', colorPalette.story.textMain)
        .text('Vida Real (Rezago -8%)');

    // Item 3 (Área)
    legendG.append('rect')
        .attr('x', 0).attr('y', 45).attr('width', 20).attr('height', 10) // Adjusted spacing
        .attr('fill', colorPalette.story.crisis).attr('opacity', 0.15);
    legendG.append('text')
        .attr('x', 25).attr('y', 55)
        .attr('font-size', '14px').attr('fill', colorPalette.story.textMain)
        .text('Pérdida de Bienestar');
}
