import { useState } from "react";
import type { NextPage } from "next";
import Head from "next/head";
import styles from "../styles/Home.module.css";
import StakersCountDailyChart from "../components/StakersCountDailyChart";
import TvlDailyChart from "../components/TvlDailyChart";
import DappsChart from "../components/DappsChart";
import StakersListChart from "../components/StakersListChart";

const Home: NextPage = () => {
  const [selectedNetwork, setSelectedNetwork] = useState("shibuya");

  const handleNetworkChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedNetwork(event.target.value);
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <meta
          name="description"
          content="How to access Astar's Indexer and API"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <div className={styles.networkSelector}>
          <label htmlFor="network">Select Network:</label>
          <select
            id="network"
            value={selectedNetwork}
            onChange={handleNetworkChange}
          >
            <option value="shibuya">Shibuya</option>
            <option value="shiden">Shiden</option>
            <option value="astar">Astar</option>
          </select>
        </div>
        <div className={styles.chartContainer}>
          <div className={styles.chartBox}>
            <StakersCountDailyChart network={selectedNetwork} />
          </div>
          <div className={styles.chartBox}>
            <TvlDailyChart network={selectedNetwork} />
          </div>
          <div className={styles.chartBox}>
            <DappsChart network={selectedNetwork} />
          </div>
          <div className={styles.chartBox}>
            <StakersListChart network={selectedNetwork} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
