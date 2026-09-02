import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import api from "../../api/axios";
import { createTeamProposal } from "../../api/teamProposal.api";

function TeamProposal() {
    const { reportId } = useParams();
    const navigate = useNavigate();

    const [report, setReport] = useState(null);
    const [loadingReport, setLoadingReport] = useState(true);

    const [formData, setFormData] = useState({
        registered: "yes",
        team_id: "",
        team_name: "",
        team_leader_email: "",
        solution_proposal: "",
    });

    const [attachments, setAttachments] = useState([]);

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        const loadReport = async () => {
            try {
                setLoadingReport(true);
                setError("");

                const response = await api.get(
                    `/reports/${reportId}`
                );

                const reportData =
                    response?.data?.data;

                if (!reportData) {
                    throw new Error(
                        "Problem report could not be loaded."
                    );
                }

                if (
                    reportData.case_status !== "active" ||
                    reportData.assigned_team
                ) {
                    setError(
                        "This case is no longer accepting team proposals."
                    );
                    setReport(reportData);
                    return;
                }

                setReport(reportData);
            } catch (err) {
                console.error(
                    "Load team proposal report error:",
                    err
                );

                setError(
                    err?.response?.data?.message ||
                    err?.message ||
                    "Failed to load the safety case."
                );
            } finally {
                setLoadingReport(false);
            }
        };

        if (reportId) {
            loadReport();
        }
    }, [reportId]);

    const handleAttachmentChange = (e) => {
        const files = Array.from(e.target.files || []);

        if (files.length > 5) {
            setError("You can upload a maximum of 5 files.");
            return;
        }

        setAttachments(files);
        setError("");
    };

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));

        setError("");
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setSuccess("");

        if (!report) {
            setError(
                "Safety case information is not available."
            );
            return;
        }

        if (
            report.case_status !== "active" ||
            report.assigned_team
        ) {
            setError(
                "This case is no longer accepting team proposals."
            );
            return;
        }

        if (!formData.team_name.trim()) {
            setError("Please enter your team name.");
            return;
        }

        if (!formData.team_leader_email.trim()) {
            setError(
                "Please enter the team leader email."
            );
            return;
        }

        if (
            formData.registered === "yes" &&
            !formData.team_id.trim()
        ) {
            setError(
                "Please enter your registered team ID."
            );
            return;
        }

        if (!formData.solution_proposal.trim()) {
            setError(
                "Please describe your proposed solution."
            );
            return;
        }

        try {
            setSubmitting(true);

            const proposalId = `PROP-${Date.now()}`;

            const payload = {
                proposal_id: proposalId,
                report_id: report.report_id,
                team_id:
                    formData.registered === "yes"
                        ? formData.team_id.trim()
                        : undefined,
                team_name: formData.team_name.trim(),
                team_leader_email:
                    formData.team_leader_email
                        .trim()
                        .toLowerCase(),
                solution_proposal:
                    formData.solution_proposal.trim(),
            };

            const proposalFormData = new FormData();

            Object.entries(payload).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    proposalFormData.append(key, value);
                }
            });

            attachments.forEach((file) => {
                proposalFormData.append("attachments", file);
            });

            await createTeamProposal(proposalFormData);

            setSuccess(
                "Your team proposal has been submitted successfully."
            );

            setFormData({
                registered: "yes",
                team_id: "",
                team_name: "",
                team_leader_email: "",
                solution_proposal: "",
            });
        }
        catch (err) {
            console.error(
                "Submit team proposal error:",
                err
            );

            setError(
                err?.response?.data?.message ||
                "Failed to submit your team proposal. Please try again."
            );
        } finally {
            setSubmitting(false);
        }
    };

    if (loadingReport) {
        return (
            <div
                className="
                    min-h-screen
                    flex
                    items-center
                    justify-center
                    bg-[#003b2a]

                    bg-[linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(135deg,#003b2a_0%,#00583e_48%,#001f16_100%)]

                    bg-[size:48px_48px,48px_48px,100%_100%] px-5
                "

            >
                <div
                    className="
                        w-full
                        max-w-[620px]
                        rounded-[5px]
                        bg-white
                        p-8
                        text-center
                        shadow-[0_25px_70px_rgba(0,0,0,0.18)]
                    "
                >
                    <div
                        className="
                            text-[#087542]
                            text-[12px]
                            font-extrabold
                            tracking-[0.16em]
                        "
                    >
                        LOADING SAFETY CASE
                    </div>

                    <p
                        className="
                            mt-3
                            text-[#718078]
                            text-[13px]
                        "
                    >
                        Please wait while we load the
                        problem details.
                    </p>
                </div>
            </div>
        );
    }

    if (!report || error) {
        return (
            <div
                className="
                    min-h-screen
                    flex
                    items-center
                    justify-center
                    bg-[#003b2a]
                    bg-[linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(135deg,#003b2a_0%,#00583e_48%,#001f16_100%)]
                    bg-[size:48px_48px,48px_48px,100%_100%]
                    px-5
                    py-10
                "
            >
                <div
                    className="
                        w-full
                        max-w-[620px]
                        rounded-[5px]
                        bg-white
                        p-8
                        shadow-[0_25px_70px_rgba(0,0,0,0.18)]
                    "
                >
                    <div
                        className="
                            text-[#087542]
                            text-[9px]
                            font-extrabold
                            tracking-[0.18em]
                        "
                    >
                        TEAM PROPOSAL
                    </div>

                    <h1
                        className="
                            mt-3
                            text-[#17211b]
                            text-[25px]
                            font-extrabold
                        "
                    >
                        Proposal unavailable
                    </h1>

                    <p
                        className="
                            mt-3
                            text-[#59655e]
                            text-[13px]
                            leading-[1.7]
                        "
                    >
                        {error ||
                            "This safety case could not be loaded."}
                    </p>

                    <button
                        type="button"
                        onClick={() => navigate("/")}
                        className="
                            mt-7
                            px-5
                            py-3
                            rounded-[3px]
                            border-0
                            bg-[#087542]
                            text-white
                            text-[12px]
                            font-extrabold
                            cursor-pointer
                            hover:bg-[#075f36]
                        "
                    >
                        ← Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div
            className="
                min-h-screen
                bg-[#087542]
                px-4
                py-8
                sm:px-6
                sm:py-12
            "
        >
            <div className="mx-auto w-full max-w-[720px]">

                {/* Brand / top information */}

                <div className="mb-6 text-white">

                    <div
                        className="
                            text-[9px]
                            font-extrabold
                            tracking-[0.2em]
                            opacity-80
                        "
                    >
                        OIL INDIA LIMITED
                    </div>

                    <h1
                        className="
                            mt-2
                            text-[28px]
                            sm:text-[34px]
                            font-extrabold
                            tracking-[-0.04em]
                        "
                    >
                        Submit Team Proposal
                    </h1>

                    <p
                        className="
                            mt-2
                            max-w-[600px]
                            text-[13px]
                            leading-[1.7]
                            text-white/80
                        "
                    >
                        Propose your team's solution for
                        an identified safety case.
                    </p>
                </div>

                {/* Case context card */}

                <div
                    className="
                        mb-4
                        overflow-hidden
                        rounded-[5px]
                        bg-white
                        shadow-[0_18px_55px_rgba(0,0,0,0.12)]
                    "
                >
                    <div
                        className="
                            border-t-[5px]
                            border-[#b32626]
                            px-7
                            py-6
                        "
                    >
                        <div
                            className="
                                text-[#718078]
                                text-[9px]
                                font-extrabold
                                tracking-[0.15em]
                            "
                        >
                            SAFETY CASE
                        </div>

                        <h2
                            className="
                                mt-2
                                text-[#17211b]
                                text-[21px]
                                font-extrabold
                            "
                        >
                            {report.activity ||
                                "Safety incident"}
                        </h2>

                        <div
                            className="
                                mt-2
                                text-[#8a958e]
                                text-[11px]
                            "
                        >
                            {report.report_id}
                        </div>

                        <div
                            className="
                                mt-5
                                grid
                                grid-cols-1
                                gap-3
                                sm:grid-cols-3
                            "
                        >
                            <div
                                className="
                                    rounded-[4px]
                                    bg-[#f5f8f6]
                                    p-4
                                "
                            >
                                <span
                                    className="
                                        block
                                        mb-1
                                        text-[#718078]
                                        text-[8px]
                                        font-extrabold
                                        tracking-[0.1em]
                                    "
                                >
                                    SITE
                                </span>

                                <span
                                    className="
                                        text-[#17211b]
                                        text-[12px]
                                        font-bold
                                    "
                                >
                                    {report.site || "—"}
                                </span>
                            </div>

                            <div
                                className="
                                    rounded-[4px]
                                    bg-[#f5f8f6]
                                    p-4
                                "
                            >
                                <span
                                    className="
                                        block
                                        mb-1
                                        text-[#718078]
                                        text-[8px]
                                        font-extrabold
                                        tracking-[0.1em]
                                    "
                                >
                                    LOCATION
                                </span>

                                <span
                                    className="
                                        text-[#17211b]
                                        text-[12px]
                                        font-bold
                                    "
                                >
                                    {report.location || "—"}
                                </span>
                            </div>

                            <div
                                className="
                                    rounded-[4px]
                                    bg-[#f5f8f6]
                                    p-4
                                "
                            >
                                <span
                                    className="
                                        block
                                        mb-1
                                        text-[#718078]
                                        text-[8px]
                                        font-extrabold
                                        tracking-[0.1em]
                                    "
                                >
                                    SIF SCORE
                                </span>

                                <span
                                    className="
                                        text-[#087542]
                                        text-[18px]
                                        font-extrabold
                                    "
                                >
                                    {report.sif_score ?? "—"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form */}

                <form
                    onSubmit={handleSubmit}
                    className="
                        overflow-hidden
                        rounded-[5px]
                        bg-white
                        shadow-[0_18px_55px_rgba(0,0,0,0.12)]
                    "
                >
                    <div className="px-7 py-7">

                        {/* Form heading */}

                        <div className="mb-8">

                            <div
                                className="
                                    text-[#087542]
                                    text-[9px]
                                    font-extrabold
                                    tracking-[0.15em]
                                "
                            >
                                TEAM INFORMATION
                            </div>

                            <h2
                                className="
                                    mt-2
                                    text-[#17211b]
                                    text-[21px]
                                    font-extrabold
                                "
                            >
                                Tell us about your team
                            </h2>

                            <p
                                className="
                                    mt-2
                                    text-[#718078]
                                    text-[12px]
                                    leading-[1.6]
                                "
                            >
                                Fields marked with{" "}
                                <span className="text-[#b32626]">
                                    *
                                </span>{" "}
                                are required.
                            </p>
                        </div>

                        {/* Registered question */}

                        <div className="mb-7">

                            <label
                                className="
                                    block
                                    mb-3
                                    text-[#17211b]
                                    text-[13px]
                                    font-bold
                                "
                            >
                                Is your team already registered?
                                <span className="text-[#b32626]">
                                    {" "}*
                                </span>
                            </label>

                            <div className="space-y-3">

                                <label
                                    className="
                                        flex
                                        items-center
                                        gap-3
                                        cursor-pointer
                                        text-[#46534b]
                                        text-[13px]
                                    "
                                >
                                    <input
                                        type="radio"
                                        name="registered"
                                        value="yes"
                                        checked={
                                            formData.registered ===
                                            "yes"
                                        }
                                        onChange={handleChange}
                                    />

                                    <span>
                                        Yes, our team is registered
                                    </span>
                                </label>

                                <label
                                    className="
                                        flex
                                        items-center
                                        gap-3
                                        cursor-pointer
                                        text-[#46534b]
                                        text-[13px]
                                    "
                                >
                                    <input
                                        type="radio"
                                        name="registered"
                                        value="no"
                                        checked={
                                            formData.registered ===
                                            "no"
                                        }
                                        onChange={handleChange}
                                    />

                                    <span>
                                        No, we are not registered
                                    </span>
                                </label>

                            </div>
                        </div>

                        {/* Team ID */}

                        {formData.registered === "yes" && (
                            <div className="mb-7">

                                <label
                                    htmlFor="team_id"
                                    className="
                                        block
                                        mb-2
                                        text-[#17211b]
                                        text-[13px]
                                        font-bold
                                    "
                                >
                                    Registered Team ID
                                    <span className="text-[#b32626]">
                                        {" "}*
                                    </span>
                                </label>

                                <input
                                    id="team_id"
                                    name="team_id"
                                    type="text"
                                    value={formData.team_id}
                                    onChange={handleChange}
                                    placeholder="e.g. TEAM-001"
                                    className="
                                        w-full
                                        border-0
                                        border-b
                                        border-[#cfd9d2]
                                        px-0
                                        py-3
                                        text-[#17211b]
                                        text-[13px]
                                        outline-none
                                        transition
                                        focus:border-[#087542]
                                    "
                                />

                            </div>
                        )}

                        {/* Team name */}

                        <div className="mb-7">

                            <label
                                htmlFor="team_name"
                                className="
                                    block
                                    mb-2
                                    text-[#17211b]
                                    text-[13px]
                                    font-bold
                                "
                            >
                                Team Name
                                <span className="text-[#b32626]">
                                    {" "}*
                                </span>
                            </label>

                            <input
                                id="team_name"
                                name="team_name"
                                type="text"
                                value={formData.team_name}
                                onChange={handleChange}
                                placeholder="Enter your team name"
                                className="
                                    w-full
                                    border-0
                                    border-b
                                    border-[#cfd9d2]
                                    px-0
                                    py-3
                                    text-[#17211b]
                                    text-[13px]
                                    outline-none
                                    transition
                                    focus:border-[#087542]
                                "
                            />

                        </div>

                        {/* Email */}

                        <div className="mb-8">

                            <label
                                htmlFor="team_leader_email"
                                className="
                                    block
                                    mb-2
                                    text-[#17211b]
                                    text-[13px]
                                    font-bold
                                "
                            >
                                Team Leader Email
                                <span className="text-[#b32626]">
                                    {" "}*
                                </span>
                            </label>

                            <input
                                id="team_leader_email"
                                name="team_leader_email"
                                type="email"
                                value={
                                    formData.team_leader_email
                                }
                                onChange={handleChange}
                                placeholder="teamleader@example.com"
                                className="
                                    w-full
                                    border-0
                                    border-b
                                    border-[#cfd9d2]
                                    px-0
                                    py-3
                                    text-[#17211b]
                                    text-[13px]
                                    outline-none
                                    transition
                                    focus:border-[#087542]
                                "
                            />

                        </div>

                        {/* Solution */}

                        <div
                            className="
                                border-t
                                border-[#e3e9e5]
                                pt-8
                            "
                        >

                            <div
                                className="
                                    mb-6
                                    text-[#087542]
                                    text-[9px]
                                    font-extrabold
                                    tracking-[0.15em]
                                "
                            >
                                SOLUTION PROPOSAL
                            </div>

                            <label
                                htmlFor="solution_proposal"
                                className="
                                    block
                                    mb-2
                                    text-[#17211b]
                                    text-[13px]
                                    font-bold
                                "
                            >
                                Describe your proposed solution
                                <span className="text-[#b32626]">
                                    {" "}*
                                </span>
                            </label>

                            <p
                                className="
                                    mb-3
                                    text-[#718078]
                                    text-[11px]
                                    leading-[1.6]
                                "
                            >
                                Explain your approach, how it
                                addresses the identified safety
                                issue, expected impact, and any
                                important implementation details.
                            </p>

                            <textarea
                                id="solution_proposal"
                                name="solution_proposal"
                                value={
                                    formData.solution_proposal
                                }
                                onChange={handleChange}
                                rows={8}
                                placeholder="Write your team's proposed solution..."
                                className="
                                    w-full
                                    resize-y
                                    rounded-[4px]
                                    border
                                    border-[#d5dfd8]
                                    bg-[#fafcfb]
                                    px-4
                                    py-4
                                    text-[#46534b]
                                    text-[13px]
                                    leading-[1.7]
                                    outline-none
                                    transition
                                    focus:border-[#087542]
                                    focus:bg-white
                                "
                            />

                        </div>
                        <div>
                            <label
                                className="
            block
            mb-2
            text-sm
            font-semibold
            text-gray-800
        "
                            >
                                Supporting Documents / Attachments
                            </label>

                            <p className="mb-3 text-xs text-gray-500">
                                Upload supporting files such as technical documents,
                                diagrams, reports or images. Optional.
                            </p>

                            <input
                                type="file"
                                multiple
                                accept=".pdf,.jpg,.jpeg,.png,.webp"
                                onChange={handleAttachmentChange}
                                className="
            block
            w-full
            rounded-lg
            border
            border-gray-300
            bg-white
            px-4
            py-3
            text-sm
            text-gray-700
            file:mr-4
            file:rounded-md
            file:border-0
            file:bg-[#087542]
            file:px-4
            file:py-2
            file:text-sm
            file:font-semibold
            file:text-white
            hover:file:bg-[#065c34]
        "
                            />

                            {attachments.length > 0 && (
                                <div className="mt-3 space-y-2">
                                    {attachments.map((file, index) => (
                                        <div
                                            key={`${file.name}-${index}`}
                                            className="
                        flex
                        items-center
                        justify-between
                        rounded-lg
                        bg-gray-50
                        border
                        border-gray-200
                        px-3
                        py-2
                    "
                                        >
                                            <span className="truncate text-sm text-gray-700">
                                                {file.name}
                                            </span>

                                            <span className="ml-3 shrink-0 text-xs text-gray-400">
                                                {(file.size / (1024 * 1024)).toFixed(2)} MB
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Error */}

                        {error && (
                            <div
                                className="
                                    mt-6
                                    rounded-[4px]
                                    border
                                    border-[#f1cccc]
                                    bg-[#fff5f5]
                                    px-4
                                    py-3
                                    text-[#b32626]
                                    text-[12px]
                                    leading-[1.5]
                                "
                            >
                                {error}
                            </div>
                        )}

                        {/* Success */}

                        {success && (
                            <div
                                className="
                                    mt-6
                                    rounded-[4px]
                                    border
                                    border-[#c8e2d2]
                                    bg-[#f1faf4]
                                    px-4
                                    py-4
                                    text-[#087542]
                                    text-[12px]
                                    leading-[1.6]
                                "
                            >
                                <strong>
                                    ✓ Proposal submitted
                                </strong>

                                <div className="mt-1">
                                    {success}
                                </div>
                            </div>
                        )}

                        {/* Submit */}

                        <button
                            type="submit"
                            disabled={submitting}
                            className="
                                mt-7
                                w-full
                                min-h-[50px]
                                rounded-[3px]
                                border-0
                                bg-[#087542]
                                text-white
                                text-[12px]
                                font-extrabold
                                tracking-[0.05em]
                                cursor-pointer
                                transition
                                hover:bg-[#075f36]
                                disabled:cursor-not-allowed
                                disabled:opacity-60
                            "
                        >
                            {submitting
                                ? "SUBMITTING..."
                                : "SUBMIT TEAM PROPOSAL"}
                        </button>

                        <p
                            className="
                                mt-4
                                text-center
                                text-[#8a958e]
                                text-[10px]
                                leading-[1.5]
                            "
                        >
                            Your proposal will be reviewed by
                            the administrator before the case is
                            assigned.
                        </p>

                    </div>
                </form>

                {/* Back */}

                <button
                    type="button"
                    onClick={() => navigate("/")}
                    className="
                        block
                        mx-auto
                        mt-6
                        border-0
                        bg-transparent
                        text-white/80
                        text-[11px]
                        font-semibold
                        cursor-pointer
                        hover:text-white
                    "
                >
                    ← Back to dashboard
                </button>

            </div>
        </div>
    );
}

export default TeamProposal;