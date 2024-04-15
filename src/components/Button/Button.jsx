import styles from "./Button.module.css";

export function Button({ children, onClick }) {
  return (
    <button onClick={onClick} className={styles.button}>
      {children}
    </button>
  );
}
