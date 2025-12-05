import { colorPalette } from '../theme.js';
import { ChartLayout } from '../utils/layout.js';

let learningPovertyData = null;

async function loadLearningPovertyData() {
    if (!learningPovertyData) {
        const response = await fetch('data/learning_poverty.json');
        learningPovertyData = await response.json();
    }
    return learningPovertyData;
}

export async function drawLearningPoverty(containerId) {
    // === LINE CHART (Step 2) ===
    const data = await loadLearningPovertyData();

    // Define layout
    const layout = new ChartLayout(containerId, {
        padding: { top: 80, right: 300, bottom: 80, left: 80 }
    });

    const { svg, g, width, height } = layout.createSVG(true); // Clear and redraw

    // SCALES
    const xScale = d3.scaleLinear().domain([2015, 2022]).range([0, width]);
    const yScale = d3.scaleLinear().domain([0, 100]).range([height, 0]);

    // SPLINE GENERATOR
    const line = d3.line()
        .curve(d3.curveMonotoneX) // Spline de tercer grado
        .x(d => xScale(d.year))
        .y(d => yScale(d.value));

    // Prepare Data
    const years = [2015, 2019, 2022];
    const regions = data.map(d => ({
        region: d.region,
        values: years.map(year => ({ year, value: d[year.toString()] }))
    }));

    // Draw Axes & Title
    svg.append('text')
        .attr('x', (layout.totalWidth - layout.margin.left - layout.margin.right) / 2)
        .attr('y', 40)
        .attr('text-anchor', 'middle')
        .attr('font-size', '20px')
        .attr('font-weight', '600')
        .attr('fill', colorPalette.story.textMain)
        .text('Pobreza del Aprendizaje en el Mundo');

    g.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(xScale).tickValues([2015, 2019, 2022]).tickFormat(d3.format('d')))
        .style('font-size', '16px');

    g.append('g').call(d3.axisLeft(yScale)).style('font-size', '16px');

    svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -layout.totalHeight / 2)
        .attr('y', 30)
        .attr('text-anchor', 'middle')
        .attr('font-size', '18px')
        .attr('font-weight', '600')
        .attr('fill', colorPalette.story.textMain)
        .text('Pobreza del aprendizaje (%)');

    // 1. Draw ALL Regions (Except LATAM) with colors
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

        // "Global" starts distinct? Request says "Update Global to Blue" later.
        // Initially, let's use the categorical palette for everyone.

        let color = regionColors[colorIndex % regionColors.length];
        const isGlobal = regionData.region === 'Global (Ingreso bajo y medio)';
        const strokeWidth = isGlobal ? 4 : 2.5;

        g.append('path')
            .attr('class', 'region-line')
            .attr('data-region', regionData.region) // ID for selection
            .datum(regionData.values)
            .attr('fill', 'none')
            .attr('stroke', color)
            .attr('stroke-width', strokeWidth)
            .attr('opacity', 0.8)
            .attr('d', line);

        legendItems.push({ label: regionData.region, color: color, id: regionData.region });
        colorIndex++;
    });

    // Initial Legend
    const legendG = g.append('g').attr('class', 'legend-group');
    const legendX = width + 20;

    function drawLegend(items) {
        legendG.selectAll('*').remove();
        items.forEach((item, i) => {
            const y = 20 + (i * 35);
            legendG.append('rect')
                .attr('x', legendX).attr('y', y - 8).attr('width', 20).attr('height', 3).attr('fill', item.color);
            legendG.append('text')
                .attr('x', legendX + 25).attr('y', y).attr('font-size', '14px')
                .attr('fill', colorPalette.story.textMain).text(item.label);
        });
    }
    drawLegend(legendItems);

    // Threshold Line
    g.append('line')
        .attr("y1", yScale(0)).attr("y2", yScale(100))
        .attr("x1", xScale(2019)).attr("x2", xScale(2019))
        .attr("stroke", colorPalette.story.crisis).attr("stroke-width", 2)
        .attr("stroke-dasharray", "5, 5").attr("opacity", 0.6);


    // === ANIMATION SEQUENCE ===

    // 2. Wait 5 Seconds -> Trigger Color Shift
    const delayTime = 5000;

    // Use a transition name to avoid conflicts if user scrolls away rapidly?
    // Using simple setTimeout for logic flow, but D3 transition.delay preferred for sync.
    // However, setTimeout prevents the block from executing if we clear SVG (step exit).
    // Let's use d3.timeout or just transition delay.

    const t = d3.transition().delay(delayTime).duration(1000);

    // Update Lines: All -> Gray, Global -> Blue (colorPalette.categorical[1] is Dark Blue)
    // Global ID: 'Global (Ingreso bajo y medio)'

    g.selectAll('.region-line')
        .transition(t)
        .attr('stroke', function () {
            const region = d3.select(this).attr('data-region');
            if (region === 'Global (Ingreso bajo y medio)') return colorPalette.categorical[1]; // Blue
            return colorPalette.story.context; // Gray
        })
        .attr('opacity', function () {
            const region = d3.select(this).attr('data-region');
            if (region === 'Global (Ingreso bajo y medio)') return 1;
            return 0.3; // Fade others
        });

    // Update Legend
    // For legend update, we can't easily transition text/rect D3 selection without data join.
    // We'll just fade out/in new legend or update fill.
    // Simplification: Repaint legend after delay.
    setTimeout(() => {
        // Check if chart still exists (user hasn't scrolled away)
        if (g.select('.region-line').empty()) return;

        const newItems = legendItems.map(item => ({
            label: item.label,
            color: item.label === 'Global (Ingreso bajo y medio)' ? colorPalette.categorical[1] : colorPalette.story.context
        }));

        // Add LATAM to legend
        newItems.push({ label: 'América Latina y el Caribe', color: colorPalette.story.crisisHighlight });

        // We only want Global, LATAM, and maybe "Others" in legend? Or keep list but grayed?
        // User didn't specify legend behavior, but usually we emphasize main actors.
        // Let's keep specific list but update colors.

        drawLegend(newItems);

        // 3. Draw LATAM Line (Animated Entry)
        const latamData = regions.find(r => r.region === 'América Latina y el Caribe');
        const latamPath = g.append('path')
            .attr('class', 'region-line latam-line') // distinct class
            .datum(latamData.values)
            .attr('fill', 'none')
            .attr('stroke', colorPalette.story.crisisHighlight)
            .attr('stroke-width', 4)
            .attr('d', line);

        const len = latamPath.node().getTotalLength();
        latamPath
            .attr('stroke-dasharray', `${len} ${len}`)
            .attr('stroke-dashoffset', len)
            .transition().duration(2000).ease(d3.easeLinear)
            .attr('stroke-dashoffset', 0);

    }, delayTime);
}
