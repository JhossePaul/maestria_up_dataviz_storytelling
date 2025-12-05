/**
 * Layout Utility (Box Model)
 * Standardizes margins, padding, and dimension calculations for charts.
 * Supports percentages and responsive constraints.
 */
export class ChartLayout {
    /**
     * @param {string|HTMLElement} container - The DOM element or selector.
     * @param {object} config - Configuration object.
     * @param {object} config.margin - {top, right, bottom, left} spacing outside SVG. Supports %, e.g., "10%".
     * @param {object} config.padding - {top, right, bottom, left} spacing inside SVG. Supports %, e.g., "5%".
     */
    constructor(container, config = {}) {
        this.container = d3.select(container);

        // 1. Calculate Base Dimensions
        const containerRect = this.container.node().getBoundingClientRect();
        this.totalWidth = containerRect.width;

        // Max Height Constraint: 60% of viewport height (User request)
        const maxAllowedHeight = window.innerHeight * 0.60;
        // Use container height but cap it at 60vh. 
        // If container is huge (100vh), we limit to 60vh.
        this.totalHeight = Math.min(containerRect.height || 500, maxAllowedHeight);

        // 2. Helper to parse value (number or "10%")
        const parse = (val, total) => {
            if (typeof val === 'string' && val.includes('%')) {
                return (parseFloat(val) / 100) * total;
            }
            return val || 0;
        };

        // 3. Margin Configuration (Outside SVG)
        // Default: 15% side margins for "air" (User request: 10-15%)
        const defaultSideMargin = this.totalWidth * 0.15;

        const userMargin = config.margin || {};
        this.margin = {
            top: parse(userMargin.top, this.totalHeight),
            // Use user value if provided, else default 15%
            right: userMargin.right !== undefined ? parse(userMargin.right, this.totalWidth) : defaultSideMargin,
            bottom: parse(userMargin.bottom, this.totalHeight),
            left: userMargin.left !== undefined ? parse(userMargin.left, this.totalWidth) : defaultSideMargin
        };

        // 4. Padding Configuration (Inside SVG - Chart Area)
        const userPadding = config.padding || {};
        this.padding = {
            top: parse(userPadding.top !== undefined ? userPadding.top : 40, this.totalHeight),
            right: parse(userPadding.right !== undefined ? userPadding.right : 40, this.totalWidth),
            bottom: parse(userPadding.bottom !== undefined ? userPadding.bottom : 40, this.totalHeight),
            left: parse(userPadding.left !== undefined ? userPadding.left : 40, this.totalWidth)
        };

        // 5. Calculate Inner Dimensions
        // Canvas (SVG structure)
        this.width = this.totalWidth - this.margin.left - this.margin.right;
        this.height = this.totalHeight - this.margin.top - this.margin.bottom;

        // Drawing Area (g)
        this.innerWidth = this.width - this.padding.left - this.padding.right;
        this.innerHeight = this.height - this.padding.top - this.padding.bottom;
    }

    /**
     * Creates or selects the SVG element and returns the main drawing group <g>.
     * Automatically clears container if specified.
     * @param {boolean} clear - Whether to clear the container before creating.
     * @returns {object} { svg, g, width, height, ... }
     */
    createSVG(clear = true) {
        if (clear) {
            this.container.selectAll('*').remove();
        }

        // Apply margins by positioning the SVG or using translation?
        // Standard D3: SVG is full box, Margin is inside grouping? No, User "Box Model" request:
        // "Margins delimit where starts the canvas". 
        // So SVG width = Total - Margins.
        // We can center this SVG in the container or use CSS margins.
        // Let's use CSS margins on the SVG to position it "in the middle" of the container width if side margins are symmetric.

        const svg = this.container.append('svg')
            .attr('width', this.width)
            .attr('height', this.height)
            .style('display', 'block')
            // Center horizontally if margins are symmetric, otherwise respect exact margins
            .style('margin-left', `${this.margin.left}px`)
            .style('margin-right', `${this.margin.right}px`)
            // Enforce vertical centering via Flexbox
            .style('align-self', 'center');

        // Only apply top margin if explicitly requested (offset from center/top)
        if (this.margin.top > 0) {
            svg.style('margin-top', `${this.margin.top}px`);
        }

        // The 'bounds' group respects padding (similar to D3 margin convention)
        const g = svg.append('g')
            .attr('transform', `translate(${this.padding.left},${this.padding.top})`);

        return {
            svg: svg,
            g: g,
            width: this.innerWidth,
            height: this.innerHeight,
            totalWidth: this.width,
            totalHeight: this.height,
            padding: this.padding
        };
    }
}
