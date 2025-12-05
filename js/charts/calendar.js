import { colorPalette } from '../theme.js';
import { ChartLayout } from '../utils/layout.js';

// Global shared state for this chart if needed, or pass as arguments
// Moving 'currentSubstep' inside function scope or keeping it here if persistence needed across calls
let currentSubstep = 1;

export function drawCalendarHeatmap(containerId, substep = 1) {
    currentSubstep = substep;

    // Define Layout using Box Model
    const layout = new ChartLayout(containerId, {
        padding: { top: 80, right: 0, bottom: 0, left: 0 }
    });

    // Create SVG and get drawing area
    const { svg, g, width, height } = layout.createSVG();

    // Data Generation
    const startDate = new Date('2019-01-01');
    const endDate = new Date('2022-12-31');
    const pandemicStart = new Date('2020-03-23');

    const daysData = [];
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
        const year = currentDate.getFullYear();
        daysData.push({
            date: new Date(currentDate),
            year: year,
            isPandemic: currentDate >= pandemicStart
        });
        currentDate.setDate(currentDate.getDate() + 1);
    }

    // Chart Dimensions Calculations
    const cellSize = 10;
    const cellPadding = 1;
    const cellSide = cellSize + cellPadding;

    // We can center the content or start from 0,0 of the 'g' (which is already padded)
    // Original code used leftMargin/topMargin manually. Now 'g' handles padding.
    // Let's assume we start drawing at 0,0 relative to 'g'.

    // Recalculate cells per row/column based on available inner width/height
    const cellsPerRow = Math.floor(width / cellSide);

    function getPosition(d, index) {
        const x = (index % cellsPerRow) * cellSide;
        const y = Math.floor(index / cellsPerRow) * cellSide;
        return { x, y };
    }

    // Determine heatmap height purely for legend positioning
    const lastIndex = daysData.length - 1;
    const totalContentHeight = Math.floor(lastIndex / cellsPerRow) * cellSide + cellSide;

    // Colors
    const yearColors = {
        2019: colorPalette.categorical[0],
        2020: colorPalette.categorical[1],
        2021: colorPalette.categorical[2],
        2022: colorPalette.categorical[3]
    };

    function getYearColor(data) {
        return data.date.getTime() === pandemicStart.getTime() ?
            colorPalette.story.crisisHighlight :
            yearColors[data.year] || colorPalette.categorical[0];
    }

    // Title
    svg.append('text')
        .attr('x', (layout.totalWidth - layout.margin.left - layout.margin.right) / 2)
        .attr('y', 30) // Still absolute relative to SVG because it's a title in the "margin" area technically
        .attr('text-anchor', 'middle')
        .attr('font-size', '20px')
        .attr('font-weight', '600')
        .attr('fill', colorPalette.story.textMain)
        .text('Clases 2019-2022');

    // Draw Inteaction Group (The content)
    g.selectAll('rect.day')
        .data(daysData)
        .join('rect')
        .attr('class', 'day')
        .attr('x', (d, i) => getPosition(d, i).x)
        .attr('y', (d, i) => getPosition(d, i).y)
        .attr('width', cellSize)
        .attr('height', cellSize)
        .attr('rx', 1)
        .attr('fill', d => getYearColor(d))
        .attr('opacity', 0.8)
        .attr('stroke', '#ffffff')
        .attr('stroke-width', 0.5);

    // Legend
    const legendY = totalContentHeight + 40;
    const legendItemWidth = 120;
    // Center legend horizontally within inner width
    const legendWidth = legendItemWidth * 4;
    const legendStartX = (width - legendWidth) / 2;

    const years = [
        { year: 2019, color: yearColors[2019], label: '2019' },
        { year: 2020, color: yearColors[2020], label: '2020' },
        { year: 2021, color: yearColors[2021], label: '2021' },
        { year: 2022, color: yearColors[2022], label: '2022' }
    ];

    years.forEach((item, i) => {
        g.append('rect')
            .attr('x', legendStartX + (i * legendItemWidth))
            .attr('y', legendY)
            .attr('width', 14)
            .attr('height', 14)
            .attr('rx', 2)
            .attr('fill', item.color)
            .attr('opacity', 0.8);

        g.append('text')
            .attr('x', legendStartX + (i * legendItemWidth) + 20)
            .attr('y', legendY + 11)
            .attr('font-size', '20px')
            .attr('font-weight', '600')
            .attr('fill', colorPalette.texto) // This seems undefined in new theme? Check script.js
            .attr('fill', '#333') // Fallback
            .text(item.label);
    });
}


export function updateCalendarColors(containerId, progress) {
    // We need to re-select because this is a separate call
    // Assuming container persists
    const svg = d3.select(containerId).select('svg');
    if (svg.empty()) return;

    // We need helper functions re-defined or exported if shared
    // Duplicating small logic for module isolation or exporting helpers?
    // Let's keep isolation for now.

    function getYearColorForUpdate(data) {
        const yearColors = {
            2019: colorPalette.categorical[0],
            2020: colorPalette.categorical[1],
            2021: colorPalette.categorical[2],
            2022: colorPalette.categorical[3]
        };
        const pandemicStart = new Date('2020-03-23');
        return data.date.getTime() === pandemicStart.getTime() ?
            colorPalette.story.crisisHighlight :
            yearColors[data.year] || colorPalette.categorical[0];
    }

    function pandemicColor(progress, data) {
        const initColor = getYearColorForUpdate(data);
        const pandemicColorScale = d3.scaleLinear()
            .domain([0, 1])
            .range([initColor, "#1a1a1a"]);
        const pandemicStart = new Date('2020-03-23');

        return data.date.getTime() === pandemicStart.getTime() ?
            colorPalette.story.crisisHighlight :
            pandemicColorScale(progress);
    }

    svg.selectAll('rect.day')
        .transition()
        .duration(10)
        .attr('fill', function (d) {
            if (!d.isPandemic) {
                return d3.color(getYearColorForUpdate(d)).brighter(0.3);
            } else {
                return pandemicColor(progress, d);
            }
        });
}
