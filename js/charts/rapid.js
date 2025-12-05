import { ChartLayout } from '../utils/layout.js';

export function drawRAPIDPillars(containerId) {
    const layout = new ChartLayout(containerId, {
        padding: { top: 0, right: 0, bottom: 0, left: 0 } // Full bleed inside content area
    });

    // Clear and create SVG
    // We might not even need an SVG if it's just an image, but consistency:
    const { svg, g, width, height } = layout.createSVG(true);

    const imgWidth = width * 0.9;
    const imgHeight = height * 0.9;

    svg.append('image')
        .attr('xlink:href', 'images/rapid.jpg')
        .attr('width', imgWidth)
        .attr('height', imgHeight)
        .attr('x', (layout.totalWidth - imgWidth) / 2)
        .attr('y', (layout.totalHeight - imgHeight) / 2)
        .attr('opacity', 0)
        .transition().duration(1000).attr('opacity', 1);
}
