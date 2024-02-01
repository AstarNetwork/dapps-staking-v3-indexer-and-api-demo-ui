import type { NextPage } from "next";
import Head from "next/head";
import styles from "../styles/Home.module.css";
import StakersCountDailyChart from "../components/StakersCountDailyChart";
import TvlDailyChart from "../components/TvlDailyChart";
import DappsChart from "../components/DappsChart";
import StakersListChart from "../components/StakersListChart";

const Home: NextPage = () => {
  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="How to acces Astar's Indexer and API" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <div className={styles.chartContainer}>
          <div className={styles.chartBox}>
            <StakersCountDailyChart />
          </div>
          <div className={styles.chartBox}>
            <TvlDailyChart />
          </div>
          <div className={styles.chartBox}>
            <DappsChart />
          </div>
          <div className={styles.chartBox}>
            <StakersListChart />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
