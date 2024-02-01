import React, { useState, useEffect } from 'react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  Title, 
  Tooltip, 
  PointElement, 
  LineElement, 
  Legend 
} from "chart.js";
import { Line } from "react-chartjs-2";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

// Fetch and process data for the chart
async function tvlDaily() {
  const response = await fetch(
    "https://squid.subsquid.io/dapps-staking-indexer-shibuya/v/v1/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `
          query MyQuery {
            tvlAggregatedDailies(orderBy: id_ASC) {
              blockNumber
              id
              tvl
            }
          }
        `,
      }),
      next: { revalidate: 10 }
    }
  );
  const { data } = await response.json();
  return data?.tvlAggregatedDailies;
}

function createDataObjectFromTVLData(indexerData) {
  const labels = indexerData.map(entry => new Date(parseInt(entry.id)).toISOString().split('T')[0]);
  const data = labels.map(label => {
    const entry = indexerData.find(e => new Date(parseInt(e.id)).toISOString().split('T')[0] === label);
    const tvlAdjusted = Math.floor(entry.tvl / Math.pow(10, 18)); // Divide by 10^18 and round down
    return tvlAdjusted;
  });

  return {
    labels,
    datasets: [{ label: "TVL", data, backgroundColor: "red" }]
  };
}

// Define chart options
const options = {
  maintainAspectRatio: false,
  responsive: true,
  plugins: {
    legend: { position: "top" as const },
    title: { display: true, text: "Daily Total of Value Locked" }
  },
};

// React component for the chart
const TvlDailyChart = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    tvlDaily().then(indexerData => {
      const chartData = createDataObjectFromTVLData(indexerData);
      setData(chartData);
    });
  }, []);

  if (data === null) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Line options={options} data={data} width={400} height={400} />
    </div>
  );
};

export default TvlDailyChart;
