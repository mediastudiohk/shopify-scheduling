import { styles } from "../../styles"

export const LoadingDot = () => {
  return (
    <div style={styles.loadingContainerIndicator}>
      <div className="sk-chase">
        <div className="sk-chase-dot" style={styles.dotStyleGrey}>●</div>
        <div className="sk-chase-dot" style={styles.dotStyleGrey}>●</div>
        <div className="sk-chase-dot" style={styles.dotStyleGrey}>●</div>
        <div className="sk-chase-dot" style={styles.dotStyleGrey}>●</div>
        <div className="sk-chase-dot" style={styles.dotStyleGrey}>●</div>
        <div className="sk-chase-dot" style={styles.dotStyleGrey}>●</div>
      </div>
    </div>

  )
}