import React, { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  PointElement,
  LineElement,
  Legend,
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
  Legend
);

// Fetch and process data for the chart
async function tvlDaily(network: string) {
  const response = await fetch(
    `https://squid.subsquid.io/dapps-staking-indexer-${network}/graphql`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `
          query MyQuery {
            tvlAggregatedDailies(orderBy: id_ASC) {
              id
              tvl
            }
            stakersCountAggregatedDailies(orderBy: id_ASC, where: {stakersAmount_not_eq: "0"}) {
              id
              tvs: stakersAmount
            }
          }
        `,
      }),
      next: { revalidate: 10 },
    }
  );
  const { data } = await response.json();

  const mergedData = data.tvlAggregatedDailies.map((tvlEntry) => {
    const matchingStakersEntry = data.stakersCountAggregatedDailies.find(
      (stakersEntry) => stakersEntry.id === tvlEntry.id
    );
    return {
      id: tvlEntry.id,
      tvl: tvlEntry.tvl,
      tvs: matchingStakersEntry ? matchingStakersEntry.tvs : null,
    };
  });

  return mergedData;
}

function createDataObjectFromTVLData(indexerData) {
  const labels = indexerData.map(
    (entry) => new Date(parseInt(entry.id)).toISOString().split("T")[0]
  );

  const tvlData = [];
  const tvsData = [];

  // Populate tvlData and tvsData
  indexerData.forEach((entry) => {
    const tvlAdjusted = Math.floor(entry.tvl / Math.pow(10, 18)); // Adjust TVL
    tvlData.push(tvlAdjusted);

    const tvsAdjusted = Math.floor(entry.tvs / Math.pow(10, 18)); // Adjust TVS
    tvsData.push(tvsAdjusted);
  });

  return {
    labels,
    datasets: [
      { label: "TVL", data: tvlData, backgroundColor: "red" },
      { label: "TVS", data: tvsData, backgroundColor: "blue" },
    ],
  };
}

// Define chart options
const options = {
  maintainAspectRatio: false,
  responsive: true,
  plugins: {
    legend: { position: "top" as const },
    title: { display: true, text: "Daily Total of Value Locked & Staked" },
  },
};

// React component for the chart
const TvlDailyChart = ({ network }: { network: string }) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    tvlDaily(network).then((indexerData) => {
      const chartData = createDataObjectFromTVLData(indexerData);
      setData(chartData);
    });
  }, [network]);

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
