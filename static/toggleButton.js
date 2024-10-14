const toggleButton = document.getElementById('toggleInsights');
const insightsContainer = document.getElementById('insights-container');

toggleButton.addEventListener('click', () => {
    insightsContainer.classList.toggle('open'); 

    if (insightsContainer.classList.contains('open')) {
        toggleButton.textContent = 'Hide Insights'; 
    } else {
        toggleButton.textContent = 'Show Insights'; 
    }
});