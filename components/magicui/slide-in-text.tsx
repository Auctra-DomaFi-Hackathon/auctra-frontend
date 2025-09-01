'use client';
import { motion } from "framer-motion";

const SlideInText = ({ text = "Simplicity is the ultimate sophistication.", className = "" }: { text?: string; className?: string }) => {
    return (
        <div className={`text-xl md:text-2xl text-gray-600 leading-relaxed font-medium ${className}`}>
            {text.split('').map((char, i) => (
                <motion.span
                    key={i}
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.01, ease: "easeOut" }}
                    className="inline-block"
                >
                    {char === ' ' ? '\u00A0' : char}
                </motion.span>
            ))}
        </div>
    );
};

export default SlideInText;
