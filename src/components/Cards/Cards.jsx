import { shuffle } from "lodash";
import { useEffect, useState } from "react";
import { generateDeck } from "../../utils/cards";
import styles from "./Cards.module.css";
import { EndGameModal } from "../../components/EndGameModal/EndGameModal";
import { Button } from "../../components/Button/Button";
import { Card } from "../../components/Card/Card";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { miss, clearStore, setProzrenie, setAlohomora, restart, setAlohomoraPause } from "../../store/slices";

// Игра закончилась
const STATUS_LOST = "STATUS_LOST";
const STATUS_WON = "STATUS_WON";
// Идет игра: карты закрыты, игрок может их открыть
const STATUS_IN_PROGRESS = "STATUS_IN_PROGRESS";
// Начало игры: игрок видит все карты в течении нескольких секунд
const STATUS_PREVIEW = "STATUS_PREVIEW";

function getTimerValue(startDate, endDate) {
  if (!startDate && !endDate) {
    return {
      minutes: 0,
      seconds: 0,
    };
  }

  if (endDate === null) {
    endDate = new Date();
  }

  const diffInSecconds = Math.floor((endDate.getTime() - startDate.getTime()) / 1000);
  const minutes = Math.floor(diffInSecconds / 60);
  const seconds = diffInSecconds % 60;
  return {
    minutes,
    seconds,
  };
}

/**
 * Основной компонент игры, внутри него находится вся игровая механика и логика.
 * pairsCount - сколько пар будет в игре
 * previewSeconds - сколько секунд пользователь будет видеть все карты открытыми до начала игры
 */
