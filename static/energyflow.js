const energyFlow = document.querySelector('.energy-flow');
const energyPath = document.querySelector('.energy-path');
const energyGlow = document.querySelector('.energy-glow');

document.addEventListener('DOMContentLoaded', () => {
  updateEnergyFlow();

  window.addEventListener('resize', updateEnergyFlow);
  window.addEventListener('orientationchange', updateEnergyFlow);
});

function updateEnergyFlow() {
  const height = window.innerHeight;
  const width = window.innerWidth;

  requestAnimationFrame(() => {
    energyFlow.setAttribute('viewBox', `0 0 ${width} ${height}`);
    const curve = `M0,${height/2} Q${width/4},${height/2-170} ${width/2},${height/2} T${width},${height/2}`;
    energyPath.setAttribute('d', curve);
    energyGlow.setAttribute('d', curve);
  });
}