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
            stakersCountAggregatedDailies(
                orderBy: id_ASC,
                where: {stakersCount_not_eq: 0}
              ) {
              id
              stakersCount
            }
            tvlAggregatedDailies(orderBy: id_ASC) {
              id
              lockersCount
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
      lockersCount: tvlEntry.lockersCount,
      stakersCount: matchingStakersEntry
        ? matchingStakersEntry.stakersCount
        : null,
    };
  });

  return mergedData;
}

function createDataObjectFromStakersData(stakersData) {
  const labels = stakersData.map(
    (entry) => new Date(parseInt(entry.id)).toISOString().split("T")[0]
  );

  // Create arrays for stakers and lockers count
  const stakersCountData = [];
  const lockersCountData = [];

  stakersData.forEach((entry) => {
    // Assuming the entry includes both stakersCount and lockersCount
    stakersCountData.push(entry.stakersCount); // Add stakers count directly
    lockersCountData.push(entry.lockersCount); // Add lockers count directly
  });

  return {
    labels,
    datasets: [
      {
        label: "# of Stakers",
        data: stakersCountData,
        backgroundColor: "purple",
      },
      {
        label: "# of Lockers",
        data: lockersCountData,
        backgroundColor: "green",
      },
    ],
  };
}

// Define chart options
const options = {
  maintainAspectRatio: false,
  responsive: true,
  plugins: {
    legend: { position: "top" as const },
    title: { display: true, text: "Daily Count of Stakers & Lockers" },
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
