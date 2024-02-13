import React, { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  RadialLinearScale,
  Title,
  Tooltip,
  PointElement,
  LineElement,
} from "chart.js";
import { Pie } from "react-chartjs-2";

// Register ChartJS components
ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  RadialLinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip
);

// Fetch and process data for the chart
async function getData(network: string, address: string) {
  try {
    const response = await fetch(
      `https://api.astar.network/api/v3/${network}/dapps-staking/stakerslist/${address}`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("There was a problem fetching the data: ", error);
  }
}

async function getLargestStakerCountAddress(network: string) {
  try {
    const response = await fetch(`https://api.astar.network/api/v3/${network}/dapps-staking/chaindapps`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const apiData = await response.json();
    
    const filteredData = apiData.filter(entry => entry.stakersCount > 0 && entry.state === 'Registered');
    
    let largestStakerCount = 0;
    let largestStakerCountAddress = null;
    
    filteredData.forEach(entry => {
      if (entry.stakersCount > largestStakerCount) {
        largestStakerCount = entry.stakersCount;
        largestStakerCountAddress = entry.contractAddress;
      }
    });
      
    return largestStakerCountAddress;
  } catch (error) {
    console.error('There was a problem fetching the data: ', error);
  }
}

function stringToRGB(str) {
  // Simple hash function to convert string to hash
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }

  // Generating RGB values from the hash
  const red = (hash & 0xff0000) >> 16;
  const green = (hash & 0x00ff00) >> 8;
  const blue = hash & 0x0000ff;

  return `rgba(${red}, ${green}, ${blue}, 1)`;
}

function createDataObjectFromApiData(apiData) {
  const labels = apiData.map((entry) => entry.stakerAddress);
  const data = labels.map((label) => {
    const entry = apiData.find((e) => e.stakerAddress === label);
    const amountAdjusted = Math.floor(entry.amount / Math.pow(10, 18)); // Divide by 10^18 and round down
    return amountAdjusted;
  });
  const backgroundColor = labels.map((label) => stringToRGB(label));
  return {
    labels,
    datasets: [{ label: "Amount Staked", data, backgroundColor }],
  };
}

// Define chart options
const options = {
  maintainAspectRatio: false,
  responsive: true,
  plugins: {
    legend: { display: false },
    title: { display: true, text: "Stakers List for the most Staked Dapp" },
  },
};

// React component for the chart
const StakersListChart = ({ network }: { network: string }) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const address = await getLargestStakerCountAddress(network);
      const apiData = await getData(network, address);
      const chartData = createDataObjectFromApiData(apiData);
      setData(chartData);
    };

    fetchData();
  }, [network]);

  if (data === null) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Pie options={options} data={data} width={400} height={400} />
    </div>
  );
};

export default StakersListChart;