export function Cards({ previewSeconds = 5 }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const pairsCount = useSelector(state => state.game.level);
  const lives = useSelector(state => state.game.lives);
  const losed = useSelector(state => state.game.losed);
  const prozrenie = useSelector(state => state.game.hintProzrenie);
  const alohomora = useSelector(state => state.game.hintAlohomora);

  // В cards лежит игровое поле - массив карт и их состояние открыта\закрыта
  const [ind, setInd] = useState(0);
  const [cards, setCards] = useState([]);
  const [cardIds, setCardIds] = useState([]);

  // Текущий статус игры
  const [status, setStatus] = useState(STATUS_PREVIEW);

  // Дата начала игры
  const [gameStartDate, setGameStartDate] = useState(null);
  // Дата конца игры
  const [gameEndDate, setGameEndDate] = useState(null);

  const [timerIntervalId, setTimerIntervalId] = useState();

  // Стейт для таймера, высчитывается в setInteval на основе gameStartDate и gameEndDate
  const [timer, setTimer] = useState({
    seconds: 0,
    minutes: 0,
  });

  function finishGame(status = STATUS_LOST) {
    setGameEndDate(new Date());
    setStatus(status);
  }
  function startGame() {
    const startDate = new Date();
    setGameEndDate(null);
    setGameStartDate(startDate);
    setTimer(getTimerValue(startDate, null));
    setStatus(STATUS_IN_PROGRESS);
    dispatch(setAlohomora(false));
    dispatch(setProzrenie(false));
  }
  function resetGame() {
    setGameStartDate(null);
    setGameEndDate(null);
    setTimer(getTimerValue(null, null));
    setStatus(STATUS_PREVIEW);
    setCards([]);
    setCardIds([]);
    setInd(0);
  }

  /**
   * Обработка основного действия в игре - открытие карты.
   * После открытия карты игра может пепереходит в следующие состояния
   * - "Игрок выиграл", если на поле открыты все карты
   * - "Игрок проиграл", если на поле есть две открытые карты без пары
   * - "Игра продолжается", если не случилось первых двух условий
   */
  const openCard = clickedCard => {
    if (ind > 1) return;
    setInd(ind + 1);
    if (cardIds.length > 1) return;
    // Если карта уже открыта, то ничего не делаем
    if (clickedCard.open) {
      return;
    }
    setCardIds([...cardIds, clickedCard.id]);

    // Игровое поле после открытия кликнутой карты
    const nextCards = cards.map(card => {
      if (card.id !== clickedCard.id) {
        return card;
      }

      return {
        ...card,
        open: true,
      };
    });

    setCards(nextCards);

    const isPlayerWon = nextCards.every(card => card.open);

    // Победа - все карты на поле открыты
    if (isPlayerWon) {
      finishGame(STATUS_WON);
      setCards([]);
      setCardIds([]);
      setInd(0);
      return;
    }

    // Открытые карты на игровом поле
    const openCards = nextCards.filter(card => card.open);

    // Ищем открытые карты, у которых нет пары среди других открытых
    const openCardsWithoutPair = openCards.filter(card => {
      const sameCards = openCards.filter(openCard => card.suit === openCard.suit && card.rank === openCard.rank);

      if (sameCards.length < 2) {
        if (openCards.length % 2 === 0) {
          // setCardIds([]);
        }
        return true;
      }
      return false;
    });

    const playerLost = openCardsWithoutPair.length >= 2;
    // "Игрок проиграл", т.к на поле есть две открытые карты без пары
    if (!playerLost && openCardsWithoutPair.length % 2 === 0) {
      setCardIds([]);
      setInd(0);
    }

    if (playerLost) {
      dispatch(miss());

      const crds = cards.map(card => {
        if (cardIds.includes(card.id)) {
          return {
            ...card,
            open: false,
          };
        }

        return card;
      });

      setTimeout(() => {
        setCards(crds);
        setInd(0);
        setCardIds([]);
      }, 1000);
    }

    // ... игра продолжается
  };

  const isGameEnded = status === STATUS_LOST || status === STATUS_WON;

  useEffect(() => {
    if (losed) finishGame(STATUS_LOST);
  }, [losed]);

  // Игровой цикл
  useEffect(() => {
    // В статусах кроме превью доп логики не требуется
    if (status !== STATUS_PREVIEW) {
      return;
    }

    // В статусе превью мы
    if (pairsCount > 36) {
      alert("Столько пар сделать невозможно");
      return;
    }

    setCards(() => {
      return shuffle(generateDeck(pairsCount, 10));
    });

    const timerId = setTimeout(() => {
      startGame();
    }, previewSeconds * 1000);

    return () => {
      clearTimeout(timerId);
    };
  }, [status, pairsCount, previewSeconds]);

  // Обновляем значение таймера в интервале
  useEffect(() => {
    const intervalId = setInterval(() => {
      setTimer(getTimerValue(gameStartDate, gameEndDate));
    }, 300);
    setTimerIntervalId(intervalId);
    return () => {
      clearInterval(intervalId);
    };
  }, [gameStartDate, gameEndDate]);

  useEffect(() => {
    dispatch(restart());
  }, [dispatch]);

  const livesBlock = [];

  for (let i = 0; i < lives; i++) {
    livesBlock.push(<span key={i} className={styles.heart}></span>);
  }

  function handleProzrenie() {
    clearInterval(timerIntervalId);
    dispatch(setProzrenie(true));
    const alhomoraState = alohomora;
    dispatch(setAlohomoraPause({ state: true }));
    const temptCards = [...cards];
    const flippedCards = temptCards.map(card => {
      return {
        ...card,
        open: true,
      };
    });
    setCards(flippedCards);
    setTimeout(() => {
      setCards(temptCards);
      dispatch(setAlohomoraPause({ state: alhomoraState }));
      setGameStartDate(new Date(gameStartDate.getTime() + 5000));
    }, 5000);
  }

  function handleAlohomora() {
    dispatch(setAlohomora(true));
    const firstCard = cards.find(card => card.open === false);
    const newCards = cards.map(card => {
      return card.suit === firstCard.suit && card.rank === firstCard.rank ? { ...card, open: true } : card;
    });
    const isGameOver = newCards.some(item => !item.open);
    setCards(newCards);
    if (!isGameOver) {
      finishGame(STATUS_WON);
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.timer}>
          {status === STATUS_PREVIEW ? (
            <div>
              <p className={styles.previewText}>Запоминайте пары!</p>
              <p className={styles.previewDescription}>Игра начнется через {previewSeconds} секунд</p>
            </div>
          ) : (
            <>
              <div className={styles.timerValue}>
                <div className={styles.timerDescription}>min</div>
                <div>{timer.minutes.toString().padStart("2", "0")}</div>
              </div>
              .
              <div className={styles.timerValue}>
                <div className={styles.timerDescription}>sec</div>
                <div>{timer.seconds.toString().padStart("2", "0")}</div>
              </div>
            </>
          )}
        </div>
        {status === STATUS_IN_PROGRESS ? (
          <div className={styles.powers}>
            <div className={styles.blockProzrenie}>
              <button className={styles.prozrenie} onClick={handleProzrenie} disabled={prozrenie}></button>
              <div className={styles.popup}>
                <span className={styles.popup_heading}>Прозрение</span>
                <span className={styles.popup_info}>
                  На 5 секунд показываются все карты. Таймер длительности игры на это время останавливается.
                </span>
              </div>
            </div>
            <div className={styles.blockAlohomora}>
              <button className={styles.alohomora} onClick={handleAlohomora} disabled={alohomora}></button>
              <div className={styles.popup}>
                <span className={styles.popup_heading}>Алохомора</span>
                <span className={styles.popup_info}>Открывается случайная пара карт.</span>
              </div>
            </div>
          </div>
        ) : null}
        {status === STATUS_IN_PROGRESS ? (
          <Button
            onClick={() => {
              dispatch(restart());
              resetGame();
            }}
          >
            Начать заново
          </Button>
        ) : null}
      </div>

      <div className={styles.cards}>
        {cards.map(card => (
          <Card
            key={card.id}
            onClick={() => openCard(card)}
            open={status !== STATUS_IN_PROGRESS ? true : card.open}
            suit={card.suit}
            rank={card.rank}
          />
        ))}
      </div>

      {isGameEnded ? (
        <div className={styles.modalContainer}>
          <EndGameModal
            isWon={status === STATUS_WON}
            gameDurationSeconds={timer.seconds}
            gameDurationMinutes={timer.minutes}
            onClick={resetGame}
          />
        </div>
      ) : null}
      <div className={styles.livesContainer}>
        <div>
          <span>Жизни: </span>
          <div className={styles.lives}>{livesBlock}</div>
        </div>
        <Button
          onClick={() => {
            dispatch(clearStore());
            navigate("/");
          }}
        >
          Выйти
        </Button>
      </div>
    </div>
  );
}
