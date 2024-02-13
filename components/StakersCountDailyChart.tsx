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
async function stakersCountDaily(network: string) {
  const response = await fetch(
    `https://squid.subsquid.io/dapps-staking-indexer-${network}/graphql`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `
          query MyQuery {
            stakersCountAggregatedDailies(orderBy: id_ASC) {
              id
              stakersCount
              blockNumber
            }
          }
        `,
      }),
      next: { revalidate: 10 },
    }
  );
  const { data } = await response.json();
  return data?.stakersCountAggregatedDailies;
}

function createDataObjectFromStakersData(stakersData) {
  const labels = stakersData.map(
    (entry) => new Date(parseInt(entry.id)).toISOString().split("T")[0]
  );
  const data = labels.map(
    (label) =>
      stakersData.find(
        (entry) =>
          new Date(parseInt(entry.id)).toISOString().split("T")[0] === label
      ).stakersCount
  );

  return {
    labels,
    datasets: [{ label: "# of Stakers", data, backgroundColor: "purple" }],
  };
}

// Define chart options
const options = {
  maintainAspectRatio: false,
  responsive: true,
  plugins: {
    legend: { position: "top" as const },
    title: { display: true, text: "Daily Count of Stakers" },
  },
};

// React component for the chart
const StakersCountDailyChart = ({ network }: { network: string }) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    stakersCountDaily(network).then((stakersData) => {
      const chartData = createDataObjectFromStakersData(stakersData);
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

export default StakersCountDailyChart;
