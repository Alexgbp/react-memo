import styles from "./Button.module.css";

export function Button({ children, onClick, disabled }) {
  return (
    <button onClick={onClick} className={styles.button} disabled={disabled}>
      {children}
    </button>
  );
}
