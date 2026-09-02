import { useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../api/axios";

function CreateProblemReport() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        report_type: "",
        report_date: new Date().toISOString().split("T")[0],
        site: "",
        location: "",
        activity: "",
        report_text: "",
        equipment: "",
        language_style: "English",
        hazard: "",
        energy_source: [],
        exposure: "",
        unsafe_act_condition: "",
        barrier_or_control: "",
        barrier_failure_mode: "",
        barrier_function: "",
        potential_consequence: "",
        actual_outcome: "",
        immediate_action: ""
    });

    const [attachments, setAttachments] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));

        setError("");
        setSuccess("");
    };

    const handleEnergySourceChange = (event) => {
        const { value, checked } = event.target;

        setFormData((previous) => ({
            ...previous,
            energy_source: checked
                ? [...previous.energy_source, value]
                : previous.energy_source.filter(
                    (item) => item !== value
                )
        }));

        setError("");
    };

    const handleAttachmentChange = (event) => {
        const files = Array.from(event.target.files || []);

        if (files.length > 5) {
            setError("You can upload a maximum of 5 files.");
            event.target.value = "";
            return;
        }

        const maxSize = 10 * 1024 * 1024;

        const oversizedFile = files.find(
            (file) => file.size > maxSize
        );

        if (oversizedFile) {
            setError(
                `"${oversizedFile.name}" exceeds the 10 MB file limit.`
            );
            event.target.value = "";
            return;
        }

        setAttachments(files);
        setError("");
    };

    const generateReportId = () => {
        const random = crypto.randomUUID()
            .replace(/-/g, "")
            .slice(0, 8)
            .toUpperCase();

        return `RPT-${random}`;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setSuccess("");

        if (!formData.report_type) {
            setError("Please select a report type.");
            return;
        }

        if (!formData.activity.trim()) {
            setError("Please enter the activity.");
            return;
        }

        if (!formData.report_text.trim()) {
            setError("Please describe the problem or observation.");
            return;
        }

        if (!formData.hazard.trim()) {
            setError("Please describe the identified hazard.");
            return;
        }

        if (formData.energy_source.length === 0) {
            setError("Please select at least one energy source.");
            return;
        }

        if (!formData.exposure.trim()) {
            setError("Please describe the exposure.");
            return;
        }

        if (!formData.unsafe_act_condition.trim()) {
            setError("Please describe the unsafe act or condition.");
            return;
        }

        if (!formData.barrier_or_control.trim()) {
            setError("Please describe the existing barrier or control.");
            return;
        }

        if (!formData.barrier_failure_mode) {
            setError("Please select the barrier failure mode.");
            return;
        }

        if (!formData.barrier_function) {
            setError("Please select the barrier function.");
            return;
        }

        if (!formData.potential_consequence.trim()) {
            setError("Please describe the potential consequence.");
            return;
        }

        try {
            setSubmitting(true);

            const reportId = generateReportId();

            const payload = {
                report_id: reportId,
                report_type: formData.report_type,
                source_type: "user_report",
                source_reference: reportId,
                report_date: formData.report_date
                    ? new Date(
                        `${formData.report_date}T00:00:00`
                    ).toISOString()
                    : new Date().toISOString(),
                site: formData.site.trim(),
                activity: formData.activity.trim(),
                location:
                    formData.location.trim() || "NOT_STATED",
                equipment:
                    formData.equipment.trim() || "NOT_STATED",
                report_text: formData.report_text.trim(),
                language_style: formData.language_style,
                hazard: formData.hazard.trim(),
                energy_source: formData.energy_source,
                exposure: formData.exposure.trim(),
                unsafe_act_condition:
                    formData.unsafe_act_condition.trim(),
                barrier_or_control:
                    formData.barrier_or_control.trim(),
                barrier_failure_mode:
                    formData.barrier_failure_mode,
                barrier_function:
                    formData.barrier_function,
                potential_consequence:
                    formData.potential_consequence.trim(),
                actual_outcome:
                    formData.actual_outcome.trim(),
                immediate_action:
                    formData.immediate_action.trim()
            };

            const reportFormData = new FormData();

            Object.entries(payload).forEach(([key, value]) => {
                if (Array.isArray(value)) {
                    value.forEach((item) => {
                        reportFormData.append(key, item);
                    });
                } else if (
                    value !== undefined &&
                    value !== null
                ) {
                    reportFormData.append(key, value);
                }
            });

            attachments.forEach((file) => {
                reportFormData.append("attachments", file);
            });

            const response = await api.post(
                "/reports",
                reportFormData
            );

            if (!response?.data?.success) {
                throw new Error(
                    response?.data?.message ||
                    "Failed to submit the problem report."
                );
            }

            setSuccess(
                `Your report has been submitted successfully. Report ID: ${reportId}`
            );

            setFormData({
                report_type: "",
                report_date: new Date()
                    .toISOString()
                    .split("T")[0],
                site: "",
                location: "",
                activity: "",
                report_text: "",
                equipment: "",
                language_style: "English",
                hazard: "",
                energy_source: [],
                exposure: "",
                unsafe_act_condition: "",
                barrier_or_control: "",
                barrier_failure_mode: "",
                barrier_function: "",
                potential_consequence: "",
                actual_outcome: "",
                immediate_action: ""
            });

            setAttachments([]);

            const fileInput =
                document.getElementById("report-attachments");

            if (fileInput) {
                fileInput.value = "";
            }
        } catch (err) {
            console.error(
                "Submit problem report error:",
                err
            );

            setError(
                err?.response?.data?.message ||
                err?.message ||
                "Failed to submit your problem report. Please try again."
            );
        } finally {
            setSubmitting(false);
        }
    };

    const inputClass = `
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
        bg-transparent
    `;

    const textareaClass = `
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
    `;

    const labelClass = `
        block
        mb-2
        text-[#17211b]
        text-[13px]
        font-bold
    `;

    const required = (
        <span className="text-[#b32626]"> *</span>
    );

    return (
        <div
            className="
                min-h-screen
                bg-[#003b2a]
                bg-[linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(135deg,#003b2a_0%,#00583e_48%,#001f16_100%)]
                bg-[size:48px_48px,48px_48px,100%_100%]
                px-4
                py-8
                sm:px-6
                sm:py-12
            "
        >
            <div className="mx-auto w-full max-w-[720px]">

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
                        Submit Problem Report
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
                        Report a safety observation, near miss,
                        or incident for review by the safety team.
                    </p>

                </div>

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

                        <div className="mb-8">

                            <div
                                className="
                                    text-[#087542]
                                    text-[9px]
                                    font-extrabold
                                    tracking-[0.15em]
                                "
                            >
                                REPORT INFORMATION
                            </div>

                            <h2
                                className="
                                    mt-2
                                    text-[#17211b]
                                    text-[21px]
                                    font-extrabold
                                "
                            >
                                Tell us what happened
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
                                {required} are required.
                            </p>

                        </div>

                        <div className="mb-7">

                            <label
                                htmlFor="report_type"
                                className={labelClass}
                            >
                                Report Type
                                {required}
                            </label>

                            <select
                                id="report_type"
                                name="report_type"
                                value={formData.report_type}
                                onChange={handleChange}
                                className={inputClass}
                            >
                                <option value="">
                                    Select report type
                                </option>
                                <option value="UA/UC">
                                    Unsafe Act / Unsafe Condition
                                </option>
                                <option value="Near Miss">
                                    Near Miss
                                </option>
                                <option value="Incident">
                                    Incident
                                </option>
                            </select>

                        </div>

                        <div className="grid grid-cols-1 gap-7 sm:grid-cols-2">

                            <div>

                                <label
                                    htmlFor="report_date"
                                    className={labelClass}
                                >
                                    Report Date
                                    {required}
                                </label>

                                <input
                                    id="report_date"
                                    name="report_date"
                                    type="date"
                                    value={formData.report_date}
                                    onChange={handleChange}
                                    className={inputClass}
                                />

                            </div>

                            <div>

                                <label
                                    htmlFor="site"
                                    className={labelClass}
                                >
                                    Site
                                </label>

                                <input
                                    id="site"
                                    name="site"
                                    type="text"
                                    value={formData.site}
                                    onChange={handleChange}
                                    placeholder="Enter site"
                                    className={inputClass}
                                />

                            </div>

                            <div>

                                <label
                                    htmlFor="location"
                                    className={labelClass}
                                >
                                    Location
                                </label>

                                <input
                                    id="location"
                                    name="location"
                                    type="text"
                                    value={formData.location}
                                    onChange={handleChange}
                                    placeholder="Specific location"
                                    className={inputClass}
                                />

                            </div>

                            <div>

                                <label
                                    htmlFor="activity"
                                    className={labelClass}
                                >
                                    Activity
                                    {required}
                                </label>

                                <input
                                    id="activity"
                                    name="activity"
                                    type="text"
                                    value={formData.activity}
                                    onChange={handleChange}
                                    placeholder="What activity was taking place?"
                                    className={inputClass}
                                />

                            </div>

                        </div>

                        <div className="mt-8 border-t border-[#e3e9e5] pt-8">

                            <div
                                className="
                                    mb-6
                                    text-[#087542]
                                    text-[9px]
                                    font-extrabold
                                    tracking-[0.15em]
                                "
                            >
                                SAFETY DETAILS
                            </div>

                            <div className="mb-7">

                                <label
                                    htmlFor="report_text"
                                    className={labelClass}
                                >
                                    Description / Report Text
                                    {required}
                                </label>

                                <p
                                    className="
                                        mb-3
                                        text-[#718078]
                                        text-[11px]
                                        leading-[1.6]
                                    "
                                >
                                    Describe what was observed,
                                    what happened, and any relevant
                                    circumstances.
                                </p>

                                <textarea
                                    id="report_text"
                                    name="report_text"
                                    value={formData.report_text}
                                    onChange={handleChange}
                                    rows={7}
                                    placeholder="Describe the safety observation or incident..."
                                    className={textareaClass}
                                />

                            </div>

                            <div className="mb-7">

                                <label
                                    htmlFor="equipment"
                                    className={labelClass}
                                >
                                    Equipment
                                </label>

                                <input
                                    id="equipment"
                                    name="equipment"
                                    type="text"
                                    value={formData.equipment}
                                    onChange={handleChange}
                                    placeholder="Equipment involved, if applicable"
                                    className={inputClass}
                                />

                            </div>

                            <div className="mb-7">

                                <label
                                    htmlFor="language_style"
                                    className={labelClass}
                                >
                                    Language Style
                                    {required}
                                </label>

                                <select
                                    id="language_style"
                                    name="language_style"
                                    value={formData.language_style}
                                    onChange={handleChange}
                                    className={inputClass}
                                >
                                    <option value="English">
                                        English
                                    </option>
                                    <option value="Hindi">
                                        Hindi
                                    </option>
                                    <option value="Hinglish">
                                        Hinglish
                                    </option>
                                    <option value="Mixed">
                                        Mixed
                                    </option>
                                </select>

                            </div>

                            <div className="mb-7">

                                <label
                                    htmlFor="hazard"
                                    className={labelClass}
                                >
                                    Hazard
                                    {required}
                                </label>

                                <textarea
                                    id="hazard"
                                    name="hazard"
                                    value={formData.hazard}
                                    onChange={handleChange}
                                    rows={3}
                                    placeholder="What hazard was identified?"
                                    className={textareaClass}
                                />

                            </div>

                            <div className="mb-7">

                                <label className={labelClass}>
                                    Energy Source
                                    {required}
                                </label>

                                <p
                                    className="
                                        mb-3
                                        text-[#718078]
                                        text-[11px]
                                    "
                                >
                                    Select all applicable energy
                                    sources.
                                </p>

                                <div
                                    className="
                                        grid
                                        grid-cols-1
                                        gap-3
                                        sm:grid-cols-2
                                    "
                                >
                                    {[
                                        "Electrical",
                                        "Mechanical",
                                        "Pressure",
                                        "Chemical",
                                        "Thermal",
                                        "Gravity",
                                        "Stored Energy",
                                        "Other"
                                    ].map((energy) => (
                                        <label
                                            key={energy}
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
                                                type="checkbox"
                                                value={energy}
                                                checked={formData.energy_source.includes(
                                                    energy
                                                )}
                                                onChange={
                                                    handleEnergySourceChange
                                                }
                                            />

                                            <span>{energy}</span>
                                        </label>
                                    ))}
                                </div>

                            </div>

                            <div className="mb-7">

                                <label
                                    htmlFor="exposure"
                                    className={labelClass}
                                >
                                    Exposure
                                    {required}
                                </label>

                                <textarea
                                    id="exposure"
                                    name="exposure"
                                    value={formData.exposure}
                                    onChange={handleChange}
                                    rows={3}
                                    placeholder="Who or what could be exposed to the hazard?"
                                    className={textareaClass}
                                />

                            </div>

                            <div>

                                <label
                                    htmlFor="unsafe_act_condition"
                                    className={labelClass}
                                >
                                    Unsafe Act / Condition
                                    {required}
                                </label>

                                <textarea
                                    id="unsafe_act_condition"
                                    name="unsafe_act_condition"
                                    value={
                                        formData.unsafe_act_condition
                                    }
                                    onChange={handleChange}
                                    rows={4}
                                    placeholder="Describe the unsafe act or unsafe condition..."
                                    className={textareaClass}
                                />

                            </div>

                        </div>

                        <div className="mt-8 border-t border-[#e3e9e5] pt-8">

                            <div
                                className="
                                    mb-6
                                    text-[#087542]
                                    text-[9px]
                                    font-extrabold
                                    tracking-[0.15em]
                                "
                            >
                                BARRIERS & CONSEQUENCES
                            </div>

                            <div className="mb-7">

                                <label
                                    htmlFor="barrier_or_control"
                                    className={labelClass}
                                >
                                    Barrier / Control
                                    {required}
                                </label>

                                <textarea
                                    id="barrier_or_control"
                                    name="barrier_or_control"
                                    value={
                                        formData.barrier_or_control
                                    }
                                    onChange={handleChange}
                                    rows={4}
                                    placeholder="What barrier or control was in place?"
                                    className={textareaClass}
                                />

                            </div>

                            <div className="grid grid-cols-1 gap-7 sm:grid-cols-2">

                                <div>

                                    <label
                                        htmlFor="barrier_failure_mode"
                                        className={labelClass}
                                    >
                                        Barrier Failure Mode
                                        {required}
                                    </label>

                                    <select
                                        id="barrier_failure_mode"
                                        name="barrier_failure_mode"
                                        value={
                                            formData.barrier_failure_mode
                                        }
                                        onChange={handleChange}
                                        className={inputClass}
                                    >
                                        <option value="">
                                            Select failure mode
                                        </option>
                                        <option value="missing">
                                            Missing
                                        </option>
                                        <option value="bypassed">
                                            Bypassed
                                        </option>
                                        <option value="degraded">
                                            Degraded
                                        </option>
                                        <option value="unverified">
                                            Unverified
                                        </option>
                                        <option value="none">
                                            None
                                        </option>
                                    </select>

                                </div>

                                <div>

                                    <label
                                        htmlFor="barrier_function"
                                        className={labelClass}
                                    >
                                        Barrier Function
                                        {required}
                                    </label>

                                    <select
                                        id="barrier_function"
                                        name="barrier_function"
                                        value={
                                            formData.barrier_function
                                        }
                                        onChange={handleChange}
                                        className={inputClass}
                                    >
                                        <option value="">
                                            Select function
                                        </option>
                                        <option value="prevention">
                                            Prevention
                                        </option>
                                        <option value="detection">
                                            Detection
                                        </option>
                                        <option value="control">
                                            Control
                                        </option>
                                        <option value="mitigation">
                                            Mitigation
                                        </option>
                                    </select>

                                </div>

                            </div>

                            <div className="mt-7 mb-7">

                                <label
                                    htmlFor="potential_consequence"
                                    className={labelClass}
                                >
                                    Potential Consequence
                                    {required}
                                </label>

                                <textarea
                                    id="potential_consequence"
                                    name="potential_consequence"
                                    value={
                                        formData.potential_consequence
                                    }
                                    onChange={handleChange}
                                    rows={4}
                                    placeholder="What could have happened?"
                                    className={textareaClass}
                                />

                            </div>

                            <div className="mb-7">

                                <label
                                    htmlFor="actual_outcome"
                                    className={labelClass}
                                >
                                    Actual Outcome
                                </label>

                                <textarea
                                    id="actual_outcome"
                                    name="actual_outcome"
                                    value={formData.actual_outcome}
                                    onChange={handleChange}
                                    rows={4}
                                    placeholder="What actually happened, if applicable?"
                                    className={textareaClass}
                                />

                            </div>

                            <div>

                                <label
                                    htmlFor="immediate_action"
                                    className={labelClass}
                                >
                                    Immediate Action
                                </label>

                                <textarea
                                    id="immediate_action"
                                    name="immediate_action"
                                    value={
                                        formData.immediate_action
                                    }
                                    onChange={handleChange}
                                    rows={4}
                                    placeholder="What immediate action was taken?"
                                    className={textareaClass}
                                />

                            </div>

                        </div>

                        <div className="mt-8 border-t border-[#e3e9e5] pt-8">

                            <div
                                className="
                                    mb-6
                                    text-[#087542]
                                    text-[9px]
                                    font-extrabold
                                    tracking-[0.15em]
                                "
                            >
                                SUPPORTING EVIDENCE
                            </div>

                            <label
                                htmlFor="report-attachments"
                                className={labelClass}
                            >
                                Supporting Documents /
                                Attachments
                            </label>

                            <p
                                className="
                                    mb-3
                                    text-[#718078]
                                    text-[11px]
                                    leading-[1.6]
                                "
                            >
                                Upload photos, diagrams, reports,
                                or other supporting evidence.
                                Optional — maximum 5 files,
                                10 MB each.
                            </p>

                            <input
                                id="report-attachments"
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

                                    {attachments.map(
                                        (file, index) => (
                                            <div
                                                key={`${file.name}-${index}`}
                                                className="
                                                    flex
                                                    items-center
                                                    justify-between
                                                    rounded-lg
                                                    border
                                                    border-gray-200
                                                    bg-gray-50
                                                    px-3
                                                    py-2
                                                "
                                            >
                                                <span
                                                    className="
                                                        truncate
                                                        text-sm
                                                        text-gray-700
                                                    "
                                                >
                                                    {file.name}
                                                </span>

                                                <span
                                                    className="
                                                        ml-3
                                                        shrink-0
                                                        text-xs
                                                        text-gray-400
                                                    "
                                                >
                                                    {(
                                                        file.size /
                                                        (1024 * 1024)
                                                    ).toFixed(2)}{" "}
                                                    MB
                                                </span>
                                            </div>
                                        )
                                    )}

                                </div>
                            )}

                        </div>

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
                                    ✓ Report submitted
                                </strong>

                                <div className="mt-1">
                                    {success}
                                </div>

                                <button
                                    type="button"
                                    onClick={() => navigate("/")}
                                    className="
                                        mt-4
                                        border-0
                                        bg-transparent
                                        p-0
                                        text-[#087542]
                                        text-[11px]
                                        font-bold
                                        cursor-pointer
                                        hover:underline
                                    "
                                >
                                    ← Return to dashboard
                                </button>
                            </div>
                        )}

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
                                : "SUBMIT PROBLEM REPORT"}
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
                            Your report will be reviewed by the
                            administrator before it becomes an
                            active safety case.
                        </p>

                    </div>
                </form>

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

export default CreateProblemReport;