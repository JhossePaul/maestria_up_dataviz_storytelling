import { ChartLayout } from '../utils/layout.js';

export function drawRAPIDPillars(containerId) {
    const layout = new ChartLayout(containerId, {
        padding: { top: 0, right: 0, bottom: 0, left: 0 } // Full bleed inside content area
    });

    // Clear and create SVG
    // We might not even need an SVG if it's just an image, but consistency:
    // We want to draw on the full SVG surface
    const { svg, width, height } = layout.createSVG(true);

    svg.append('image')
        .attr('xlink:href', 'images/rapid.jpg')
        .attr('width', width)
        .attr('height', height)
        .attr('preserveAspectRatio', 'xMidYMid meet') // Ensures full image is visible, no cropping
        .attr('opacity', 0)
        .transition()
        .duration(1000)
        .attr('opacity', 1);
}
