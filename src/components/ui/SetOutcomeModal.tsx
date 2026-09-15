"use client";

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

    const tone =
        type === "error"
            ? "bg-[#f8d7da] border-[#f5c6cb] text-[#721c24]"
            : "bg-[#d4edda] border-[#c3e6cb] text-[#155724]";

    return (
        <div className="fixed top-0 left-0 right-0 z-[9999] flex justify-center pointer-events-none">
            <div
                className={`relative mt-2.5 py-5 px-10 rounded-lg border max-w-[800px] w-[90%] text-center text-[18px] pointer-events-auto [box-shadow:0_4px_12px_rgba(0,0,0,0.15)] [transition:transform_0.3s_ease-in-out,opacity_0.3s_ease-in-out] ${tone} ${
                    visible ? "opacity-100 [transform:translateY(0)]" : "opacity-0 [transform:translateY(-100%)]"
                }`}
            >
                <button
                    type="button"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setVisible(false);
                        setTimeout(() => onClose(), 300);
                    }}
                    className="absolute top-2 right-3 bg-transparent border-none text-[20px] font-bold cursor-pointer text-black"
                    aria-label="Close"
                >
                    ×
                </button>
                <strong>{type === "error" ? "Error" : "Success"}:</strong> {message}
            </div>
        </div>
    );
};

export default SetOutcomeModal;
