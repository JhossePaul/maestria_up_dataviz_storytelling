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

let chartState = {
    animated: false,
    g: null,
    scales: null,
    lineGen: null,
    regions: null
};

export async function drawLearningPoverty(containerId) {
    chartState.animated = false;
    const data = await loadLearningPovertyData();

    // Define layout
    const layout = new ChartLayout(containerId, {
        padding: { top: 80, right: 300, bottom: 80, left: 80 }
    });

    const { svg, g, width, height } = layout.createSVG(true); // Clear and redraw

    // Save state
    chartState.g = g;

    // SCALES
    const xScale = d3.scaleLinear().domain([2015, 2022]).range([0, width]);
    const yScale = d3.scaleLinear().domain([0, 100]).range([height, 0]);
    chartState.scales = { x: xScale, y: yScale };

    // SPLINE GENERATOR
    const line = d3.line()
        .curve(d3.curveMonotoneX) // Spline de tercer grado
        .x(d => xScale(d.year))
        .y(d => yScale(d.value));
    chartState.lineGen = line;

    // Prepare Data
    const years = [2015, 2019, 2022];
    const regions = data.map(d => ({
        region: d.region,
        values: years.map(year => ({ year, value: d[year.toString()] }))
    }));
    chartState.regions = regions;

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

    // 1. Draw ALL Regions (Except LATAM) Initially
    // Initial State: All colored categorical (or just context color)
    // Request implied "Wait 5s -> Shift". So start with colorful/standard.
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

        let color = regionColors[colorIndex % regionColors.length];

        g.append('path')
            .attr('class', 'region-line')
            .attr('data-region', regionData.region) // ID for selection
            .datum(regionData.values)
            .attr('fill', 'none')
            .attr('stroke', color)
            .attr('stroke-width', 2.5) // Standard width
            .attr('opacity', 0.8)
            .attr('d', line);

        legendItems.push({ label: regionData.region, color: color, id: regionData.region });
        colorIndex++;
    });

    // Initial Legend
    drawLegend(g, legendItems, width + 20);

    // Threshold Line
    g.append('line')
        .attr("y1", yScale(0)).attr("y2", yScale(100))
        .attr("x1", xScale(2019)).attr("x2", xScale(2019))
        .attr("stroke", colorPalette.story.crisis).attr("stroke-width", 2)
        .attr("stroke-dasharray", "5, 5").attr("opacity", 0.6);
}

// Helper for Legend
function drawLegend(g, items, x) {
    let legendG = g.select('.legend-group');
    if (legendG.empty()) {
        legendG = g.append('g').attr('class', 'legend-group');
    } else {
        legendG.selectAll('*').remove();
    }

    items.forEach((item, i) => {
        const y = 20 + (i * 35);
        legendG.append('rect')
            .attr('x', x).attr('y', y - 8).attr('width', 20).attr('height', 3).attr('fill', item.color);
        legendG.append('text')
            .attr('x', x + 25).attr('y', y).attr('font-size', '14px')
            .attr('fill', colorPalette.story.textMain).text(item.label);
    });
}

export function animateLearningPoverty(containerId) {
    if (chartState.animated) return;
    chartState.animated = true;

    const { g, scales, lineGen, regions } = chartState;
    if (!g || g.empty()) return; // Safety check

    const t = d3.transition().duration(1000);

    // 1. Highlight Global Line
    g.selectAll('.region-line')
        .transition(t)
        .attr('stroke', function () {
            const region = d3.select(this).attr('data-region');
            if (region === 'Global (Ingreso bajo y medio)') return colorPalette.categorical[1]; // Dark Blue
            return colorPalette.story.context; // Gray
        })
        .attr('opacity', function () {
            const region = d3.select(this).attr('data-region');
            if (region === 'Global (Ingreso bajo y medio)') return 1;
            return 0.3; // Fade others
        });

    // 2. Update Legend (Immediate for responsiveness, matches transition start)
    // Reconstruct legend items based on new state
    const currentLines = g.selectAll('.region-line').nodes();
    const newItems = [];

    // We can just query the regions again from chartState (except Latam which we add)
    regions.forEach(r => {
        if (r.region === 'América Latina y el Caribe') return;
        const isGlobal = r.region === 'Global (Ingreso bajo y medio)';
        newItems.push({
            label: r.region,
            color: isGlobal ? colorPalette.categorical[1] : colorPalette.story.context
        });
    });
    newItems.push({ label: 'América Latina y el Caribe', color: colorPalette.story.crisisHighlight });

    // Use dimensions from previous draw if possible, or just look up d3 select
    // We stored scales which used width, but we didn't store width directly. 
    // We can infer legendX from the existing legend or scales. xRange[1] = width.
    const width = scales.x.range()[1];
    drawLegend(g, newItems, width + 20);

    // 3. Draw LATAM Line (Animated Entry)
    const latamData = regions.find(r => r.region === 'América Latina y el Caribe');

    const latamPath = g.append('path')
        .attr('class', 'region-line latam-line')
        .datum(latamData.values)
        .attr('fill', 'none')
        .attr('stroke', colorPalette.story.crisisHighlight)
        .attr('stroke-width', 4)
        .attr('d', lineGen)
        .attr('opacity', 1);

    const len = latamPath.node().getTotalLength();
    latamPath
        .attr('stroke-dasharray', `${len} ${len}`)
        .attr('stroke-dashoffset', len)
        .transition().duration(2000).ease(d3.easeLinear)
        .attr('stroke-dashoffset', 0);
}
