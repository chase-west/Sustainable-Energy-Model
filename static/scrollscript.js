document.addEventListener('DOMContentLoaded', () => {
  const sections = document.querySelectorAll('.section');
  const indicators = document.querySelectorAll('.section-indicator li');
  let currentSectionIndex = 0;
  let isTransitioning = false;

  window.addEventListener('resize', updateEnergyFlow);
  updateEnergyFlow();

  function updateSections(index) {
      if (isTransitioning || index === currentSectionIndex) return;
      isTransitioning = true;

      sections[currentSectionIndex].classList.remove('active-section');
      sections[index].classList.add('active-section');

      indicators[currentSectionIndex].classList.remove('active');
      indicators[index].classList.add('active');

      currentSectionIndex = index;

      setTimeout(() => isTransitioning = false, 700); 
  }

  function handleScroll(deltaY) {
      if (deltaY > 0 && currentSectionIndex < sections.length - 1) {
          updateSections(currentSectionIndex + 1);
      } else if (deltaY < 0 && currentSectionIndex > 0) {
          updateSections(currentSectionIndex - 1);
      }
  }

  // Mouse wheel scroll
  document.addEventListener('wheel', (e) => {
      e.preventDefault();
      handleScroll(e.deltaY);
  }, { passive: false });

  // Touch scroll (mobile)
  let touchStartY = 0;
  document.addEventListener('touchstart', (e) => {
      touchStartY = e.touches[0].clientY;
  }, { passive: false });

  document.addEventListener('touchend', (e) => {
      const deltaY = touchStartY - e.changedTouches[0].clientY;
      if (Math.abs(deltaY) > 50) { // Sensitivity for swipes
          handleScroll(deltaY);
      }
  }, { passive: false });

  // Handle clicking on indicators
  indicators.forEach((indicator, index) => {
      indicator.addEventListener('click', () => {
          updateSections(index);
      });
  });
});