import React from "react";

const SkillSwapLoader = () => {
    return (
        <div style={styles.container}>
            <div style={styles.logo}>
                SkillSwap
            </div>

            <div style={styles.swapBox}>
                <div style={styles.circle}>
                    S
                </div>

                <div style={styles.arrows}>
                    ⇄
                </div>

                <div style={styles.circle}>
                    S
                </div>
            </div>

            <p style={styles.text}>
                Swapping Skills...
            </p>

            <style>
                {`
        @keyframes rotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes pulse {
          0% { transform: scale(1); opacity:0.6 }
          50% { transform: scale(1.1); opacity:1 }
          100% { transform: scale(1); opacity:0.6 }
        }
        `}
            </style>
        </div>
    );
};

const styles = {
    container: {
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: "var(--bg-main, #0A0A0F)",
        color: "white",
        position: "fixed",
        inset: 0,
        zIndex: 99999
    },
    logo: {
        fontSize: "32px",
        fontWeight: "900",
        marginBottom: "40px",
        background: "var(--grad-primary, linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%))",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        letterSpacing: "-1px"
    },
    swapBox: {
        display: "flex",
        alignItems: "center",
        gap: "20px"
    },
    circle: {
        width: "70px",
        height: "70px",
        borderRadius: "50%",
        background: "var(--grad-primary, #2563eb)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontSize: "28px",
        fontWeight: "bold",
        animation: "pulse 1.5s infinite",
        boxShadow: "0 0 20px var(--primary-glow, rgba(139, 92, 246, 0.3))"
    },
    arrows: {
        fontSize: "40px",
        color: "var(--primary, #8B5CF6)",
        animation: "rotate 2s linear infinite"
    },
    text: {
        marginTop: "30px",
        color: "var(--text-dim, #94a3b8)",
        fontWeight: "600",
        textTransform: "uppercase",
        letterSpacing: "1px"
    }
};

export default SkillSwapLoader;
