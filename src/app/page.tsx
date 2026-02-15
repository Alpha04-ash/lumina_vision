"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Eye, Mic, ShieldCheck, Zap, Bot } from "lucide-react";
import { motion, Variants } from "framer-motion";

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15,
            delayChildren: 0.2
        }
    }
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            type: "spring",
            stiffness: 100,
            damping: 20
        }
    }
};

export default function Home() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Return a simple version if not mounted to prevent hydration mismatch
    if (!mounted) {
        return (
            <div className="min-h-screen bg-black text-white" suppressHydrationWarning />
        );
    }

    return (
        <div className="min-h-screen bg-black text-white overflow-hidden relative selection:bg-indigo-500/30" suppressHydrationWarning>

            {/* Background Gradients */}
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 2, ease: "easeOut" }}
                className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none"
            />
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 2, delay: 0.5 }}
                className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-cyan-900/10 rounded-full blur-[120px] pointer-events-none"
            />

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="relative z-10 max-w-6xl mx-auto px-6 py-20 flex flex-col items-center text-center"
            >

                {/* Badge */}
                <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center gap-3 mb-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] md:text-sm font-bold text-indigo-300">
                        <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></span>
                        Grand Prize Contender 2026
                    </div>
                    <div className="px-2 py-0.5 rounded-md bg-indigo-600 text-[10px] font-black text-white uppercase tracking-tighter shadow-[0_0_15px_rgba(79,70,229,0.5)]">
                        v2.0 Update
                    </div>
                </motion.div>

                {/* Hero Text */}
                <motion.h1 variants={itemVariants} className="text-4xl sm:text-5xl md:text-8xl font-bold tracking-tight mb-6 px-4">
                    See the world <br />
                    <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-indigo-500 bg-clip-text text-transparent">through AI eyes.</span>
                </motion.h1>

                <motion.p variants={itemVariants} className="text-base md:text-xl text-zinc-400 max-w-2xl mb-12 leading-relaxed px-6">
                    Lumina is an advanced visual assistant that narrates your surroundings in real-time.
                    Designed for the visually impaired, powered by multimodal AI.
                </motion.p>

                {/* CTAs */}
                <motion.div variants={itemVariants} className="flex flex-col items-center gap-6 mb-12">
                    <Link href="/narrator">
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Button size="lg" className="rounded-full px-12 h-16 text-lg relative overflow-hidden group bg-white text-black hover:bg-zinc-200 transition-shadow hover:shadow-[0_0_40px_rgba(255,255,255,0.3)]">
                                <span className="relative z-10 flex items-center gap-3">
                                    Launch Vision App <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </span>
                            </Button>
                        </motion.div>
                    </Link>
                    <p className="text-zinc-500 text-sm font-medium">Free for all TreeHacks participants</p>
                </motion.div>

                {/* Neural Scroll Indicator */}
                <motion.div
                    variants={itemVariants}
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="flex flex-col items-center gap-2 mb-32 md:mb-64 opacity-40 hover:opacity-100 transition-opacity cursor-default"
                >
                    <div className="w-6 h-10 rounded-full border-2 border-zinc-500 flex justify-center p-1.5">
                        <motion.div
                            animate={{ y: [0, 12, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                            className="w-1 h-2 bg-indigo-500 rounded-full"
                        />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Scroll to Explore</span>
                </motion.div>

                {/* How it Works / Instructions */}
                <motion.div
                    initial={{ opacity: 0, y: 150, scale: 0.9 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 1, type: "spring", stiffness: 50, damping: 20 }}
                    className="w-full max-w-5xl mx-auto mb-32 md:mb-64 px-4"
                >
                    <h2 className="text-3xl font-bold mb-16 text-center">How to use Lumina</h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 text-center">
                        <InstructionStep
                            number="1"
                            title="Start Stream"
                            description="Allow camera access to begin the neural visual link."
                        />
                        <InstructionStep
                            number="2"
                            title="Capture"
                            description="Press the center Camera icon or say 'Describe this' to analyze."
                        />
                        <InstructionStep
                            number="3"
                            title="Listen"
                            description="Lumina will narrate your surroundings with human-like precision."
                        />
                        <InstructionStep
                            number="4"
                            title="Ask"
                            description="Use chat or voice to ask specific questions about the scene."
                        />
                    </div>
                </motion.div>

                {/* Feature Grid */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="w-full mb-20"
                >
                    <h2 className="text-3xl font-bold mb-16 text-center">Engineered for Impact</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
                        <FeatureCard
                            icon={<Eye className="w-6 h-6 text-indigo-400" />}
                            title="Scene Narration"
                            description="Instant, detailed descriptions of your environment using vision AI."
                        />
                        <FeatureCard
                            icon={<Mic className="w-6 h-6 text-cyan-400" />}
                            title="Voice Interaction"
                            description="Hands-free control. Just speak naturally to ask about your surroundings."
                        />
                        <FeatureCard
                            icon={<ShieldCheck className="w-6 h-6 text-emerald-400" />}
                            title="Safety Mode"
                            description="Real-time hazard detection alerts you to obstacles, stairs, and traffic."
                        />
                    </div>
                </motion.div>
            </motion.div>

            {/* Footer */}
            <footer className="w-full py-12 border-t border-white/5 bg-zinc-950/50 text-center text-zinc-600 text-sm relative z-10">
                Built with precision for TreeHacks 2026 • Project Lumina
            </footer>
        </div>
    );
}

function InstructionStep({ number, title, description }: { number: string, title: string, description: string }) {
    return (
        <motion.div
            whileHover={{ y: -10 }}
            className="flex flex-col items-center group cursor-default"
        >
            <div className="h-10 w-10 rounded-full bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 shadow-indigo-500/0 group-hover:shadow-[0_0_20px_rgba(79,70,229,0.4)]">
                {number}
            </div>
            <h3 className="text-lg font-bold mb-3 group-hover:text-white transition-colors">{title}</h3>
            <p className="text-zinc-500 text-sm leading-relaxed group-hover:text-zinc-400 transition-colors">{description}</p>
        </motion.div>
    )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
    return (
        <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            className="p-8 rounded-3xl bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/10 transition-all group backdrop-blur-3xl shadow-2xl"
        >
            <div className="mb-6 p-4 rounded-2xl bg-black/40 border border-white/5 w-fit group-hover:bg-indigo-600 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-xl">
                {icon}
            </div>
            <h3 className="text-xl font-bold mb-3 text-zinc-100 group-hover:text-white transition-colors">{title}</h3>
            <p className="text-zinc-400 leading-relaxed text-sm group-hover:text-zinc-300 transition-colors">{description}</p>
        </motion.div>
    )
}