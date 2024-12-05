const apiEndpoint = 'http://192.168.66.221:8080/api/plantData'; // Replace with your Flask server IP
let fetchCount = 0;
const chartData = {
  labels: [],
  datasets: [
    {
      label: 'Soil Moisture (%)',
      borderColor: 'green',
      backgroundColor: 'rgba(0, 255, 0, 0.2)',
      data: [],
    },
    {
      label: 'Temperature (°C)',
      borderColor: 'orange',
      backgroundColor: 'rgba(255, 165, 0, 0.2)',
      data: [],
    },
    {
      label: 'Humidity (%)',
      borderColor: 'blue',
      backgroundColor: 'rgba(0, 0, 255, 0.2)',
      data: [],
    },
  ],
};

// Initialize Chart.js line chart
const ctx = document.getElementById('dataChart').getContext('2d');
const dataChart = new Chart(ctx, {
  type: 'line',
  data: chartData,
  options: {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
    },
  },
});

// Create and initialize CanvasGauges
const soilMoistureGauge = new RadialGauge({
  renderTo: 'soilMoistureGauge',
  width: 250,
  height: 250,
  units: 'Moisture (%)',
  minValue: 0,
  maxValue: 100,
  value: 0,
  colorPlate: '#fff',
  colorUnits: '#000',
  borders: false,
  needleType: 'arrow',
  needleWidth: 2,
  needleCircleSize: 7,
  needleCircleOuter: true,
  needleCircleInner: false,
  animationDuration: 500,
  animationRule: 'linear',
}).draw();

const temperatureGauge = new RadialGauge({
  renderTo: 'temperatureGauge',
  width: 250,
  height: 250,
  units: 'Temperature (°C)',
  minValue: -10,
  maxValue: 50,
  value: 0,
  colorPlate: '#fff',
  colorUnits: '#000',
  borders: false,
  needleType: 'arrow',
  needleWidth: 2,
  needleCircleSize: 7,
  needleCircleOuter: true,
  needleCircleInner: false,
  animationDuration: 500,
  animationRule: 'linear',
}).draw();

const humidityGauge = new RadialGauge({
  renderTo: 'humidityGauge',
  width: 250,
  height: 250,
  units: 'Humidity (%)',
  minValue: 0,
  maxValue: 100,
  value: 0,
  colorPlate: '#fff',
  colorUnits: '#000',
  borders: false,
  needleType: 'arrow',
  needleWidth: 2,
  needleCircleSize: 7,
  needleCircleOuter: true,
  needleCircleInner: false,
  animationDuration: 500,
  animationRule: 'linear',
}).draw();

// Automatic data fetch every 5 seconds
setInterval(() => {
  fetch(apiEndpoint)
    .then((response) => response.json())
    .then((data) => {
      fetchCount++;
      updateGauges(data);
      if (fetchCount % 5 === 0) updateGraph(data);
      updateRainStatus(data.isRaining);
      updateHistoricalData(data);
      checkPumpStatus(data.soilMoisture);
    })
    .catch((error) => {
      console.error('Error fetching data:', error);
    });
}, 2000);

// Update gauges with new data
function updateGauges(data) {
  soilMoistureGauge.value = data.soilMoisture;
  temperatureGauge.value = data.temperature;
  humidityGauge.value = data.humidity;
}

// Update rain status text
function updateRainStatus(isRaining) {
  document.getElementById('rainText').textContent = isRaining ? 'Yes' : 'No';
}

// Update chart with historical data
function updateGraph(data) {
  chartData.labels.push(new Date().toLocaleTimeString());
  chartData.datasets[0].data.push(data.soilMoisture);
  chartData.datasets[1].data.push(data.temperature);
  chartData.datasets[2].data.push(data.humidity);
  dataChart.update();
}

// Update the historical data table
function updateHistoricalData(data) {
  const tableBody = document.querySelector('#historicalDataTable tbody');
  const row = document.createElement('tr');
  row.innerHTML = `
    <td>${new Date().toLocaleString()}</td>
    <td>${data.soilMoisture}%</td>
    <td>${data.temperature}°C</td>
    <td>${data.humidity}%</td>
    <td>${data.isRaining ? 'Yes' : 'No'}</td>
  `;
  tableBody.appendChild(row);
}

// Check and update the pump status
function checkPumpStatus(soilMoisture) {
  const pumpStatus = document.getElementById('pumpText');
  if (soilMoisture < 30) {
    pumpStatus.textContent = 'ON';
    pumpStatus.style.color = 'red';
  } else {
    pumpStatus.textContent = 'OFF';
    pumpStatus.style.color = 'green';
  }
}
