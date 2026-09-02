import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import AdminSidebar from "../../components/AdminSidebar";

import { getAdminOverview } from "../../api/admin.api";


function Admin() {
    const [overview, setOverview] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const navigate = useNavigate();


    useEffect(() => {
        const loadAdminOverview =
            async () => {
                try {
                    setLoading(true);
                    setError("");

                    const response =
                        await getAdminOverview();

                    setOverview(
                        response?.data || {}
                    );
                } catch (err) {
                    console.error(
                        "Admin overview error:",
                        err
                    );

                    setError(
                        err?.response?.data?.message ||
                        "Unable to load admin dashboard."
                    );
                } finally {
                    setLoading(false);
                }
            };

        loadAdminOverview();
    }, []);


    /* =========================================================
       LOADING
    ========================================================= */

    if (loading) {
        return (
            <div
                className="
                    min-h-screen

                    flex
                    flex-col
                    items-center
                    justify-center

                    bg-[#f5f8f6]
                "
            >
                <div
                    className="
                        w-10
                        h-10

                        rounded-full

                        border-4
                        border-[#dce8e0]
                        border-t-[#087542]

                        animate-spin
                    "
                />

                <p
                    className="
                        mt-5

                        text-[#718078]

                        text-[13px]
                    "
                >
                    Loading admin control center...
                </p>
            </div>
        );
    }


    /* =========================================================
       ERROR
    ========================================================= */

    if (error) {
        return (
            <div
                className="
                    min-h-screen

                    flex
                    flex-col
                    items-center
                    justify-center

                    px-6

                    bg-[#f5f8f6]

                    text-center
                "
            >
                <div
                    className="
                        w-12
                        h-12

                        flex
                        items-center
                        justify-center

                        rounded-full

                        bg-[#fff0f0]

                        text-[#c62828]

                        text-[20px]
                        font-extrabold
                    "
                >
                    !
                </div>

                <h1
                    className="
                        mt-5

                        text-[#17211b]

                        text-[24px]
                        font-extrabold
                    "
                >
                    Admin dashboard unavailable
                </h1>

                <p
                    className="
                        max-w-[420px]

                        mt-2

                        text-[#718078]

                        text-[13px]
                        leading-[1.6]
                    "
                >
                    {error}
                </p>

                <button
                    type="button"
                    onClick={() =>
                        window.location.reload()
                    }
                    className="
                        mt-6

                        px-6
                        py-3

                        rounded-[3px]

                        border-0

                        bg-[#087542]

                        text-white

                        text-[11px]
                        font-extrabold

                        cursor-pointer

                        transition

                        hover:bg-[#065c38]
                    "
                >
                    Try Again
                </button>
            </div>
        );
    }


    /* =========================================================
       DERIVED DATA
    ========================================================= */

    const reports =
        overview?.reports || {};

    const cases =
        overview?.cases || {};

    const proposals =
        overview?.proposals || {};

    const solutions =
        overview?.solutions || {};


    const reviewQueue =
        (reports.pending_review || 0) +
        (proposals.pending || 0) +
        (solutions.pending_review || 0);


    /* =========================================================
       RENDER
    ========================================================= */

    return (
        <div
            className="
                min-h-screen

                flex
                flex-col

                bg-[#f5f8f6]

                text-[#17211b]
            "
        >

            {/* =================================================
                NAVBAR
            ================================================= */}

            <Navbar />


            {/* =================================================
                WORKSPACE
            ================================================= */}

            <div
                className="
                    flex
                    items-start

                    flex-1
                "
            >

                {/* =================================================
                    SIDEBAR
                ================================================= */}

                <AdminSidebar />


                {/* =================================================
                    MAIN CONTENT
                ================================================= */}

                <main
                    className="
                        min-w-0
                        flex-1

                        px-[5%]
                        py-10

                        lg:px-[4%]
                        lg:py-[55px]
                    "
                >

                    {/* =================================================
                        OVERVIEW HEADER
                    ================================================= */}

                    <section>

                        <div
                            className="
                                flex
                                flex-col

                                gap-7
                                mb-10

                                md:flex-row
                                md:items-end
                                md:justify-between
                            "
                        >

                            <div>

                                <p
                                    className="
                                        mb-3

                                        text-[#087542]

                                        text-[9px]
                                        font-extrabold

                                        tracking-[0.2em]
                                    "
                                >
                                    ADMINISTRATION
                                </p>

                                <h1
                                    className="
                                        text-[#17211b]

                                        text-[clamp(38px,4vw,58px)]
                                        leading-[0.95]

                                        font-extrabold

                                        tracking-[-0.06em]
                                    "
                                >
                                    Control Center
                                </h1>

                                <p
                                    className="
                                        max-w-[600px]

                                        mt-4

                                        text-[#718078]

                                        text-[13px]
                                        leading-[1.7]
                                    "
                                >
                                    Review reports, monitor
                                    active cases and manage
                                    proposed safety solutions.
                                </p>

                            </div>


                            {/* =================================================
                                STATUS
                            ================================================= */}

                            <div
                                className="
                                    w-fit

                                    px-5
                                    py-4

                                    rounded-[4px]

                                    border
                                    border-[#dce4de]

                                    bg-white

                                    shadow-[0_5px_20px_rgba(20,50,35,0.04)]
                                "
                            >

                                <span
                                    className="
                                        block

                                        text-[#8a958e]

                                        text-[8px]
                                        font-extrabold

                                        tracking-[0.15em]
                                    "
                                >
                                    ADMIN STATUS
                                </span>

                                <span
                                    className="
                                        flex
                                        items-center
                                        gap-2

                                        mt-2

                                        text-[#087542]

                                        text-[11px]
                                        font-extrabold
                                    "
                                >
                                    <i
                                        className="
                                            w-[7px]
                                            h-[7px]

                                            rounded-full

                                            bg-[#32c77d]
                                        "
                                    />

                                    Operational
                                </span>

                            </div>

                        </div>

                        {/* =================================================
    OVERVIEW CARDS
================================================= */}

                        <div
                            className="
        grid
        grid-cols-1

        gap-4

        sm:grid-cols-2
        xl:grid-cols-4
    "
                        >

                            {/* ---------------------------------------------
        TOTAL REPORTS
    --------------------------------------------- */}

                            <button
                                type="button"
                                                            
                                className="
            group

            min-h-[165px]

            p-6

            rounded-[5px]

            border
            border-[#d9e2dc]

            bg-white

            text-left

            shadow-[0_7px_25px_rgba(20,50,35,0.04)]

            cursor-pointer

            transition

            hover:-translate-y-[2px]
            hover:border-[#b8cec0]
            hover:shadow-[0_12px_30px_rgba(20,50,35,0.08)]
        "
                            >

                                <span
                                    className="
                text-[#718078]

                text-[9px]
                font-extrabold

                tracking-[0.13em]
            "
                                >
                                    TOTAL REPORTS
                                </span>

                                <strong
                                    className="
                block

                mt-6

                text-[#17211b]

                text-[46px]
                leading-none

                font-extrabold

                tracking-[-0.06em]
            "
                                >
                                    {reports.total ?? 0}
                                </strong>

                                <p
                                    className="
                mt-3

                text-[#8a958e]

                text-[10px]
            "
                                >
                                    {reports.pending_review ?? 0}{" "}
                                    awaiting review
                                </p>


                            </button>


                            {/* ---------------------------------------------
        ACTIVE CASES
    --------------------------------------------- */}

                            <button
                                type="button"
                                onClick={() =>
                                    navigate("/admin/cases")
                                }
                                className="
            group

            min-h-[165px]

            p-6

            rounded-[5px]

            border
            border-[#d9e2dc]

            bg-white

            text-left

            shadow-[0_7px_25px_rgba(20,50,35,0.04)]

            cursor-pointer

            transition

            hover:-translate-y-[2px]
            hover:border-[#b8cec0]
            hover:shadow-[0_12px_30px_rgba(20,50,35,0.08)]
        "
                            >

                                <span
                                    className="
                text-[#718078]

                text-[9px]
                font-extrabold

                tracking-[0.13em]
            "
                                >
                                    ACTIVE CASES
                                </span>

                                <strong
                                    className="
                block

                mt-6

                text-[#087542]

                text-[46px]
                leading-none

                font-extrabold

                tracking-[-0.06em]
            "
                                >
                                    {cases.active ?? 0}
                                </strong>

                                <p
                                    className="
                mt-3

                text-[#8a958e]

                text-[10px]
            "
                                >
                                    {cases.assigned ?? 0}{" "}
                                    to be assigned
                                </p>

                                <span
                                    className="
                block

                mt-4

                text-[#087542]

                text-[9px]
                font-extrabold

                opacity-0

                transition

                group-hover:opacity-100
            "
                                >
                                    View cases waiting assignment →
                                </span>

                            </button>


                            {/* ---------------------------------------------
        REVIEW QUEUE
    --------------------------------------------- */}

                            <button
                                type="button"
                                onClick={() =>
                                    navigate("/admin/review")
                                }
                                className="
            group

            min-h-[165px]

            p-6

            rounded-[5px]

            border
            border-[#d9e2dc]

            bg-white

            text-left

            shadow-[0_7px_25px_rgba(20,50,35,0.04)]

            cursor-pointer

            transition

            hover:-translate-y-[2px]
            hover:border-[#b8cec0]
            hover:shadow-[0_12px_30px_rgba(20,50,35,0.08)]
        "
                            >

                                <span
                                    className="
                text-[#718078]

                text-[9px]
                font-extrabold

                tracking-[0.13em]
            "
                                >
                                    REVIEW QUEUE
                                </span>

                                <strong
                                    className="
                block

                mt-6

                text-[#17211b]

                text-[46px]
                leading-none

                font-extrabold

                tracking-[-0.06em]
            "
                                >
                                    {reviewQueue}
                                </strong>

                                <p
                                    className="
                mt-3

                text-[#8a958e]

                text-[10px]
            "
                                >
                                    Items requiring action
                                </p>

                                <span
                                    className="
                block

                mt-4

                text-[#087542]

                text-[9px]
                font-extrabold

                opacity-0

                transition

                group-hover:opacity-100
            "
                                >
                                    Open review queue →
                                </span>

                            </button>


                            {/* ---------------------------------------------
        PENDING SOLUTIONS
    --------------------------------------------- */}

                            <button
                                type="button"
                                onClick={() =>
                                    navigate("/admin/solutions")
                                }
                                className="
            group

            min-h-[165px]

            p-6

            rounded-[5px]

            border
            border-[#075b39]

            bg-gradient-to-br
            from-[#06482d]
            to-[#087542]

            text-left
            text-white

            shadow-[0_12px_30px_rgba(5,65,40,0.16)]

            cursor-pointer

            transition

            hover:-translate-y-[2px]
            hover:shadow-[0_16px_35px_rgba(5,65,40,0.22)]
        "
                            >

                                <span
                                    className="
                text-white/65

                text-[9px]
                font-extrabold

                tracking-[0.13em]
            "
                                >
                                    PENDING SOLUTIONS
                                </span>

                                <strong
                                    className="
                block

                mt-6

                text-white

                text-[46px]
                leading-none

                font-extrabold

                tracking-[-0.06em]
            "
                                >
                                    {solutions.pending_review ?? 0}
                                </strong>

                                <p
                                    className="
                mt-3

                text-white/60

                text-[10px]
            "
                                >
                                    Awaiting admin review
                                </p>

                                <span
                                    className="
                block

                mt-4

                text-white

                text-[9px]
                font-extrabold

                opacity-0

                transition

                group-hover:opacity-100
            "
                                >
                                    Review solutions →
                                </span>

                            </button>

                        </div>


                        {/* =================================================
                            ADMIN ACCESS STRIP
                        ================================================= */}

                        <section
                            className="
                                mt-10
                            "
                        >

                            <div
                                className="
                                    relative
                                    overflow-hidden

                                    rounded-[5px]

                                    border
                                    border-[#075b39]

                                    bg-gradient-to-r
                                    from-[#043b25]
                                    via-[#075b39]
                                    to-[#087542]

                                    shadow-[0_12px_35px_rgba(5,65,40,0.16)]
                                "
                            >

                                {/* Decorative glow */}

                                <div
                                    className="
                                        pointer-events-none

                                        absolute

                                        -right-20
                                        -top-24

                                        w-64
                                        h-64

                                        rounded-full

                                        bg-white/5

                                        blur-3xl
                                    "
                                />


                                <div
                                    className="
                                        relative

                                        flex
                                        flex-col

                                        gap-7

                                        px-7
                                        py-8

                                        md:flex-row
                                        md:items-center
                                        md:justify-between

                                        md:px-9
                                        md:py-9
                                    "
                                >

                                    {/* -----------------------------------------
                                        STRIP TEXT
                                    ----------------------------------------- */}

                                    <div>

                                        <p
                                            className="
                                                mb-2

                                                text-white/55

                                                text-[8px]
                                                font-extrabold

                                                tracking-[0.2em]
                                            "
                                        >
                                            ADMIN ACCESS
                                        </p>

                                        <h2
                                            className="
                                                text-white

                                                text-[25px]
                                                leading-tight

                                                font-extrabold

                                                tracking-[-0.04em]
                                            "
                                        >
                                            Create an administrator
                                        </h2>

                                        <p
                                            className="
                                                max-w-[520px]

                                                mt-2

                                                text-white/65

                                                text-[11px]
                                                leading-[1.6]
                                            "
                                        >
                                            Add another authorized
                                            administrator to OIL SIF.
                                        </p>

                                    </div>


                                    {/* -----------------------------------------
                                        CREATE ADMIN BUTTON
                                    ----------------------------------------- */}

                                    <button
                                        type="button"
                                        onClick={() =>
                                            window.location.href =
                                            "/admin/create-admin"
                                        }
                                        className="
                                            group

                                            w-fit

                                            flex
                                            items-center

                                            gap-3

                                            shrink-0

                                            px-5
                                            py-3.5

                                            rounded-[3px]

                                            border
                                            border-white/20

                                            bg-white

                                            text-[#075b39]

                                            text-[10px]
                                            font-extrabold

                                            cursor-pointer

                                            transition

                                            hover:bg-[#f2f7f4]
                                            hover:shadow-[0_8px_20px_rgba(0,0,0,0.12)]
                                        "
                                    >
                                        Create Admin

                                        <span
                                            className="
                                                text-[16px]

                                                transition-transform
                                                duration-200

                                                group-hover:translate-x-1
                                            "
                                        >
                                            →
                                        </span>

                                    </button>

                                </div>

                            </div>

                        </section>

                    </section>

                </main>

            </div>


            {/* =================================================
                FOOTER
            ================================================= */}

            <div
                className="
                    lg:ml-[265px]
                "
            >
                <Footer />
            </div>

        </div>
    );
}


export default Admin;