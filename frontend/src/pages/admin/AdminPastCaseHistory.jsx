import { useEffect, useState } from "react";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import AdminSidebar from "../../components/AdminSidebar";

import api from "../../api/axios";

import {
    getSolutionsForProposal,
} from "../../api/solution.api";


function AdminPastCaseHistory() {

    const [cases, setCases] = useState([]);

    const [selectedCase, setSelectedCase] =
        useState(null);

    const [solutions, setSolutions] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [solutionsLoading, setSolutionsLoading] =
        useState(false);

    const [error, setError] =
        useState("");

    const [solutionsError, setSolutionsError] =
        useState("");

    const [csvLoading, setCsvLoading] =
        useState(false);


    /* =========================================================
       LOAD RESOLVED CASES
    ========================================================= */

    const loadResolvedCases = async () => {

        try {

            setLoading(true);
            setError("");

            const response = await api.get(
                "/admin/resolved-cases"
            );

            setCases(
                response?.data?.data || []
            );

        } catch (err) {

            console.error(
                "Load resolved cases error:",
                err
            );

            setError(
                err?.response?.data?.message ||
                "Unable to load resolved cases."
            );

        } finally {

            setLoading(false);

        }
    };


    useEffect(() => {
        loadResolvedCases();
    }, []);


    /* =========================================================
       OPEN CASE
    ========================================================= */

    const handleOpenCase = (caseItem) => {

        try {

            setSelectedCase(caseItem);

            setSolutionsError("");

            setSolutionsLoading(false);

            /*
             * Resolved cases now contain their complete
             * solution history from the admin endpoint.
             */

            setSolutions(
                caseItem.solutions || []
            );

        } catch (err) {

            console.error(
                "Load case solutions error:",
                err
            );

            setSolutionsError(
                "Unable to load solutions for this case."
            );

            setSolutions([]);

            setSolutionsLoading(false);
        }
    };

    /* =========================================================
       CLOSE DIALOG
    ========================================================= */

    const handleClose = () => {

        setSelectedCase(null);

        setSolutions([]);

        setSolutionsError("");

    };


    /* =========================================================
       DOWNLOAD CSV
    ========================================================= */

    const handleDownloadCSV = async () => {

        try {

            setCsvLoading(true);

            const response = await api.get(
                "/export/resolved-cases/csv",
                {
                    responseType: "blob",
                }
            );

            const blob =
                new Blob(
                    [response.data],
                    {
                        type:
                            "text/csv;charset=utf-8;",
                    }
                );

            const url =
                window.URL.createObjectURL(
                    blob
                );

            const link =
                document.createElement("a");

            link.href = url;

            link.download =
                `sih26165-resolved-case-history-${Date.now()}.csv`;

            document.body.appendChild(link);

            link.click();

            link.remove();

            window.URL.revokeObjectURL(
                url
            );

        } catch (err) {

            console.error(
                "CSV download error:",
                err
            );

            alert(
                err?.response?.data?.message ||
                "Unable to download CSV."
            );

        } finally {

            setCsvLoading(false);

        }
    };


    /* =========================================================
       DATE FORMAT
    ========================================================= */

    const formatDate = (date) => {

        if (!date) {
            return "—";
        }

        const parsedDate =
            new Date(date);

        if (
            Number.isNaN(
                parsedDate.getTime()
            )
        ) {
            return "—";
        }

        return parsedDate.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        );
    };


    const formatDateTime = (date) => {

        if (!date) {
            return "—";
        }

        const parsedDate =
            new Date(date);

        if (
            Number.isNaN(
                parsedDate.getTime()
            )
        ) {
            return "—";
        }

        return parsedDate.toLocaleString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            }
        );
    };


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

                        text-[14px]
                    "
                >
                    Loading case history...
                </p>

            </div>
        );
    }


    /* =========================================================
       MAIN
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

            <Navbar />


            <div
                className="
                    flex
                    items-start

                    flex-1
                "
            >

                <AdminSidebar />


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
                        HEADER
                    ================================================= */}

                    <section
                        className="
                            mb-10
                        "
                    >

                        <p
                            className="
                                mb-3

                                text-[#087542]

                                text-[10px]
                                font-extrabold

                                tracking-[0.2em]
                            "
                        >
                            CASE ARCHIVE
                        </p>


                        <div
                            className="
                                flex
                                flex-col

                                gap-6

                                md:flex-row
                                md:items-end
                                md:justify-between
                            "
                        >

                            <div>

                                <h1
                                    className="
                                        text-[#17211b]

                                        text-[clamp(40px,4vw,58px)]
                                        leading-[0.95]

                                        font-extrabold

                                        tracking-[-0.06em]
                                    "
                                >
                                    Past Case History
                                </h1>

                                <p
                                    className="
                                        max-w-[650px]

                                        mt-4

                                        text-[#718078]

                                        text-[15px]
                                        leading-[1.7]
                                    "
                                >
                                    Browse resolved cases and review
                                    the solutions submitted during
                                    their resolution.
                                </p>

                            </div>


                            <button
                                type="button"
                                onClick={
                                    handleDownloadCSV
                                }
                                disabled={
                                    csvLoading
                                }
                                className="
                                    shrink-0

                                    px-6
                                    py-3.5

                                    rounded-[3px]

                                    border
                                    border-[#087542]

                                    bg-[#087542]

                                    text-white

                                    text-[11px]
                                    font-extrabold

                                    cursor-pointer

                                    hover:bg-[#065c38]

                                    disabled:opacity-50
                                    disabled:cursor-not-allowed
                                "
                            >
                                {csvLoading
                                    ? "Preparing CSV..."
                                    : "Download CSV ↓"}
                            </button>

                        </div>

                    </section>


                    {/* =================================================
                        ERROR
                    ================================================= */}

                    {error && (

                        <div
                            className="
                                mb-6

                                p-5

                                rounded-[5px]

                                border
                                border-[#f0cccc]

                                bg-[#fff6f6]

                                text-[#c62828]

                                text-[13px]
                                font-bold
                            "
                        >
                            {error}
                        </div>

                    )}


                    {/* =================================================
                        EMPTY
                    ================================================= */}

                    {!error &&
                        cases.length === 0 && (

                            <div
                                className="
                                    rounded-[5px]

                                    border
                                    border-[#dce4de]

                                    bg-white

                                    px-8
                                    py-20

                                    text-center
                                "
                            >

                                <div
                                    className="
                                        mx-auto

                                        w-16
                                        h-16

                                        flex
                                        items-center
                                        justify-center

                                        rounded-full

                                        bg-[#eaf4ee]

                                        text-[#087542]

                                        text-[24px]
                                    "
                                >
                                    ✓
                                </div>

                                <h2
                                    className="
                                        mt-6

                                        text-[#17211b]

                                        text-[24px]
                                        font-extrabold
                                    "
                                >
                                    No resolved cases yet
                                </h2>

                                <p
                                    className="
                                        max-w-[470px]

                                        mx-auto
                                        mt-3

                                        text-[#718078]

                                        text-[14px]
                                        leading-[1.7]
                                    "
                                >
                                    Resolved cases will appear here
                                    after an approved solution closes
                                    a case.
                                </p>

                            </div>

                        )}


                    {/* =================================================
                        CASE LIST
                    ================================================= */}

                    {cases.length > 0 && (

                        <div
                            className="
                                overflow-hidden

                                rounded-[5px]

                                border
                                border-[#dce4de]

                                bg-white
                            "
                        >

                            {/* TABLE HEADER */}

                            <div
                                className="
                                    hidden

                                    px-6
                                    py-4

                                    border-b
                                    border-[#e4eae5]

                                    bg-[#f9fbfa]

                                    md:grid
                                    md:grid-cols-[1.2fr_1.2fr_1.3fr_1fr_auto]

                                    md:items-center
                                    md:gap-5
                                "
                            >

                                <TableHeader>
                                    CASE
                                </TableHeader>

                                <TableHeader>
                                    SITE
                                </TableHeader>

                                <TableHeader>
                                    ASSIGNED TEAM
                                </TableHeader>

                                <TableHeader>
                                    RESOLVED
                                </TableHeader>

                                <TableHeader>
                                    VIEW
                                </TableHeader>

                            </div>


                            {cases.map(
                                (caseItem) => (

                                    <button
                                        key={
                                            caseItem.report_id
                                        }
                                        type="button"
                                        onClick={() =>
                                            handleOpenCase(
                                                caseItem
                                            )
                                        }
                                        className="
                                            w-full

                                            grid

                                            grid-cols-1

                                            gap-4

                                            px-6
                                            py-5

                                            border-0
                                            border-b
                                            border-[#e4eae5]

                                            bg-white

                                            text-left

                                            cursor-pointer

                                            transition

                                            hover:bg-[#f9fbfa]

                                            md:grid-cols-[1.2fr_1.2fr_1.3fr_1fr_auto]

                                            md:items-center
                                            md:gap-5

                                            last:border-b-0
                                        "
                                    >

                                        <div>

                                            <span
                                                className="
                                                    block
                                                    md:hidden

                                                    text-[#718078]

                                                    text-[9px]
                                                    font-extrabold

                                                    tracking-[0.12em]
                                                "
                                            >
                                                CASE
                                            </span>

                                            <strong
                                                className="
                                                    block

                                                    mt-1
                                                    md:mt-0

                                                    text-[#17211b]

                                                    text-[14px]
                                                    font-extrabold
                                                "
                                            >
                                                {
                                                    caseItem.report_id
                                                }
                                            </strong>

                                        </div>


                                        <div>

                                            <span
                                                className="
                                                    block
                                                    md:hidden

                                                    text-[#718078]

                                                    text-[9px]
                                                    font-extrabold

                                                    tracking-[0.12em]
                                                "
                                            >
                                                SITE
                                            </span>

                                            <span
                                                className="
                                                    block

                                                    mt-1
                                                    md:mt-0

                                                    text-[#4f5d55]

                                                    text-[13px]
                                                "
                                            >
                                                {
                                                    caseItem.site ||
                                                    "—"
                                                }
                                            </span>

                                        </div>


                                        <div>

                                            <span
                                                className="
                                                    block
                                                    md:hidden

                                                    text-[#718078]

                                                    text-[9px]
                                                    font-extrabold

                                                    tracking-[0.12em]
                                                "
                                            >
                                                ASSIGNED TEAM
                                            </span>

                                            <span
                                                className="
                                                    block

                                                    mt-1
                                                    md:mt-0

                                                    text-[#4f5d55]

                                                    text-[13px]
                                                    font-semibold
                                                "
                                            >
                                                {
                                                    caseItem.assigned_team ||
                                                    "—"
                                                }
                                            </span>

                                        </div>


                                        <div>

                                            <span
                                                className="
                                                    block
                                                    md:hidden

                                                    text-[#718078]

                                                    text-[9px]
                                                    font-extrabold

                                                    tracking-[0.12em]
                                                "
                                            >
                                                RESOLVED
                                            </span>

                                            <span
                                                className="
                                                    block

                                                    mt-1
                                                    md:mt-0

                                                    text-[#4f5d55]

                                                    text-[13px]
                                                "
                                            >
                                                {
                                                    formatDate(
                                                        caseItem.resolved_at
                                                    )
                                                }
                                            </span>

                                        </div>


                                        <div
                                            className="
                                                flex
                                                items-center

                                                md:justify-end
                                            "
                                        >

                                            <span
                                                className="
                                                    text-[#087542]

                                                    text-[12px]
                                                    font-extrabold
                                                "
                                            >
                                                View History →
                                            </span>

                                        </div>

                                    </button>

                                )
                            )}

                        </div>

                    )}

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


            {/* =================================================
                CASE HISTORY DIALOG
            ================================================= */}

            {selectedCase && (

                <div
                    className="
                        fixed
                        inset-0

                        z-[100]

                        flex
                        items-center
                        justify-center

                        bg-[#0b2117]/60

                        p-4
                        sm:p-6
                    "
                >

                    <div
                        className="
                            relative

                            w-full
                            max-w-[1000px]

                            max-h-[92vh]

                            overflow-y-auto

                            rounded-[6px]

                            bg-white

                            shadow-[0_25px_80px_rgba(0,0,0,0.25)]
                        "
                    >

                        {/* HEADER */}

                        <div
                            className="
                                sticky
                                top-0
                                z-10

                                flex
                                items-start
                                justify-between

                                gap-5

                                px-8
                                py-6

                                border-b
                                border-[#dce4de]

                                bg-white
                            "
                        >

                            <div>

                                <p
                                    className="
                                        mb-2

                                        text-[#087542]

                                        text-[10px]
                                        font-extrabold

                                        tracking-[0.18em]
                                    "
                                >
                                    RESOLVED CASE
                                </p>

                                <h2
                                    className="
                                        text-[#17211b]

                                        text-[30px]
                                        leading-none

                                        font-extrabold

                                        tracking-[-0.04em]
                                    "
                                >
                                    {
                                        selectedCase.report_id
                                    }
                                </h2>

                            </div>


                            <button
                                type="button"
                                onClick={
                                    handleClose
                                }
                                className="
                                    w-10
                                    h-10

                                    flex
                                    items-center
                                    justify-center

                                    shrink-0

                                    rounded-full

                                    border
                                    border-[#dce4de]

                                    bg-white

                                    text-[#66736b]

                                    text-[20px]

                                    cursor-pointer

                                    hover:bg-[#f5f8f6]
                                "
                            >
                                ×
                            </button>

                        </div>


                        {/* CASE INFORMATION */}

                        <div
                            className="
                                grid
                                grid-cols-1

                                gap-4

                                px-8
                                pt-8

                                sm:grid-cols-2
                                lg:grid-cols-4
                            "
                        >

                            <InfoField
                                label="Site"
                                value={
                                    selectedCase.site
                                }
                            />

                            <InfoField
                                label="Assigned Team"
                                value={
                                    selectedCase.assigned_team
                                }
                            />

                            <InfoField
                                label="Case Status"
                                value="Resolved"
                            />

                            <InfoField
                                label="Resolved"
                                value={
                                    formatDateTime(
                                        selectedCase.resolved_at
                                    )
                                }
                            />

                        </div>


                        {/* SOLUTIONS */}

                        <div
                            className="
                                px-8
                                py-8
                            "
                        >

                            <div
                                className="
                                    flex
                                    items-center
                                    justify-between

                                    gap-4

                                    mb-6
                                "
                            >

                                <h3
                                    className="
                                        text-[#17211b]

                                        text-[19px]
                                        font-extrabold
                                    "
                                >
                                    Solutions Offered
                                </h3>

                                <span
                                    className="
                                        px-3
                                        py-1.5

                                        rounded-full

                                        bg-[#eaf4ee]

                                        text-[#087542]

                                        text-[10px]
                                        font-extrabold
                                    "
                                >
                                    {
                                        solutions.length
                                    }
                                </span>

                            </div>


                            {solutionsLoading && (

                                <div
                                    className="
                                        py-12

                                        flex
                                        flex-col
                                        items-center
                                    "
                                >

                                    <div
                                        className="
                                            w-9
                                            h-9

                                            rounded-full

                                            border-4
                                            border-[#dce8e0]
                                            border-t-[#087542]

                                            animate-spin
                                        "
                                    />

                                    <p
                                        className="
                                            mt-4

                                            text-[#718078]

                                            text-[13px]
                                        "
                                    >
                                        Loading solutions...
                                    </p>

                                </div>

                            )}


                            {!solutionsLoading &&
                                solutionsError && (

                                    <div
                                        className="
                                            p-5

                                            rounded-[5px]

                                            border
                                            border-[#f0cccc]

                                            bg-[#fff6f6]

                                            text-[#c62828]

                                            text-[13px]
                                            font-bold
                                        "
                                    >
                                        {solutionsError}
                                    </div>

                                )}


                            {!solutionsLoading &&
                                !solutionsError &&
                                solutions.length ===
                                0 && (

                                    <div
                                        className="
                                            p-8

                                            rounded-[5px]

                                            border
                                            border-[#dce4de]

                                            bg-[#f9fbfa]

                                            text-[#718078]

                                            text-[13px]

                                            text-center
                                        "
                                    >
                                        No solution history was found
                                        for this case.
                                    </div>

                                )}


                            {!solutionsLoading &&
                                !solutionsError &&
                                solutions.length >
                                0 && (

                                    <div
                                        className="
                                            space-y-5
                                        "
                                    >

                                        {solutions.map(
                                            (
                                                solution
                                            ) => (

                                                <div
                                                    key={
                                                        solution.solution_id
                                                    }
                                                    className="
                                                        p-6

                                                        rounded-[5px]

                                                        border
                                                        border-[#dce4de]

                                                        bg-white
                                                    "
                                                >

                                                    <div
                                                        className="
                                                            flex
                                                            flex-col

                                                            gap-3

                                                            md:flex-row
                                                            md:items-start
                                                            md:justify-between
                                                        "
                                                    >

                                                        <div>

                                                            <span
                                                                className="
                                                                    block

                                                                    text-[#718078]

                                                                    text-[10px]
                                                                    font-extrabold

                                                                    tracking-[0.12em]
                                                                "
                                                            >
                                                                SOLUTION
                                                            </span>

                                                            <h4
                                                                className="
                                                                    mt-2

                                                                    text-[#17211b]

                                                                    text-[17px]
                                                                    font-extrabold
                                                                "
                                                            >
                                                                {
                                                                    solution.solution_id
                                                                }
                                                            </h4>

                                                        </div>


                                                        <span
                                                            className="
                                                                w-fit

                                                                px-3
                                                                py-1.5

                                                                rounded-full

                                                                bg-[#eaf4ee]

                                                                text-[#087542]

                                                                text-[10px]
                                                                font-extrabold
                                                            "
                                                        >
                                                            {
                                                                solution.status
                                                            }
                                                        </span>

                                                    </div>


                                                    <div
                                                        className="
                                                            mt-6
                                                        "
                                                    >

                                                        <InfoField
                                                            label="Review Cycle"
                                                            value={
                                                                solution.review_cycle ||
                                                                1
                                                            }
                                                        />

                                                    </div>


                                                    <div
                                                        className="
                                                            mt-5
                                                        "
                                                    >

                                                        <span
                                                            className="
                                                                block

                                                                mb-2

                                                                text-[#718078]

                                                                text-[10px]
                                                                font-extrabold

                                                                tracking-[0.12em]
                                                            "
                                                        >
                                                            SOLUTION
                                                        </span>

                                                        <div
                                                            className="
                                                                p-5

                                                                rounded-[5px]

                                                                border
                                                                border-[#e2e9e4]

                                                                bg-[#f9fbfa]

                                                                text-[#4f5d55]

                                                                text-[14px]
                                                                leading-[1.8]

                                                                whitespace-pre-wrap
                                                            "
                                                        >
                                                            {
                                                                solution.solution_text
                                                            }
                                                        </div>

                                                    </div>


                                                    {solution.attachments &&
                                                        solution
                                                            .attachments
                                                            .length >
                                                        0 && (

                                                            <div
                                                                className="
                                                                    mt-6
                                                                "
                                                            >

                                                                <span
                                                                    className="
                                                                        block

                                                                        mb-3

                                                                        text-[#718078]

                                                                        text-[10px]
                                                                        font-extrabold

                                                                        tracking-[0.12em]
                                                                    "
                                                                >
                                                                    ATTACHMENTS
                                                                </span>

                                                                <div
                                                                    className="
                                                                        space-y-2
                                                                    "
                                                                >

                                                                    {solution.attachments.map(
                                                                        (
                                                                            attachment,
                                                                            index
                                                                        ) => (

                                                                            <a
                                                                                key={
                                                                                    attachment._id ||
                                                                                    `${attachment.name}-${index}`
                                                                                }
                                                                                href={
                                                                                    attachment.url
                                                                                }
                                                                                target="_blank"
                                                                                rel="noreferrer"
                                                                                className="
                                                                                    flex
                                                                                    items-center
                                                                                    justify-between

                                                                                    gap-4

                                                                                    p-4

                                                                                    rounded-[4px]

                                                                                    border
                                                                                    border-[#dce4de]

                                                                                    bg-white

                                                                                    no-underline

                                                                                    hover:bg-[#f5f8f6]
                                                                                "
                                                                            >

                                                                                <span
                                                                                    className="
                                                                                        truncate

                                                                                        text-[#33423a]

                                                                                        text-[13px]
                                                                                        font-semibold
                                                                                    "
                                                                                >
                                                                                    {
                                                                                        attachment.name
                                                                                    }
                                                                                </span>

                                                                                <span
                                                                                    className="
                                                                                        shrink-0

                                                                                        text-[#087542]

                                                                                        text-[11px]
                                                                                        font-extrabold
                                                                                    "
                                                                                >
                                                                                    Open →
                                                                                </span>

                                                                            </a>

                                                                        )
                                                                    )}

                                                                </div>

                                                            </div>

                                                        )}

                                                </div>

                                            )
                                        )}

                                    </div>

                                )}

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
}


/* =============================================================
   TABLE HEADER
============================================================= */

function TableHeader({ children }) {

    return (
        <span
            className="
                text-[#718078]

                text-[9px]
                font-extrabold

                tracking-[0.14em]
            "
        >
            {children}
        </span>
    );
}


/* =============================================================
   INFO FIELD
============================================================= */

function InfoField({ label, value }) {

    return (
        <div
            className="
                p-5

                rounded-[5px]

                border
                border-[#e2e9e4]

                bg-[#f9fbfa]
            "
        >

            <span
                className="
                    block

                    mb-2

                    text-[#718078]

                    text-[10px]
                    font-extrabold

                    tracking-[0.12em]
                "
            >
                {label}
            </span>

            <span
                className="
                    block

                    break-all

                    text-[#33423a]

                    text-[14px]
                    leading-[1.5]

                    font-semibold
                "
            >
                {value || "Not stated"}
            </span>

        </div>
    );
}


export default AdminPastCaseHistory;