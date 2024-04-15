import styles from "./SelectLevelPage.module.css";
import { useDispatch, useSelector } from "react-redux";
import { setMode, setLevel } from "../../store/slices";
import { Button } from "../../components/Button/Button";
import classNames from "classnames";
import { Link, useNavigate } from "react-router-dom";

export function SelectLevelPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const level = useSelector(state => state.game.level);
  const easyMode = useSelector(state => state.game.easyMode);

  return (
    <div className={styles.container}>
      <div className={styles.modal}>
        <h1 className={styles.title}>Выбери сложность</h1>
        <form className={styles.levels}>
          <label className={classNames([styles.level, { [styles.levelSelected]: level === 3 }])}>
            <input
              type="radio"
              name="myRadio"
              value="3"
              className={styles.levelInput}
              onChange={() => dispatch(setLevel({ level: 3 }))}
            />
            <span className={styles.levelLink}>1</span>
          </label>
          <label className={classNames([styles.level, { [styles.levelSelected]: level === 6 }])}>
            <input
              type="radio"
              name="myRadio"
              value="6"
              className={styles.levelInput}
              onChange={() => dispatch(setLevel({ level: 6 }))}
            />
            <span className={styles.levelLink}>2</span>
          </label>
          <label className={classNames([styles.level, { [styles.levelSelected]: level === 9 }])}>
            <input
              type="radio"
              name="myRadio"
              value="9"
              className={styles.levelInput}
              onChange={() => dispatch(setLevel({ level: 9 }))}
            />
            <span className={styles.levelLink}>3</span>
          </label>
        </form>
        <div className={styles.mode}>
          <input
            id="selectMode"
            className={styles.input}
            type="checkbox"
            // value={easyMode}
            // onClick={e => dispatch(setMode({ easyMode: e.target.value }))}
            checked={easyMode}
            onChange={() => dispatch(setMode({ easyMode: !easyMode }))}
          />
          <label htmlFor="selectMode" className={styles.heading}>
            Легкий режим(3 жизни)
          </label>
        </div>
        <Button className={styles.buttonStart} onClick={() => navigate("/game")}>
          Играть
        </Button>
        <Link className={styles.leaderboardLink} to="/leaderboard">
          Перейти к лидерборду
        </Link>
      </div>
    </div>
  );
}
