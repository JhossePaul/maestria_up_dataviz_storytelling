import { colorPalette } from '../theme.js';
import { ChartLayout } from '../utils/layout.js';

export async function drawCrimeChart(containerId) {
    // 1. LAYOUT
    const layout = new ChartLayout(containerId, {
        padding: { top: 80, right: 250, bottom: 80, left: 80 }
    });
    const { svg, g, width, height } = layout.createSVG(true);

    // 2. TITLE
    svg.append('text')
        .attr('x', (layout.totalWidth - layout.padding.left - layout.padding.right) / 2)
        .attr('y', 40)
        .attr('text-anchor', 'middle')
        .attr('font-size', '20px')
        .attr('font-weight', '600')
        .attr('fill', colorPalette.story.textMain)
        .text('Incidencia Delictiva contra Menores de Edad en México');

    // 3. DATA
    const rawData = await d3.csv('data/incidencia_delictiva.csv');
    const excludedDelitos = ['Extorsión', 'Rapto', 'Secuestro', 'Feminicidio', 'Tráfico de menores'];

    const data = rawData
        .filter(d => !excludedDelitos.includes(d.delito))
        .map(d => ({
            fecha: new Date(d.fecha),
            delito: d.delito,
            conteo: +d.conteo
        }));

    const delitos = [...new Set(data.map(d => d.delito))].sort();
    const fechas = [...new Set(data.map(d => d.fecha))].sort((a, b) => a - b);

    // 4. PALETTE
    const categoricalColors = [
        '#FFD700', '#FF8C00', '#DC143C', '#8B008B', '#4B0082',
        '#1E90FF', '#2E8B57', '#8B4513', '#2F4F4F'
    ];
    const colorScale = d3.scaleOrdinal().domain(delitos).range(categoricalColors);

    // 5. SCALES & STACK
    const xScale = d3.scaleTime().domain(d3.extent(fechas)).range([0, width]);

    const dataByDate = d3.rollup(
        data,
        v => Object.fromEntries(v.map(d => [d.delito, d.conteo])),
        d => d.fecha
    );

    const stackData = fechas.map(fecha => {
        const obj = { fecha };
        delitos.forEach(delito => {
            obj[delito] = dataByDate.get(fecha)?.[delito] || 0;
        });
        return obj;
    });

    const stack = d3.stack().keys(delitos);
    const series = stack(stackData);

    const maxY = d3.max(series[series.length - 1], d => d[1]);
    const yScale = d3.scaleLinear().domain([0, maxY * 1.1]).range([height, 0]);

    // 6. AXES and TITLE SIZE
    g.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(xScale).ticks(5)) // Fewer ticks for cleaner look
        .style('font-size', '16px'); // Increased from 14px

    g.append('g')
        .call(d3.axisLeft(yScale))
        .style('font-size', '16px'); // Increased from 14px

    g.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -height / 2)
        .attr('y', -60)
        .attr('text-anchor', 'middle')
        .attr('font-size', '18px') // Increased from 16px
        .attr('font-weight', '600')
        .attr('fill', colorPalette.story.textMain)
        .text('Casos Reportados');

    // 7. AREA GENERATOR
    const area = d3.area()
        .x(d => xScale(d.data.fecha))
        .y0(d => yScale(d[0]))
        .y1(d => yScale(d[1]))
        .curve(d3.curveMonotoneX);

    // HELPER: WRAP TEXT
    function wrap(text, width) {
        text.each(function () {
            var text = d3.select(this),
                words = text.text().split(/\s+/).reverse(),
                word,
                line = [],
                lineNumber = 0,
                lineHeight = 1.1, // ems
                y = text.attr("y"),
                x = text.attr("x"),
                // FIX: Initial dy set to 0.8em so text baseline is ~11px down, aligning cap height with Rect top (y=0)
                // Rect (15px height). Text (14px). Baseline at 0.8em ~ 11.2px. 
                // Top of text roughly at 0. Bottom at 14. Perfect alignment.
                dy = 0.8,
                tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");
            while (word = words.pop()) {
                line.push(word);
                tspan.text(line.join(" "));
                if (tspan.node().getComputedTextLength() > width) {
                    line.pop();
                    tspan.text(line.join(" "));
                    line = [word];
                    tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
                }
            }
        });
    }

    // 8. ANIMATION LOGIC
    const legendX = width + 20;
    const legendY = 0;
    const legendWidth = 220; // Available space (Padding Right 250 - 20)
    const legendGroup = g.append('g').attr('class', 'legend');

    const areaGroup = g.append('g').attr('class', 'areas');

    // 9. PANDEMIC LINE (On Top)
    // Date: 23 March 2020
    const pandemicDate = new Date(2020, 2, 23); // Month is 0-indexed (2 = March)
    const pandemicX = xScale(pandemicDate);

    // Draw line group ON TOP of everything (append last)
    const overlayGroup = g.append('g').attr('class', 'overlay');

    overlayGroup.append('line')
        .attr('x1', pandemicX).attr('y1', 0)
        .attr('x2', pandemicX).attr('y2', height)
        .attr('stroke', colorPalette.story.crisisHighlight) // Bright Red
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '5,5')
        .attr('opacity', 0.8);

    // Optional: Label for Pandemic (User didn't explicitly ask for text, just line, but helpful?)
    // "Line ... for March 23 2020". I'll strictly stick to line as requested "dibujar una línea roja punteada".

    let currentDelitoIndex = 0;
    const animationDuration = 1000;
    const fadeDuration = 400;

    // Helper to draw dynamic legend
    function drawLegend(currentUpTo, isFinal = false) {
        legendGroup.selectAll('.legend-item-group').remove();

        let currentY = legendY;

        delitos.forEach((delito, i) => {
            if (i > currentUpTo && !isFinal) return; // Only draw up to current

            const isCurrent = (i === currentUpTo) && !isFinal;
            // Determine color
            let color;
            if (isFinal) {
                color = colorScale(delito);
            } else {
                color = isCurrent ? colorPalette.story.crisis : colorPalette.story.context;
            }

            const opacity = (isCurrent || isFinal) ? 1 : 0.6;

            const itemGroup = legendGroup.append('g')
                .attr('class', 'legend-item-group')
                .attr('transform', `translate(${legendX}, ${currentY})`);

            // Rect
            itemGroup.append('rect')
                .attr('width', 15).attr('height', 15)
                .attr('fill', color).attr('opacity', opacity);

            // Text
            const text = itemGroup.append('text')
                .attr('x', 24)
                .attr('y', 0) // Align top with rect
                // dy handled by wrap now (starts at 0.8em)
                .attr('font-size', '14px')
                .attr('fill', colorPalette.story.textMain)
                .attr('font-weight', isCurrent ? 'bold' : 'normal')
                .text(delito);

            // Wrap text
            text.call(wrap, legendWidth - 24);

            // Calculate height added by text wrapping
            // Default 1 line ~ 15-20px. 
            // We can count tspans to guess height
            const lineCount = text.selectAll('tspan').size();
            const lineHeight = 16; // Approx px height per line
            const itemHeight = Math.max(20, lineCount * lineHeight);

            currentY += itemHeight + 10; // Add padding between items
        });

        // ADD PANDEMIC LEGEND ITEM
        // Always drawn at the end
        const pandemicGroup = legendGroup.append('g')
            .attr('class', 'legend-item-group')
            .attr('transform', `translate(${legendX}, ${currentY + 10})`); // Extra spacing

        // Icon: Dashed Line center vertically in 15px box equivalent
        pandemicGroup.append('line')
            .attr('x1', 0).attr('y1', 7.5)
            .attr('x2', 15).attr('y2', 7.5)
            .attr('stroke', colorPalette.story.crisisHighlight) // Red
            .attr('stroke-width', 2)
            .attr('stroke-dasharray', '3,2'); // Dashed style

        // Text
        const panText = pandemicGroup.append('text')
            .attr('x', 24)
            .attr('y', 0)
            // dy handled by wrap (starts at 0.8em)
            .attr('font-size', '14px')
            .attr('fill', colorPalette.story.textMain)
            //.attr('font-weight', 'bold') // Optional: make it stand out? Standard is fine.
            .text("Inicio de Pandemia");

        // Wrap text
        panText.call(wrap, legendWidth - 24);
    }

    function animateNextDelito() {
        // Draw Legend for current state
        drawLegend(currentDelitoIndex, false);

        if (currentDelitoIndex >= delitos.length) {
            // FINISHED
            setTimeout(() => {
                areaGroup.selectAll('path')
                    .data(series)
                    .transition().duration(1000)
                    .attr('fill', (d, i) => colorScale(delitos[i]))
                    .attr('opacity', 0.7);

                // Final Legend with correct colors
                drawLegend(delitos.length - 1, true);
            }, 500);
            return;
        }

        const delitoData = series[currentDelitoIndex];

        setTimeout(() => {
            const path = areaGroup.append('path')
                .datum(delitoData)
                .attr('d', area)
                .attr('fill', colorPalette.story.crisis)
                .attr('opacity', 0);

            path.transition().duration(animationDuration)
                .attr('opacity', 0.7)
                .on('end', () => {
                    path.transition().duration(fadeDuration)
                        .attr('fill', colorPalette.story.context)
                        .attr('opacity', 0.6)
                        .on('end', () => {
                            currentDelitoIndex++;
                            animateNextDelito();
                        });
                });
        }, 100); // Reduced delay for smoother feel
    }

    animateNextDelito();
}
