// Imports from Modules
import { updateCalendarColors, drawCalendarHeatmap } from './charts/calendar.js';
import { drawLearningPoverty, animateLearningPoverty } from './charts/learningPoverty.js';
import { drawLearningPovertyIcons } from './charts/learningPovertyIcons.js';
import { drawTimeSeries, animatePisaDrop } from './charts/pisa.js';
import { drawDigitalDivide } from './charts/digitalDivide.js';
import { drawChildLaborSankey } from './charts/childLaborSankey.js';
import { drawCrimeChart } from './charts/crimeChart.js';
import { drawMentalHealthSankey } from './charts/mentalHealthSankey.js';
import { drawMincerCurve } from './charts/mincerCurve.js';
import { drawEconomicLossGDP } from './charts/economicLossGDP.js';
import { drawRAPIDPillars } from './charts/rapid.js';

// ========================================
// NAVBAR & FOOTER LOGIC
// ========================================

const navbar = document.getElementById('scrolly-navbar');
const navbarTitle = document.getElementById('navbar-title');
const sourceBar = document.getElementById('source-bar');
const sourceText = document.getElementById('source-text');
let currentTitle = '';

function showNavbar() {
    navbar.classList.add('visible');
    sourceBar.classList.add('visible');
}

function hideNavbar() {
    navbar.classList.remove('visible');
    sourceBar.classList.remove('visible');
}

function updateNavbarTitle(step) {
    let newTitle = "";
    let newSource = "";
    const s = parseInt(step);

    if (s === 1) {
        newTitle = "El Mounstro Invisible";
        newSource = "Fuente: Cierres de escuelas (UNESCO, 2021) / Días efectivos (Monitor Educativo)";
    } else if (s >= 2 && s <= 3) {
        newTitle = "La Pobreza del Aprendizaje";
        newSource = "Fuente: Banco Mundial (2022) / Estado de la educación global";
    } else if (s === 4) {
        newTitle = "Retroceso en el Tiempo";
        newSource = "Fuente: PISA 2022 (OCDE) / Resultados México";
    } else if (s === 5) {
        newTitle = "La Brecha Digital";
        newSource = "Fuente: ENDUTIH 2022 (INEGI) / Acceso a TIC en hogares";
    } else if (s === 6) {
        newTitle = "Las Víctimas";
        newSource = "Fuente: OIT / Trabajo Infantil en tiempos de COVID";
    } else if (s === 7) {
        newTitle = "Las Víctimas";
        newSource = "Fuente: Redim / Secretariado Ejecutivo del SNSP (2023)";
    } else if (s === 8) {
        newTitle = "Las Víctimas";
        newSource = "Fuente: ENSANUT / Secretaría de Salud - Salud Mental Adolescente";
    } else if (s >= 9 && s <= 10) {
        newTitle = "La Sombra Económica";
        newSource = "Fuente: Banco Mundial / IMCO - Costo Económico del Rezago";
    } else if (s === 11) {
        newTitle = "El Arma para Vencer";
        newSource = "Fuente: World Bank - Recuperación y Aceleración de Aprendizajes (RAPID)";
    }

    if (newTitle !== currentTitle) {
        navbarTitle.classList.add('fade-out');
        setTimeout(() => {
            navbarTitle.textContent = newTitle;
            currentTitle = newTitle;
            navbarTitle.classList.remove('fade-out');
        }, 500);
    }

    if (sourceText.textContent !== newSource) {
        sourceText.style.opacity = 0;
        setTimeout(() => {
            sourceText.textContent = newSource;
            sourceText.style.opacity = 1;
        }, 500);
    }
}

// ========================================
// SCROLLAMA SETUP
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    const scroller = scrollama();
    const containerId = '#vis'; // Global visualization container

    // Resize handler
    function handleResize() {
        scroller.resize();
        // Here we could trigger a redraw of the current step if needed for full responsiveness
    }

    scroller
        .setup({
            step: '.step',
            offset: 0.5,
            debug: false,
            progress: true
        })
        .onStepEnter(response => {
            const step = response.element.dataset.step;

            // Active Class
            document.querySelectorAll('.step').forEach(s => s.classList.remove('is-active'));
            response.element.classList.add('is-active');

            // Visibility
            showNavbar();
            updateNavbarTitle(step);

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
            } else if (step === '2' && response.progress >= 0.4) {
                animateLearningPoverty(containerId, response.progress);
            } else if (step === '4' && response.progress >= 0.4) {
                animatePisaDrop(containerId, response.progress);
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
