import styles from "./EndGameModal.module.css";

import { Button } from "../Button/Button";
import deadImageUrl from "./images/dead.png";
import celebrationImageUrl from "./images/celebration.png";
import { restart } from "../../store/slices";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { postLeader } from "../../api";

const getSafeString = str =>
  str.trim().replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");

export function EndGameModal({ isWon, gameDurationSeconds, gameDurationMinutes, onClick }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const pairsCount = useSelector(state => state.game.level);
  const prozrenie = useSelector(state => state.game.hintProzrenie);
  const alohomora = useSelector(state => state.game.hintAlohomora);
  const easyMode = useSelector(state => state.game.easyMode);
  const isLeader = pairsCount === 9 && isWon;

  const title = isWon ? (isLeader ? "Вы попали на Лидерборд!" : "Вы победили!") : "Вы проиграли!";
  const imgSrc = isWon ? celebrationImageUrl : deadImageUrl;
  const imgAlt = isWon ? "celebration emodji" : "dead emodji";

  const [leaderName, setLeaderName] = useState("");

  const addLeader = () => {
    let achi = [];
    if (!prozrenie && !alohomora) {
      achi.push(2);
    }
    if (!easyMode) {
      achi.push(1);
    }
    postLeader({
      name: getSafeString(leaderName),
      time: gameDurationMinutes * 60 + gameDurationSeconds,
      achievements: achi,
    });
  };

  return (
    <div className={styles.modal}>
      <img className={styles.image} src={imgSrc} alt={imgAlt} />
      <h2 className={styles.title}>{title}</h2>

      {isLeader && (
        <>
          <input
            className={styles.inputName}
            placeholder="Пользователь"
            value={leaderName}
            onChange={e => setLeaderName(e.target.value)}
          ></input>
          <Button
            onClick={() => {
              addLeader();
              navigate("/");
              dispatch(restart());
            }}
          >
            Добавить
          </Button>
        </>
      )}

      <p className={styles.description}>Затраченное время:</p>
      <div className={styles.time}>
        {gameDurationMinutes.toString().padStart("2", "0")}.{gameDurationSeconds.toString().padStart("2", "0")}
      </div>
      <Button
        onClick={() => {
          onClick();
          dispatch(restart());
        }}
      >
        Начать сначала
      </Button>
      <Link
        className={styles.leaderboardLink}
        to="/leaderboard"
        onClick={() => {
          onClick();
          dispatch(restart());
        }}
      >
        Перейти к лидерборду
      </Link>
    </div>
  );
}
