import React, { useState, useEffect } from 'react';
import { 
  Chart as ChartJS, 
  ArcElement,
  CategoryScale, 
  LinearScale, 
  Title, 
  Tooltip, 
  PointElement, 
  LineElement,  
} from "chart.js";
import { Doughnut } from "react-chartjs-2";

// Register ChartJS components
ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
);

// Fetch and process data for the chart
async function getData() {
  try {
    const response = await fetch('https://api.astar.network/api/v3/shibuya/dapps-staking/chaindapps');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('There was a problem fetching the data: ', error);
  }
}

function stringToRGB(str) {
    // Simple hash function to convert string to hash
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }

    // Generating RGB values from the hash
    const red = (hash & 0xFF0000) >> 16;
    const green = (hash & 0x00FF00) >> 8;
    const blue = hash & 0x0000FF;

    return `rgba(${red}, ${green}, ${blue}, 1)`;
}

function createDataObjectFromApiData(apiData) {
  const filteredData = apiData.filter(entry => entry.stakersCount > 0 && entry.state === 'Registered');
  const labels = filteredData.map(entry => entry.contractAddress);
  const data = labels.map(label => filteredData.find(e => e.contractAddress === label).stakersCount);
  const backgroundColor = labels.map(label => stringToRGB(label));
  return {
    labels,
    datasets: [{ label: "# of Stakers", data, backgroundColor }]
  };
}

// Define chart options
const options = {
  maintainAspectRatio: false,
  responsive: true,
  plugins: {
    legend: { display: false},
    title: { display: true, text: "Registered Dapps" }
  },
};

// React component for the chart
const DappsChart = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    getData().then(apiData => {
      const chartData = createDataObjectFromApiData(apiData);
      setData(chartData);
    });
  }, []);

  if (data === null) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Doughnut options={options} data={data} width={400} height={400} />
    </div>
  );
};

export default DappsChart;
