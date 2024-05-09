// let incomeChart; // Holds the chart instance to manage updates

function drawIncomeHistogram(incomeDataByTract) {
    if (!incomeDataByTract) {
        console.error("Income data by tract is undefined or null.");
        return; // Exit if no data provided
    }

    const canvas = document.getElementById('incomeHistogram');
    if (!canvas) {
        console.error("Canvas element 'incomeHistogram' not found.");
        return;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error("Failed to get the canvas context.");
        return;
    }

    const incomeData = Object.values(incomeDataByTract).map(data => data.medianIncome).filter(income => income > 0);
    const incomeLabels = ['<30k', '30k-60k', '60k-90k', '90k-120k', '120k-150k', '150k+'];
    const incomeCounts = new Array(incomeLabels.length).fill(0);
    incomeData.forEach(income => {
        if (income < 30000) incomeCounts[0]++;
        else if (income < 60000) incomeCounts[1]++;
        else if (income < 90000) incomeCounts[2]++;
        else if (income < 120000) incomeCounts[3]++;
        else if (income < 150000) incomeCounts[4]++;
        else incomeCounts[5]++;
    });

    const data = {
        labels: incomeLabels,
        datasets: [{
            label: 'Income Distribution',
            data: incomeCounts,
            backgroundColor: ['#adebad', '#70db70', '#33cc33', '#29a329', '#1f7a1f', '#145214'],
            borderWidth: 1
        }]
    };

    const config = {
        type: 'bar',
        data: data,
        options: {scales: {y: {beginAtZero: true}}}
    };

    // Create a new chart instance and store the reference
    incomeChart = new Chart(ctx, config);
}

// Remove any direct call to drawIncomeHistogram() here, or ensure it's called with valid data
function toggleChartVisibility() {
    var chartContainer = document.getElementById('chartContainer');
    if (chartContainer.style.display === 'none') {
        chartContainer.style.display = 'block';
    } else {
        chartContainer.style.display = 'none';
    }
}
