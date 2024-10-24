document.addEventListener('DOMContentLoaded', () => {
    // Initial setup
    setupEnergyFlow();
    
    // Handle resize and orientation changes
    window.addEventListener('resize', debounce(setupEnergyFlow, 150));
    window.addEventListener('orientationchange', setupEnergyFlow);
  });
  
  // Debounce function to prevent excessive updates
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
  
  function setupEnergyFlow() {
    const energyFlow = document.querySelector('.energy-flow');
    const energyPath = document.querySelector('.energy-path');
    const energyGlow = document.querySelector('.energy-glow');
    
    if (!energyFlow || !energyPath || !energyGlow) return;
  
    // Get proper viewport dimensions
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    // Update viewBox to match viewport
    energyFlow.setAttribute('viewBox', `0 0 ${width} ${height}`);
    
    // Calculate wave parameters based on viewport
    const waveHeight = Math.min(170, height * 0.2); 
    const curveY = height / 2;
    
    // Create smooth curve path
    const curve = `M0,${curveY} ` +
                  `Q${width / 4},${curveY - waveHeight} ` +
                  `${width / 2},${curveY} ` +
                  `T${width},${curveY}`;
    
    // Apply curve to both paths
    energyPath.setAttribute('d', curve);
    energyGlow.setAttribute('d', curve);
    
    // Force repaint to prevent Safari glitches
    energyFlow.style.transform = 'translateZ(0)';
  }
  
  // Add scroll-based visibility adjustment
  document.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const container = document.querySelector('.animation-container');
    
    if (container) {
      // Adjust visibility based on scroll position
      if (scrollY > window.innerHeight) {
        container.style.opacity = '0';
      } else {
        container.style.opacity = '1';
      }
    }
  });