import { useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../api/axios";

const createInitialFormData = () => ({
    report_type: "",
    report_date: new Date().toISOString().split("T")[0],
    incident_time: "",

    organization: "",
    sector: "",
    site: "",
    incident_serial_no: "",

    incident_classification: "",
    report_stage: "",
    incident_category: "",
    incident_type: "",
    incident_location: "",

    activity: "",
    location: "",
    equipment: "",

    report_text: "",
    actual_outcome: "",
    post_incident_measures: "",

    facility_shutdown: "",
    facility_outage: "",
    facility_status: "",

    fire_duration_hours: "",
    fire_duration_minutes: "",

    fatalities_employees: "",
    fatalities_contractors: "",
    fatalities_others: "",

    injuries_employees: "",
    injuries_contractors: "",
    injuries_others: "",

    man_hours_employees: "",
    man_hours_contractors: "",
    man_hours_others: "",

    direct_loss_in_lakhs: "",
    indirect_loss: "",

    similar_incident_occurred: "",
    similar_incident_description: "",

    internal_investigation_completed: "",
    internal_investigation_completion_date: "",

    internal_investigation_report_submitted_to_oisd: "",
    expected_oisd_submission_date: "",

    cause_of_incident: [],
    leakage_cause: "",
    leakage_cause_details: "",
    ignition_cause: "",
    ignition_cause_details: "",

    avoidable: "",
    avoidance_factors: [],

    language_style: "English",
});

const ML_PLACEHOLDERS = {
    hazard: "NOT_STATED",
    energy_source: [],
    exposure: "NOT_STATED",
    unsafe_act_condition: "NOT_STATED",
    barrier_or_control: "NOT_STATED",
    barrier_failure_mode: "unverified",
    barrier_function: "prevention",
    potential_consequence: "NOT_STATED",
};

function CreateProblemReport() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState(
        createInitialFormData()
    );

    const [attachments, setAttachments] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));

        setError("");
        setSuccess("");
    };

    const handleCheckboxArrayChange = (
        field,
        value,
        checked
    ) => {
        setFormData((previous) => ({
            ...previous,
            [field]: checked
                ? [
                    ...previous[field],
                    value,
                ]
                : previous[field].filter(
                    (item) => item !== value
                ),
        }));

        setError("");
        setSuccess("");
    };

    const handleAttachmentChange = (event) => {
        const files = Array.from(
            event.target.files || []
        );

        if (files.length > 5) {
            setError(
                "You can upload a maximum of 5 files."
            );
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
        setSuccess("");
    };

    const generateReportId = () => {
        const random = crypto
            .randomUUID()
            .replace(/-/g, "")
            .slice(0, 8)
            .toUpperCase();

        return `RPT-${random}`;
    };

    const toNumberOrNull = (value) => {
        if (
            value === "" ||
            value === null ||
            value === undefined
        ) {
            return null;
        }

        const number = Number(value);

        return Number.isFinite(number)
            ? number
            : null;
    };

    const toBooleanOrNull = (value) => {
        if (
            value === "" ||
            value === null ||
            value === undefined
        ) {
            return null;
        }

        return value === "true";
    };


    const requiredFields = [
        {
            key: "report_type",
            label: "report type",
            type: "value",
        },
        {
            key: "activity",
            label: "activity",
            type: "text",
        },
        {
            key: "report_text",
            label: "report description",
            type: "text",
        },
    ];

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setSuccess("");

        if (!formData.report_type) {
            setError(
                "Please select a report type."
            );
            return;
        }

        if (!formData.report_date) {
            setError(
                "Please select the report date."
            );
            return;
        }

        if (!formData.activity.trim()) {
            setError(
                "Please enter the activity."
            );
            return;
        }

        if (!formData.report_text.trim()) {
            setError(
                "Please describe what happened or was observed."
            );
            return;
        }

        try {
            setSubmitting(true);

            const reportId =
                generateReportId();

            const payload = {
                report_id: reportId,

                report_type:
                    formData.report_type,

                source_type:
                    "user_report",

                source_reference:
                    reportId,

                organization:
                    formData.organization.trim(),

                sector:
                    formData.sector.trim(),

                site:
                    formData.site.trim(),

                incident_serial_no:
                    formData.incident_serial_no.trim(),

                report_date:
                    new Date(
                        `${formData.report_date}T00:00:00`
                    ).toISOString(),

                incident_time:
                    formData.incident_time,

                incident_classification:
                    formData.incident_classification ||
                    "NOT_STATED",

                report_stage:
                    formData.report_stage ||
                    "NOT_STATED",

                incident_category:
                    formData.incident_category ||
                    "NOT_STATED",

                incident_type:
                    formData.incident_type ||
                    "NOT_STATED",

                incident_location:
                    formData.incident_location ||
                    "NOT_STATED",

                activity:
                    formData.activity.trim(),

                location:
                    formData.location.trim() ||
                    "NOT_STATED",

                equipment:
                    formData.equipment.trim() ||
                    "NOT_STATED",

                report_text:
                    formData.report_text.trim(),

                actual_outcome:
                    formData.actual_outcome.trim(),

                hazard: ML_PLACEHOLDERS.hazard,

                exposure: ML_PLACEHOLDERS.exposure,

                unsafe_act_condition:
                    ML_PLACEHOLDERS.unsafe_act_condition,

                barrier_or_control:
                    ML_PLACEHOLDERS.barrier_or_control,

                barrier_failure_mode:
                    ML_PLACEHOLDERS.barrier_failure_mode,

                barrier_function:
                    ML_PLACEHOLDERS.barrier_function,

                potential_consequence:
                    ML_PLACEHOLDERS.potential_consequence,

                post_incident_measures:
                    formData.post_incident_measures.trim(),

                facility_shutdown:
                    toBooleanOrNull(
                        formData.facility_shutdown
                    ),

                facility_outage:
                    toBooleanOrNull(
                        formData.facility_outage
                    ),

                facility_status:
                    formData.facility_status ||
                    "NOT_STATED",

                fire_duration_hours:
                    toNumberOrNull(
                        formData.fire_duration_hours
                    ),

                fire_duration_minutes:
                    toNumberOrNull(
                        formData.fire_duration_minutes
                    ),

                fatalities: {
                    employees:
                        toNumberOrNull(
                            formData.fatalities_employees
                        ) || " ",

                    contractors:
                        toNumberOrNull(
                            formData.fatalities_contractors
                        ) || " ",

                    others:
                        toNumberOrNull(
                            formData.fatalities_others
                        ) || " ",
                },

                injuries: {
                    employees:
                        toNumberOrNull(
                            formData.injuries_employees
                        ) || " ",

                    contractors:
                        toNumberOrNull(
                            formData.injuries_contractors
                        ) || " ",

                    others:
                        toNumberOrNull(
                            formData.injuries_others
                        ) || " ",
                },

                man_hours_lost: {
                    employees:
                        toNumberOrNull(
                            formData.man_hours_employees
                        ) || " ",

                    contractors:
                        toNumberOrNull(
                            formData.man_hours_contractors
                        ) || " ",

                    others:
                        toNumberOrNull(
                            formData.man_hours_others
                        ) || " ",
                },

                direct_loss_in_lakhs:
                    toNumberOrNull(
                        formData.direct_loss_in_lakhs
                    ),

                indirect_loss:
                    formData.indirect_loss.trim(),

                similar_incident_occurred:
                    toBooleanOrNull(
                        formData.similar_incident_occurred
                    ),

                similar_incident_description:
                    formData.similar_incident_description.trim(),

                internal_investigation_completed:
                    toBooleanOrNull(
                        formData.internal_investigation_completed
                    ),

                internal_investigation_completion_date:
                    formData.internal_investigation_completion_date
                        ? new Date(
                            `${formData.internal_investigation_completion_date}T00:00:00`
                        ).toISOString()
                        : null,

                internal_investigation_report_submitted_to_oisd:
                    toBooleanOrNull(
                        formData.internal_investigation_report_submitted_to_oisd
                    ),

                expected_oisd_submission_date:
                    formData.expected_oisd_submission_date
                        ? new Date(
                            `${formData.expected_oisd_submission_date}T00:00:00`
                        ).toISOString()
                        : null,

                cause_of_incident:
                    formData.cause_of_incident,

                energy_source:
                    ML_PLACEHOLDERS.energy_source,

                leakage_cause:
                    formData.leakage_cause ||
                    "NOT_STATED",

                leakage_cause_details:
                    formData.leakage_cause_details.trim(),

                ignition_cause:
                    formData.ignition_cause ||
                    "NOT_STATED",

                ignition_cause_details:
                    formData.ignition_cause_details.trim(),

                avoidable:
                    toBooleanOrNull(
                        formData.avoidable
                    ),

                avoidance_factors:
                    formData.avoidance_factors,

                language_style:
                    formData.language_style,
            };

            const reportFormData =
                new FormData();

            Object.entries(payload).forEach(
                ([key, value]) => {
                    if (
                        value === undefined ||
                        value === null
                    ) {
                        return;
                    }

                    if (
                        Array.isArray(value)
                    ) {
                        value.forEach((item) => {
                            reportFormData.append(
                                key,
                                item
                            );
                        });

                        return;
                    }

                    if (
                        typeof value === "object"
                    ) {
                        reportFormData.append(
                            key,
                            JSON.stringify(value)
                        );

                        return;
                    }

                    reportFormData.append(
                        key,
                        value
                    );
                }
            );

            attachments.forEach((file) => {
                reportFormData.append(
                    "attachments",
                    file
                );
            });

            const response =
                await api.post(
                    "/reports",
                    reportFormData
                );

            if (
                !response?.data?.success
            ) {
                throw new Error(
                    response?.data?.message ||
                    "Failed to submit the problem report."
                );
            }

            setSuccess(
                `Your report has been submitted successfully. Report ID: ${reportId}`
            );

            setFormData(
                createInitialFormData()
            );

            setAttachments([]);

            const fileInput =
                document.getElementById(
                    "report-attachments"
                );

            if (fileInput) {
                fileInput.value = "";
            }
        } catch (err) {
            console.error(
                "Submit problem report error:",
                err
            );

            const missingFields =
                err?.response?.data?.missing_fields;

            if (
                Array.isArray(missingFields) &&
                missingFields.length > 0
            ) {
                setError(
                    `Required fields missing: ${missingFields.join(", ")}`
                );
            } else {
                setError(
                    err?.response?.data?.message ||
                    err?.message ||
                    "Failed to submit your problem report. Please try again."
                );
            }
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

    const sectionTitle = (title, description) => (
        <div className="mb-6">
            <div
                className="
                    text-[#087542]
                    text-[9px]
                    font-extrabold
                    tracking-[0.15em]
                "
            >
                {title}
            </div>

            {description && (
                <p
                    className="
                        mt-2
                        text-[#718078]
                        text-[12px]
                        leading-[1.6]
                    "
                >
                    {description}
                </p>
            )}
        </div>
    );

    const required = (
        <span className="text-[#b32626]">
            {" "}
            *
        </span>
    );

    const yesNoOptions = (
        <>
            <option value="">
                Select
            </option>
            <option value="true">
                Yes
            </option>
            <option value="false">
                No
            </option>
        </>
    );

    const causeOptions = [
        "Human error",
        "Equipment failure",
        "Process failure",
        "Procedure deficiency",
        "Inadequate supervision",
        "Inadequate training",
        "Maintenance issue",
        "Design deficiency",
        "Material failure",
        "Environmental condition",
        "Communication failure",
        "Other",
    ];

    const avoidanceOptions = [
        "Better supervision",
        "Following operating procedure",
        "Training",
        "Better planning",
        "Work permit system",
        "PPE",
        "Better equipment",
        "Management control",
        "Maintenance",
        "Inspection/testing",
        "Other",
    ];

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
                        Report a safety observation,
                        near miss, or incident for
                        review by the safety team.
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
                                value={
                                    formData.report_type
                                }
                                onChange={
                                    handleChange
                                }
                                className={inputClass}
                            >
                                <option value="">
                                    Select report type
                                </option>
                                <option value="UA/UC">
                                    Unsafe Act /
                                    Unsafe Condition
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
                                    value={
                                        formData.report_date
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    className={inputClass}
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="incident_time"
                                    className={labelClass}
                                >
                                    Incident Time
                                </label>

                                <input
                                    id="incident_time"
                                    name="incident_time"
                                    type="time"
                                    value={
                                        formData.incident_time
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    className={inputClass}
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="organization"
                                    className={labelClass}
                                >
                                    Organisation
                                </label>

                                <input
                                    id="organization"
                                    name="organization"
                                    type="text"
                                    value={
                                        formData.organization
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="Organisation name"
                                    className={inputClass}
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="sector"
                                    className={labelClass}
                                >
                                    Sector
                                </label>

                                <input
                                    id="sector"
                                    name="sector"
                                    type="text"
                                    value={
                                        formData.sector
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="Sector / business unit"
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
                                    value={
                                        formData.site
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="Enter site"
                                    className={inputClass}
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="incident_serial_no"
                                    className={labelClass}
                                >
                                    Incident Serial No.
                                </label>

                                <input
                                    id="incident_serial_no"
                                    name="incident_serial_no"
                                    type="text"
                                    value={
                                        formData.incident_serial_no
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="Official reference, if available"
                                    className={inputClass}
                                />
                            </div>
                        </div>

                        <div className="mt-8 border-t border-[#e3e9e5] pt-8">
                            {sectionTitle(
                                "INCIDENT CLASSIFICATION",
                                "Provide the basic classification and context of the event."
                            )}

                            <div className="grid grid-cols-1 gap-7 sm:grid-cols-2">
                                <div>
                                    <label
                                        htmlFor="incident_classification"
                                        className={labelClass}
                                    >
                                        Incident Classification
                                    </label>

                                    <select
                                        id="incident_classification"
                                        name="incident_classification"
                                        value={
                                            formData.incident_classification
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        className={inputClass}
                                    >
                                        <option value="">
                                            Select classification
                                        </option>

                                        <option value="major">
                                            Major
                                        </option>

                                        <option value="minor">
                                            Minor
                                        </option>

                                        <option value="nearmiss">
                                            Near Miss
                                        </option>
                                    </select>
                                </div>

                                <div>
                                    <label
                                        htmlFor="report_stage"
                                        className={labelClass}
                                    >
                                        Report Stage
                                    </label>

                                    <select
                                        id="report_stage"
                                        name="report_stage"
                                        value={
                                            formData.report_stage
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        className={inputClass}
                                    >
                                        <option value="">
                                            Select stage
                                        </option>

                                        <option value="preliminary">
                                            Preliminary
                                        </option>

                                        <option value="final">
                                            Final
                                        </option>
                                    </select>
                                </div>

                                <div>
                                    <label
                                        htmlFor="incident_category"
                                        className={labelClass}
                                    >
                                        Incident Category
                                    </label>

                                    <select
                                        id="incident_category"
                                        name="incident_category"
                                        value={formData.incident_category}
                                        onChange={handleChange}
                                        className={inputClass}
                                    >
                                        <option value="">
                                            Select category
                                        </option>

                                        <option value="fire">
                                            Fire
                                        </option>

                                        <option value="accident">
                                            Accident
                                        </option>
                                    </select>
                                </div>

                                <div>
                                    <label
                                        htmlFor="incident_type"
                                        className={labelClass}
                                    >
                                        Incident Type
                                    </label>

                                    <input
                                        id="incident_type"
                                        name="incident_type"
                                        type="text"
                                        value={
                                            formData.incident_type
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Type of incident"
                                        className={inputClass}
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="incident_location"
                                        className={labelClass}
                                    >
                                        Incident Location
                                    </label>

                                    <input
                                        id="incident_location"
                                        name="incident_location"
                                        type="text"
                                        value={
                                            formData.incident_location
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Location as per report"
                                        className={inputClass}
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="facility_status"
                                        className={labelClass}
                                    >
                                        Facility Status
                                    </label>

                                    <select
                                        id="facility_status"
                                        name="facility_status"
                                        value={
                                            formData.facility_status
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        className={inputClass}
                                    >
                                        <option value="">
                                            Select status
                                        </option>

                                        <option value="operation">
                                            Operational
                                        </option>

                                        <option value="construction">
                                            Construction
                                        </option>

                                        <option value="commissioning">
                                            Commissioning
                                        </option>

                                        <option value="shutting_down">
                                            Shutting Down
                                        </option>

                                        <option value="turnaround">
                                            Turnaround
                                        </option>

                                        <option value="maintenance">
                                            Maintenance
                                        </option>

                                        <option value="startup">
                                            Startup
                                        </option>

                                        <option value="other">
                                            Other
                                        </option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 border-t border-[#e3e9e5] pt-8">
                            {sectionTitle(
                                "ACTIVITY & DESCRIPTION",
                                "Describe the event naturally. This narrative will be used by the safety intelligence system."
                            )}

                            <div className="mb-7">
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
                                    value={
                                        formData.activity
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="What activity was taking place?"
                                    className={inputClass}
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 mb-7">
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
                                        value={
                                            formData.location
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Specific location"
                                        className={inputClass}
                                    />
                                </div>

                                <div>
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
                                        value={
                                            formData.equipment
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Equipment involved"
                                        className={inputClass}
                                    />
                                </div>
                            </div>

                            <div className="mb-7">
                                <label
                                    htmlFor="report_text"
                                    className={labelClass}
                                >
                                    Incident / Observation Description
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
                                    what happened, the sequence of
                                    events, surrounding conditions,
                                    and any other relevant facts.
                                </p>

                                <textarea
                                    id="report_text"
                                    name="report_text"
                                    value={
                                        formData.report_text
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    rows={8}
                                    placeholder="Describe what happened in your own words..."
                                    className={
                                        textareaClass
                                    }
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
                                    value={
                                        formData.actual_outcome
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    rows={4}
                                    placeholder="What actually happened as a result?"
                                    className={
                                        textareaClass
                                    }
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="post_incident_measures"
                                    className={labelClass}
                                >
                                    Immediate / Post-Incident Measures
                                </label>

                                <textarea
                                    id="post_incident_measures"
                                    name="post_incident_measures"
                                    value={
                                        formData.post_incident_measures
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    rows={4}
                                    placeholder="What immediate or corrective actions were taken?"
                                    className={
                                        textareaClass
                                    }
                                />
                            </div>
                        </div>

                        <div className="mt-8 border-t border-[#e3e9e5] pt-8">
                            {sectionTitle(
                                "FACILITY & FIRE DETAILS",
                                "Complete these fields where applicable."
                            )}

                            <div className="grid grid-cols-1 gap-7 sm:grid-cols-2">
                                <div>
                                    <label
                                        htmlFor="facility_shutdown"
                                        className={labelClass}
                                    >
                                        Facility Shutdown?
                                    </label>

                                    <select
                                        id="facility_shutdown"
                                        name="facility_shutdown"
                                        value={
                                            formData.facility_shutdown
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        className={inputClass}
                                    >
                                        {yesNoOptions}
                                    </select>
                                </div>

                                <div>
                                    <label
                                        htmlFor="facility_outage"
                                        className={labelClass}
                                    >
                                        Facility Outage?
                                    </label>

                                    <select
                                        id="facility_outage"
                                        name="facility_outage"
                                        value={
                                            formData.facility_outage
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        className={inputClass}
                                    >
                                        {yesNoOptions}
                                    </select>
                                </div>

                                <div>
                                    <label
                                        htmlFor="fire_duration_hours"
                                        className={labelClass}
                                    >
                                        Fire Duration — Hours
                                    </label>

                                    <input
                                        id="fire_duration_hours"
                                        name="fire_duration_hours"
                                        type="number"
                                        min="0"
                                        value={
                                            formData.fire_duration_hours
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        className={inputClass}
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="fire_duration_minutes"
                                        className={labelClass}
                                    >
                                        Fire Duration — Minutes
                                    </label>

                                    <input
                                        id="fire_duration_minutes"
                                        name="fire_duration_minutes"
                                        type="number"
                                        min="0"
                                        max="59"
                                        value={
                                            formData.fire_duration_minutes
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        className={inputClass}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 border-t border-[#e3e9e5] pt-8">
                            {sectionTitle(
                                "IMPACT & LOSSES",
                                "Record people impact, lost man-hours, and financial impact where known."
                            )}

                            <div className="mb-7">
                                <div
                                    className={
                                        labelClass
                                    }
                                >
                                    Fatalities
                                </div>

                                <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                                    <input
                                        name="fatalities_employees"
                                        type="number"
                                        min="0"
                                        value={
                                            formData.fatalities_employees
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Employees"
                                        className={
                                            inputClass
                                        }
                                    />

                                    <input
                                        name="fatalities_contractors"
                                        type="number"
                                        min="0"
                                        value={
                                            formData.fatalities_contractors
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Contractors"
                                        className={
                                            inputClass
                                        }
                                    />

                                    <input
                                        name="fatalities_others"
                                        type="number"
                                        min="0"
                                        value={
                                            formData.fatalities_others
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Others"
                                        className={
                                            inputClass
                                        }
                                    />
                                </div>
                            </div>

                            <div className="mb-7">
                                <div
                                    className={
                                        labelClass
                                    }
                                >
                                    Injuries
                                </div>

                                <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                                    <input
                                        name="injuries_employees"
                                        type="number"
                                        min="0"
                                        value={
                                            formData.injuries_employees
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Employees"
                                        className={
                                            inputClass
                                        }
                                    />

                                    <input
                                        name="injuries_contractors"
                                        type="number"
                                        min="0"
                                        value={
                                            formData.injuries_contractors
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Contractors"
                                        className={
                                            inputClass
                                        }
                                    />

                                    <input
                                        name="injuries_others"
                                        type="number"
                                        min="0"
                                        value={
                                            formData.injuries_others
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Others"
                                        className={
                                            inputClass
                                        }
                                    />
                                </div>
                            </div>

                            <div className="mb-7">
                                <div
                                    className={
                                        labelClass
                                    }
                                >
                                    Man-Hours Lost
                                </div>

                                <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                                    <input
                                        name="man_hours_employees"
                                        type="number"
                                        min="0"
                                        value={
                                            formData.man_hours_employees
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Employees"
                                        className={
                                            inputClass
                                        }
                                    />

                                    <input
                                        name="man_hours_contractors"
                                        type="number"
                                        min="0"
                                        value={
                                            formData.man_hours_contractors
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Contractors"
                                        className={
                                            inputClass
                                        }
                                    />

                                    <input
                                        name="man_hours_others"
                                        type="number"
                                        min="0"
                                        value={
                                            formData.man_hours_others
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Others"
                                        className={
                                            inputClass
                                        }
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-7 sm:grid-cols-2">
                                <div>
                                    <label
                                        htmlFor="direct_loss_in_lakhs"
                                        className={labelClass}
                                    >
                                        Direct Loss (₹ Lakhs)
                                    </label>

                                    <input
                                        id="direct_loss_in_lakhs"
                                        name="direct_loss_in_lakhs"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={
                                            formData.direct_loss_in_lakhs
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="0.00"
                                        className={
                                            inputClass
                                        }
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="indirect_loss"
                                        className={labelClass}
                                    >
                                        Indirect Loss
                                    </label>

                                    <input
                                        id="indirect_loss"
                                        name="indirect_loss"
                                        type="text"
                                        value={
                                            formData.indirect_loss
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Describe indirect losses"
                                        className={
                                            inputClass
                                        }
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 border-t border-[#e3e9e5] pt-8">
                            {sectionTitle(
                                "INVESTIGATION & HISTORY",
                                "Provide information about similar events and internal investigation status."
                            )}

                            <div className="mb-7">
                                <label
                                    htmlFor="similar_incident_occurred"
                                    className={labelClass}
                                >
                                    Has a Similar Incident Occurred?
                                </label>

                                <select
                                    id="similar_incident_occurred"
                                    name="similar_incident_occurred"
                                    value={
                                        formData.similar_incident_occurred
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    className={inputClass}
                                >
                                    {yesNoOptions}
                                </select>
                            </div>

                            <div className="mb-7">
                                <label
                                    htmlFor="similar_incident_description"
                                    className={labelClass}
                                >
                                    Similar Incident Details
                                </label>

                                <textarea
                                    id="similar_incident_description"
                                    name="similar_incident_description"
                                    value={
                                        formData.similar_incident_description
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    rows={4}
                                    placeholder="Describe any previous similar incident or reference..."
                                    className={
                                        textareaClass
                                    }
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-7 sm:grid-cols-2">
                                <div>
                                    <label
                                        htmlFor="internal_investigation_completed"
                                        className={
                                            labelClass
                                        }
                                    >
                                        Internal Investigation Completed?
                                    </label>

                                    <select
                                        id="internal_investigation_completed"
                                        name="internal_investigation_completed"
                                        value={
                                            formData.internal_investigation_completed
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        className={
                                            inputClass
                                        }
                                    >
                                        {yesNoOptions}
                                    </select>
                                </div>

                                <div>
                                    <label
                                        htmlFor="internal_investigation_completion_date"
                                        className={
                                            labelClass
                                        }
                                    >
                                        Investigation Completion Date
                                    </label>

                                    <input
                                        id="internal_investigation_completion_date"
                                        name="internal_investigation_completion_date"
                                        type="date"
                                        value={
                                            formData.internal_investigation_completion_date
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        className={
                                            inputClass
                                        }
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="internal_investigation_report_submitted_to_oisd"
                                        className={
                                            labelClass
                                        }
                                    >
                                        Investigation Report Submitted to OISD?
                                    </label>

                                    <select
                                        id="internal_investigation_report_submitted_to_oisd"
                                        name="internal_investigation_report_submitted_to_oisd"
                                        value={
                                            formData.internal_investigation_report_submitted_to_oisd
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        className={
                                            inputClass
                                        }
                                    >
                                        {yesNoOptions}
                                    </select>
                                </div>

                                <div>
                                    <label
                                        htmlFor="expected_oisd_submission_date"
                                        className={
                                            labelClass
                                        }
                                    >
                                        Expected OISD Submission Date
                                    </label>

                                    <input
                                        id="expected_oisd_submission_date"
                                        name="expected_oisd_submission_date"
                                        type="date"
                                        value={
                                            formData.expected_oisd_submission_date
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        className={
                                            inputClass
                                        }
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 border-t border-[#e3e9e5] pt-8">
                            {sectionTitle(
                                "CAUSE & AVOIDABILITY",
                                "Capture known investigation findings. These fields are optional where the cause has not yet been established."
                            )}

                            <div className="mb-7">
                                <div
                                    className={
                                        labelClass
                                    }
                                >
                                    Cause of Incident
                                </div>

                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    {causeOptions.map(
                                        (cause) => (
                                            <label
                                                key={
                                                    cause
                                                }
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
                                                    checked={formData.cause_of_incident.includes(
                                                        cause
                                                    )}
                                                    onChange={(
                                                        event
                                                    ) =>
                                                        handleCheckboxArrayChange(
                                                            "cause_of_incident",
                                                            cause,
                                                            event
                                                                .target
                                                                .checked
                                                        )
                                                    }
                                                />

                                                <span>
                                                    {
                                                        cause
                                                    }
                                                </span>
                                            </label>
                                        )
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 mb-7">
                                <div>
                                    <label
                                        htmlFor="leakage_cause"
                                        className={
                                            labelClass
                                        }
                                    >
                                        Leakage Cause
                                    </label>

                                    <select
                                        id="leakage_cause"
                                        name="leakage_cause"
                                        value={formData.leakage_cause}
                                        onChange={handleChange}
                                        className={inputClass}
                                    >
                                        <option value="">Select leakage cause</option>

                                        <option value="weld_leak">Weld Leak</option>
                                        <option value="flange_gland_leak">Flange / Gland Leak</option>
                                        <option value="rotary_equipment">Rotary Equipment</option>
                                        <option value="metallurgical_failure">Metallurgical Failure</option>
                                        <option value="improper_operation">Improper Operation</option>
                                        <option value="improper_maintenance">Improper Maintenance</option>
                                        <option value="normal_operation_venting_draining">
                                            Normal Operation — Venting / Draining
                                        </option>
                                        <option value="other">Other</option>
                                        <option value="not_applicable">Not Applicable</option>
                                    </select>
                                </div>

                                <div>
                                    <label
                                        htmlFor="ignition_cause"
                                        className={
                                            labelClass
                                        }
                                    >
                                        Ignition Cause
                                    </label>

                                    <select
                                        id="ignition_cause"
                                        name="ignition_cause"
                                        value={formData.ignition_cause}
                                        onChange={handleChange}
                                        className={inputClass}
                                    >
                                        <option value="">Select ignition cause</option>

                                        <option value="hot_work">Hot Work</option>
                                        <option value="furnace_flare">Furnace / Flare</option>
                                        <option value="auto_ignition">Auto Ignition</option>
                                        <option value="loose_electrical_connection">
                                            Loose Electrical Connection
                                        </option>
                                        <option value="hot_surface">Hot Surface</option>
                                        <option value="static_electricity">Static Electricity</option>
                                        <option value="hammering_falling_object">
                                            Hammering / Falling Object
                                        </option>
                                        <option value="friction">Friction</option>
                                        <option value="lightning">Lightning</option>
                                        <option value="other">Other</option>
                                        <option value="not_applicable">Not Applicable</option>
                                    </select>
                                </div>
                            </div>

                            <div className="mb-7">
                                <label
                                    htmlFor="leakage_cause_details"
                                    className={
                                        labelClass
                                    }
                                >
                                    Leakage Cause Details
                                </label>

                                <textarea
                                    id="leakage_cause_details"
                                    name="leakage_cause_details"
                                    value={
                                        formData.leakage_cause_details
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    rows={3}
                                    className={
                                        textareaClass
                                    }
                                />
                            </div>

                            <div className="mb-7">
                                <label
                                    htmlFor="ignition_cause_details"
                                    className={
                                        labelClass
                                    }
                                >
                                    Ignition Cause Details
                                </label>

                                <textarea
                                    id="ignition_cause_details"
                                    name="ignition_cause_details"
                                    value={
                                        formData.ignition_cause_details
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    rows={3}
                                    className={
                                        textareaClass
                                    }
                                />
                            </div>

                            <div className="mb-7">
                                <label
                                    htmlFor="avoidable"
                                    className={
                                        labelClass
                                    }
                                >
                                    Was the Incident Avoidable?
                                </label>

                                <select
                                    id="avoidable"
                                    name="avoidable"
                                    value={
                                        formData.avoidable
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    className={
                                        inputClass
                                    }
                                >
                                    {yesNoOptions}
                                </select>
                            </div>

                            <div>
                                <div
                                    className={
                                        labelClass
                                    }
                                >
                                    Avoidance Factors
                                </div>

                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    {avoidanceOptions.map(
                                        (factor) => (
                                            <label
                                                key={
                                                    factor
                                                }
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
                                                    checked={formData.avoidance_factors.includes(
                                                        factor
                                                    )}
                                                    onChange={(
                                                        event
                                                    ) =>
                                                        handleCheckboxArrayChange(
                                                            "avoidance_factors",
                                                            factor,
                                                            event
                                                                .target
                                                                .checked
                                                        )
                                                    }
                                                />

                                                <span>
                                                    {
                                                        factor
                                                    }
                                                </span>
                                            </label>
                                        )
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 border-t border-[#e3e9e5] pt-8">
                            {sectionTitle(
                                "REPORT LANGUAGE",
                                "Select the language style used in the submitted narrative."
                            )}

                            <div>
                                <label
                                    htmlFor="language_style"
                                    className={
                                        labelClass
                                    }
                                >
                                    Language Style
                                    {required}
                                </label>

                                <select
                                    id="language_style"
                                    name="language_style"
                                    value={
                                        formData.language_style
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    className={
                                        inputClass
                                    }
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
                        </div>

                        <div className="mt-8 border-t border-[#e3e9e5] pt-8">
                            {sectionTitle(
                                "SUPPORTING EVIDENCE",
                                "Upload photos, diagrams, reports, or other supporting evidence."
                            )}

                            <p
                                className="
                                    mb-3
                                    text-[#718078]
                                    text-[11px]
                                    leading-[1.6]
                                "
                            >
                                Optional — maximum 5 files,
                                10 MB each.
                            </p>

                            <input
                                id="report-attachments"
                                type="file"
                                multiple
                                accept=".pdf,.jpg,.jpeg,.png,.webp"
                                onChange={
                                    handleAttachmentChange
                                }
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
                                        (
                                            file,
                                            index
                                        ) => (
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
                                                    {
                                                        file.name
                                                    }
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
                                                        (1024 *
                                                            1024)
                                                    ).toFixed(
                                                        2
                                                    )}{" "}
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
                                    onClick={() =>
                                        navigate(
                                            "/"
                                        )
                                    }
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
                                    ← Return to
                                    dashboard
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
                            Your report will be
                            reviewed by the
                            administrator before it
                            becomes an active safety
                            case.
                        </p>
                    </div>
                </form>

                <button
                    type="button"
                    onClick={() =>
                        navigate("/")
                    }
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