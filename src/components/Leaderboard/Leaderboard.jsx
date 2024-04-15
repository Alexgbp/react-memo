import { useEffect, useState } from "react";
import styles from "./Leaderboard.module.css";
import { getAllLeaders } from "../../api";

function secondsToTimeString(seconds) {
  return (
    Math.floor(Math.round(seconds) / 60)
      .toString()
      .padStart(2, "0") +
    ":" +
    (Math.round(seconds) % 60).toString().padStart(2, "0")
  );
}

export function Leaderboard() {
  const [leaders, setLeaders] = useState([]);

  const loadLeaderboardData = () => {
    getAllLeaders()
      .then(data => {
        setLeaders(data.leaders);
      })
      .catch(error => {
        console.error(error);
      });
  };

  useEffect(() => {
    loadLeaderboardData();
  }, []);

  return (
    <div className={styles.leaderboardContainer}>
      <div className={`${styles.leaderboard} ${styles.leaderboardTitle}`}>
        <p className={styles.item}>Позиция</p>
        <p className={styles.item_user}>Пользователь</p>
        <p className={styles.item}>Достижения</p>
        <p className={styles.item}>Время</p>
      </div>
      <>
        {leaders
          .slice()
          .sort((a, b) => a.time - b.time)
          .map((leader, index) => {
            const position = index + 1;
            return (
              <div className={styles.leaderboard} key={index}>
                <p className={styles.item}>{`# ${position}`}</p>
                <p className={styles.item_user}>{leader.name}</p>
                <div className={styles.achievements__block}>
                  {leader.achievements && leader.achievements.includes(1) ? (
                    <div className={`${styles.achivka_block} ${styles.achivkaNoEasyMode}`}></div>
                  ) : (
                    <div className={`${styles.achivka_block} ${styles.achivkaYesEasyMode}`}></div>
                  )}
                  {leader.achievements && leader.achievements.includes(2) ? (
                    <div className={`${styles.achivka_block} ${styles.achivkaNoSuperPower}`}></div>
                  ) : (
                    <div className={`${styles.achivka_block} ${styles.achivkaYesSuperPower}`}></div>
                  )}
                  <div className={styles.achivka_block}></div>
                </div>

                <p className={styles.item}>{secondsToTimeString(leader.time)}</p>
              </div>
            );
          })}
      </>
    </div>
  );
}
