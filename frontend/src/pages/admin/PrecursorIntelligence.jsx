import { useEffect, useState } from "react";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import AdminSidebar from "../../components/AdminSidebar";

import EmergingRisks from "./components/EmergingRisks";
import RiskMap from "./components/RiskMap";
import RiskTrends from "./components/RiskTrends";
import RiskScore from "./components/RiskScore";

const API_BASE_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const TABS = [
    { id: "risks", label: "Emerging Risks", icon: "▦" },
    { id: "map", label: "Risk Map", icon: "⌗" },
    { id: "trends", label: "Trends", icon: "↗" },
    { id: "score", label: "Risk Score", icon: "◎" },
];

function PrecursorIntelligence() {
    const [activeTab, setActiveTab] = useState("risks");
    const [clusters, setClusters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadClusters = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(`${API_BASE_URL}/ml/clusters`);
            const payload = await response.json();

            if (!response.ok || !payload?.success) {
                throw new Error(
                    payload?.message ||
                        "Failed to load precursor intelligence."
                );
            }

            setClusters(payload?.data || []);
        } catch (err) {
            console.error("Precursor intelligence loading error:", err);
            setError(
                err?.message ||
                    "Unable to load precursor intelligence."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadClusters();
    }, []);

    const renderContent = () => {
        if (activeTab === "risks") {
            if (loading) {
                return (
                    <div className="p-12 rounded-[6px] border border-[#dce5df] bg-white text-center text-[#718078] text-sm">
                        Loading safety intelligence…
                    </div>
                );
            }

            if (error) {
                return (
                    <div className="p-8 rounded-[6px] border border-[#f0d4d4] bg-[#fff8f8]">
                        <div className="text-[#c62828] text-[12px] font-bold">
                            Unable to load safety intelligence
                        </div>
                        <p className="mt-2 text-[#8a5f5f] text-[11px]">
                            {error}
                        </p>
                        <button
                            type="button"
                            onClick={loadClusters}
                            className="mt-4 px-4 py-2 rounded-[3px] bg-[#087542] text-white text-[11px] font-extrabold cursor-pointer"
                        >
                            Retry
                        </button>
                    </div>
                );
            }

            return (
                <EmergingRisks
                    clusters={clusters}
                    onRefresh={loadClusters}
                />
            );
        }

        if (activeTab === "map") {
            return <RiskMap clusters={clusters} />;
        }

        if (activeTab === "trends") {
            return <RiskTrends clusters={clusters} />;
        }

        return <RiskScore clusters={clusters} />;
    };

    return (
        <div className="min-h-screen flex flex-col bg-[#f5f8f6] text-[#17211b]">
            <Navbar />

            <div className="flex items-start flex-1">
                <AdminSidebar />

                <main className="min-w-0 flex-1 px-[5%] py-10 lg:px-[4%] lg:py-[55px]">
                    <section className="mb-9">
                        <p className="mb-3 text-[#087542] text-[10px] font-extrabold tracking-[0.2em]">
                            AI SAFETY INTELLIGENCE
                        </p>

                        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                            <div>
                                <h1 className="text-[clamp(38px,5vw,62px)] leading-none font-extrabold tracking-[-0.055em]">
                                    Precursor Intelligence
                                </h1>

                                <p className="max-w-[760px] mt-5 text-[#718078] text-[14px] leading-[1.75]">
                                    Explore recurring safety patterns, where they
                                    occur, how they are changing, and how the
                                    system prioritises them.
                                </p>
                            </div>

                            <div className="px-4 py-3 rounded-[5px] border border-[#d9e2dc] bg-white shrink-0">
                                <div className="text-[#718078] text-[8px] font-extrabold tracking-[0.13em]">
                                    INTELLIGENCE WORKSPACE
                                </div>
                                <div className="mt-1 text-[#17211b] text-[11px] font-bold">
                                    {clusters.length} active risk patterns
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="mb-8">
                        <div className="flex items-end gap-1 overflow-x-auto border-b border-[#cfdad3]">
                            {TABS.map((tab) => {
                                const active = activeTab === tab.id;

                                return (
                                    <button
                                        key={tab.id}
                                        type="button"
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`relative shrink-0 flex items-center gap-2 px-5 py-3.5 rounded-t-[7px] border border-b-0 text-[11px] cursor-pointer transition ${
                                            active
                                                ? "bg-[#087542] border-[#087542] text-white font-extrabold shadow-[0_-2px_10px_rgba(8,117,66,0.08)]"
                                                : "bg-white border-[#d9e2dc] text-[#087542] font-bold hover:bg-[#edf6f0]"
                                        }`}
                                    >
                                        <span className="text-[13px] font-extrabold">
                                            {tab.icon}
                                        </span>
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </div>
                    </section>

                    <section>{renderContent()}</section>
                </main>
            </div>

            <Footer />
        </div>
    );
}

export default PrecursorIntelligence;
