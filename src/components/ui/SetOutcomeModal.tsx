import React, { useEffect, useState } from "react";

interface ModalProps {
    message: string;
    onClose: () => void;
    type: "success" | "error";
}

const SetOutcomeModal: React.FC<ModalProps> = ({ message, onClose, type }) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        setVisible(true);

        const timer = setTimeout(() => {
            setVisible(false);
            setTimeout(() => {
                onClose();
            }, 1000);
        }, 5000);

        return () => clearTimeout(timer);
    }, [onClose]);

    const backgroundColor = type === "error" ? "#f8d7da" : "#d4edda";
    const borderColor = type === "error" ? "#f5c6cb" : "#c3e6cb";
    const textColor = type === "error" ? "#721c24" : "#155724";

    return (
        <div style={modalStyles.container}>
            <div
                style={{
                    ...modalStyles.modal,
                    backgroundColor,
                    borderColor,
                    color: textColor,
                    transform: visible ? "translateY(0)" : "translateY(-100%)",
                    opacity: visible ? 1 : 0,
                    transition: "transform 0.3s ease-in-out, opacity 0.3s ease-in-out",
                }}
            >
                <button
                    type="button"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setVisible(false);
                        setTimeout(() => onClose(), 300);
                    }}
                    style={modalStyles.closeButton}
                    aria-label="Close"
                >
                    ×
                </button>
                <strong>{type === "error" ? "Error" : "Success"}:</strong> {message}
            </div>
        </div>
    );
};

const modalStyles = {
    container: {
        position: "fixed" as "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        display: "flex",
        justifyContent: "center",
        pointerEvents: "none" as React.CSSProperties["pointerEvents"],
    },
    modal: {
        position: "relative" as "relative",
        marginTop: "10px",
        padding: "20px 40px",
        borderRadius: "8px",
        border: "1px solid",
        maxWidth: "800px",
        width: "90%",
        textAlign: "center" as "center",
        fontSize: "18px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
        pointerEvents: "auto" as React.CSSProperties["pointerEvents"],
        backgroundColor: "#fff",
    },
    closeButton: {
        position: "absolute" as "absolute",
        top: "8px",
        right: "12px",
        background: "transparent",
        border: "none",
        fontSize: "20px",
        fontWeight: "bold" as "bold",
        cursor: "pointer",
        color: "#000",
    },
};

export default SetOutcomeModal;
