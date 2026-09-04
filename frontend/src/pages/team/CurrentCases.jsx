import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../../components/Navbar";
import TeamSidebar from "../../components/TeamSidebar";

import { getTeamCurrentCases } from "../../api/team.api";


const getStatusLabel = (status) => {
    if (!status || status === "solution_needed") {
        return "SOLUTION NEEDED";
    }

    if (status === "pending_review") {
        return "UNDER REVIEW";
    }

    if (status === "changes_requested") {
        return "CHANGES REQUESTED";
    }

    return status.replace(/_/g, " ").toUpperCase();
};


const CurrentCases = () => {
    const navigate = useNavigate();

    const [cases, setCases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");


    useEffect(() => {
        const loadCases = async () => {
            try {
                setLoading(true);

                const response =
                    await getTeamCurrentCases();

                setCases(response?.data || []);

            } catch (err) {
                console.error(
                    "Current cases error:",
                    err
                );

                setError(
                    err?.response?.data?.message ||
                    "Failed to load current cases."
                );
            } finally {
                setLoading(false);
            }
        };

        loadCases();
    }, []);


    return (
        <div className="min-h-screen bg-[#f7faf8]">

            <Navbar />

            <div className="flex">

                <TeamSidebar />

                <main className="flex-1 min-w-0">

                    <div className="max-w-7xl mx-auto px-6 py-10">

                        {/* HEADER */}

                        <section className="mb-8">

                            <p className="text-[#087542] text-[9px] font-extrabold tracking-[0.16em]">
                                TEAM OPERATIONS
                            </p>

                            <h1 className="mt-2 text-[#17211b] text-3xl font-extrabold">
                                Current Cases
                            </h1>

                            <p className="mt-2 text-[#718078] text-sm">
                                Safety problems currently assigned to your team.
                            </p>

                        </section>


                        {/* ERROR */}

                        {error && (
                            <div className="mb-6 p-4 rounded-[6px] border border-red-200 bg-red-50 text-red-700 text-sm">
                                {error}
                            </div>
                        )}


                        {/* LOADING */}

                        {loading ? (

                            <div className="p-12 bg-white border border-[#d9e2dc] rounded-[6px] text-center">
                                <p className="text-[#718078] text-sm">
                                    Loading current cases...
                                </p>
                            </div>

                        ) : cases.length === 0 ? (

                            <div className="p-14 bg-white border border-[#d9e2dc] rounded-[6px] text-center">

                                <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-[#eaf4ee] text-[#087542] text-xl">
                                    ✓
                                </div>

                                <h2 className="mt-4 text-[#17211b] text-lg font-extrabold">
                                    No Current Cases
                                </h2>

                                <p className="mt-2 text-[#718078] text-sm">
                                    Your team has no unresolved cases assigned right now.
                                </p>

                            </div>

                        ) : (

                            <div className="space-y-4">

                                {cases.map((item) => (

                                    <button
                                        key={item.report_id}
                                        type="button"
                                        onClick={() =>
                                            navigate(
                                                `/team/cases/${item.report_id}`
                                            )
                                        }
                                        className="
                                            w-full
                                            text-left

                                            p-6

                                            bg-white

                                            border
                                            border-[#d9e2dc]

                                            rounded-[6px]

                                            shadow-[0_8px_25px_rgba(20,50,35,0.04)]

                                            hover:shadow-[0_10px_30px_rgba(20,50,35,0.08)]

                                            hover:border-[#b9c9be]

                                            transition
                                        "
                                    >

                                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

                                            {/* CASE INFO */}

                                            <div className="min-w-0">

                                                <div className="flex flex-wrap items-center gap-3">

                                                    <span className="text-[#087542] text-xs font-extrabold">
                                                        {item.report_id}
                                                    </span>

                                                    {item.report_type && (
                                                        <span className="px-2 py-1 rounded-full bg-[#edf2ee] text-[#66736b] text-[9px] font-bold">
                                                            {item.report_type}
                                                        </span>
                                                    )}

                                                    {item.sif_level && (
                                                        <span className="px-2 py-1 rounded-full bg-[#fff4df] text-[#9a6700] text-[9px] font-extrabold">
                                                            SIF {item.sif_level}
                                                        </span>
                                                    )}

                                                </div>


                                                <h2 className="mt-3 text-[#17211b] text-base font-extrabold">
                                                    {item.hazard ||
                                                        item.activity ||
                                                        "Safety Problem"}
                                                </h2>


                                                <p className="mt-2 text-[#66736b] text-sm line-clamp-2">
                                                    {item.report_text ||
                                                        item.unsafe_act_condition ||
                                                        "No description available."}
                                                </p>


                                                <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[11px] text-[#8a958e]">

                                                    <span>
                                                        Site:{" "}
                                                        <strong className="text-[#53635a]">
                                                            {item.site || "Not specified"}
                                                        </strong>
                                                    </span>

                                                    <span>
                                                        Location:{" "}
                                                        <strong className="text-[#53635a]">
                                                            {item.location || "Not specified"}
                                                        </strong>
                                                    </span>

                                                    <span>
                                                        Activity:{" "}
                                                        <strong className="text-[#53635a]">
                                                            {item.activity || "Not specified"}
                                                        </strong>
                                                    </span>

                                                </div>

                                            </div>


                                            {/* STATUS */}

                                            <div className="shrink-0 lg:text-right">

                                                <span className="inline-block px-3 py-1.5 rounded-full bg-[#fff7e6] text-[#9a6700] text-[9px] font-extrabold tracking-wide">
                                                    {getStatusLabel(
                                                        item.solution_status
                                                    )}
                                                </span>


                                                <p className="mt-3 text-[#087542] text-xs font-bold">
                                                    Open Case →
                                                </p>

                                            </div>

                                        </div>

                                    </button>

                                ))}

                            </div>

                        )}

                    </div>

                </main>

            </div>

        </div>
    );
};


export default CurrentCases;