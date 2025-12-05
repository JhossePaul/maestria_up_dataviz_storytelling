// Imports from Modules
import { updateCalendarColors, drawCalendarHeatmap } from './charts/calendar.js';
import { drawLearningPoverty } from './charts/learningPoverty.js';
import { drawLearningPovertyIcons } from './charts/learningPovertyIcons.js';
import { drawTimeSeries } from './charts/pisa.js';
import { drawDigitalDivide } from './charts/digitalDivide.js';
import { drawChildLaborSankey } from './charts/childLaborSankey.js';
import { drawCrimeChart } from './charts/crimeChart.js';
import { drawMentalHealthSankey } from './charts/mentalHealthSankey.js';
import { drawMincerCurve } from './charts/mincerCurve.js';
import { drawEconomicLossGDP } from './charts/economicLossGDP.js';
import { drawRAPIDPillars } from './charts/rapid.js';
import { colorPalette } from './theme.js';

// ... (existing code)

// Router
switch (step) {
    case '1':
        drawCalendarHeatmap(containerId);
        break;
    case '2':
        drawLearningPoverty(containerId);
        break;
    case '3':
        drawLearningPovertyIcons(containerId);
        break;
    case '4':
        drawTimeSeries(containerId);
        break;
    case '5':
        drawDigitalDivide(containerId);
        break;
    case '6':
        drawChildLaborSankey(containerId);
        break;
    case '7':
        drawCrimeChart(containerId);
        break;
    case '8':
        drawMentalHealthSankey(containerId);
        break;
    case '9':
        drawMincerCurve(containerId);
        break;
    case '10':
        drawEconomicLossGDP(containerId);
        break;
    case '11':
        drawRAPIDPillars(containerId);
        break;
}
        })
        .onStepProgress(response => {
    const step = response.element.dataset.step;
    if (step === '1') {
        updateCalendarColors(containerId, response.progress);
    }
})
    .onStepExit(response => {
        const step = response.element.dataset.step;
        const direction = response.direction;

        if (step === '1' && direction === 'up') hideNavbar();
        if (step === '11' && direction === 'down') hideNavbar();
    });

window.addEventListener('resize', handleResize);

// Initial Trace
drawCalendarHeatmap(containerId);
});
