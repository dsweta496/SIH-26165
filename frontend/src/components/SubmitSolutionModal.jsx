import React, { useState } from "react";

import {
    createSolution,
    resubmitSolution,
} from "../api/solution.api";

const generateSolutionId = () => {
    const random = Math.random()
        .toString(36)
        .slice(2, 8)
        .toUpperCase();

    return `SOL-${random}`;
};

const SubmitSolutionModal = ({
    open,
    onClose,
    proposal,
    report,
    team,
    latestSolution,
    onSuccess,
}) => {
    const [solutionText, setSolutionText] =
        useState("");

    const [attachments, setAttachments] =
        useState([]);

    const [submitting, setSubmitting] =
        useState(false);

    const [error, setError] =
        useState("");

    if (!open) {
        return null;
    }

    const isResubmission =
        latestSolution?.status ===
        "changes_requested";

    const handleFileChange = (event) => {
        const selectedFiles =
            Array.from(event.target.files || []);

        if (
            attachments.length +
                selectedFiles.length >
            5
        ) {
            setError(
                "You can upload a maximum of 5 attachments."
            );

            event.target.value = "";

            return;
        }

        setAttachments((current) => [
            ...current,
            ...selectedFiles,
        ]);

        setError("");

        event.target.value = "";
    };

    const removeAttachment = (indexToRemove) => {
        setAttachments((current) =>
            current.filter(
                (_, index) =>
                    index !== indexToRemove
            )
        );
    };

    const resetForm = () => {
        setSolutionText("");
        setAttachments([]);
        setError("");
    };

    const handleClose = () => {
        if (submitting) {
            return;
        }

        resetForm();
        onClose();
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (submitting) {
            return;
        }

        try {
            setSubmitting(true);
            setError("");

            if (!proposal || !report || !team) {
                setError(
                    "Missing proposal, report or team information."
                );
                return;
            }

            /*
             * A resubmission MUST have the previous
             * solution's solution_id.
             */
            if (
                isResubmission &&
                !latestSolution?.solution_id
            ) {
                setError(
                    "Previous solution information is missing. Please refresh the case and try again."
                );

                return;
            }

            const formData = new FormData();

            /*
             * Every submission gets a NEW solution ID.
             *
             * For a resubmission, the previous solution_id
             * is used only in the URL. The backend also
             * requires the NEW solution_id in req.body.
             */
            formData.append(
                "solution_id",
                generateSolutionId()
            );

            formData.append(
                "proposal_id",
                proposal.proposal_id
            );

            formData.append(
                "report_id",
                report.report_id
            );

            formData.append(
                "team_id",
                team.team_id
            );

            formData.append(
                "solution_text",
                solutionText.trim()
            );

            attachments.forEach((file) => {
                formData.append(
                    "attachments",
                    file,
                    file.name
                );
            });

            /*
             * CYCLE 2+
             *
             * If the latest solution was sent back
             * for changes, resubmit against THAT
             * solution ID.
             */
            if (isResubmission) {
                await resubmitSolution(
                    latestSolution.solution_id,
                    formData
                );
            } else {
                /*
                 * CYCLE 1
                 */
                await createSolution(formData);
            }

            /*
             * Let the parent refresh the case /
             * solution list.
             */
            if (onSuccess) {
                await onSuccess();
            }

            resetForm();
            onClose();
        } catch (err) {
            console.error(
                "Solution submission error:",
                err
            );

            setError(
                err?.response?.data?.message ||
                    err?.response?.data?.error ||
                    "Failed to submit solution."
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div
            className="
                fixed
                inset-0
                z-[120]
                flex
                items-center
                justify-center
                p-4
                bg-black/40
            "
        >
            <div
                className="
                    w-full
                    max-w-2xl
                    max-h-[90vh]
                    overflow-y-auto
                    bg-white
                    rounded-[8px]
                    shadow-[0_25px_70px_rgba(0,0,0,0.2)]
                "
            >
                <div
                    className="
                        flex
                        items-center
                        justify-between
                        px-6
                        py-5
                        border-b
                    "
                >
                    <div>
                        <h2
                            className="
                                text-lg
                                font-extrabold
                                text-[#17211b]
                            "
                        >
                            {isResubmission
                                ? "Resubmit Solution"
                                : "Submit Solution"}
                        </h2>

                        {isResubmission && (
                            <p
                                className="
                                    mt-1
                                    text-xs
                                    text-[#9a6700]
                                "
                            >
                                Admin requested changes to
                                your previous solution.
                            </p>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={submitting}
                    >
                        ✕
                    </button>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="p-6"
                >
                    {error && (
                        <div
                            className="
                                mb-5
                                p-3
                                rounded
                                bg-red-50
                                border
                                border-red-200
                                text-red-700
                                text-sm
                            "
                        >
                            {error}
                        </div>
                    )}

                    {isResubmission &&
                        latestSolution?.admin_feedback && (
                            <div
                                className="
                                    mb-5
                                    p-4
                                    rounded-[6px]
                                    bg-[#fff7e6]
                                    border
                                    border-[#f0dfb8]
                                "
                            >
                                <p
                                    className="
                                        text-[#9a6700]
                                        text-[9px]
                                        font-extrabold
                                        tracking-[0.12em]
                                    "
                                >
                                    ADMIN FEEDBACK
                                </p>

                                <p
                                    className="
                                        mt-2
                                        text-[#72551a]
                                        text-sm
                                        whitespace-pre-wrap
                                    "
                                >
                                    {
                                        latestSolution.admin_feedback
                                    }
                                </p>
                            </div>
                        )}

                    <div>
                        <label
                            className="
                                block
                                mb-2
                                text-sm
                                font-bold
                            "
                        >
                            {isResubmission
                                ? "Updated Solution"
                                : "Solution Description"}
                        </label>

                        <textarea
                            rows={10}
                            value={solutionText}
                            onChange={(event) =>
                                setSolutionText(
                                    event.target.value
                                )
                            }
                            required
                            disabled={submitting}
                            className="
                                w-full
                                p-3
                                border
                                border-[#dce4de]
                                rounded-[6px]
                                resize-none
                            "
                            placeholder={
                                isResubmission
                                    ? "Describe the updated solution based on the admin feedback..."
                                    : "Describe your proposed solution..."
                            }
                        />
                    </div>

                    <div className="mt-6">
                        <label
                            className="
                                block
                                mb-2
                                text-sm
                                font-bold
                            "
                        >
                            Supporting Documents
                        </label>

                        <input
                            type="file"
                            multiple
                            accept=".pdf,.jpg,.jpeg,.png,.webp"
                            onChange={handleFileChange}
                            disabled={submitting}
                            className="
                                block
                                w-full
                                text-sm
                                text-[#59655e]
                                border
                                border-[#dce4de]
                                rounded-[6px]
                                p-3
                                cursor-pointer
                            "
                        />

                        <p
                            className="
                                mt-2
                                text-[11px]
                                text-[#718078]
                            "
                        >
                            Upload up to 5 files. PDF,
                            JPG, PNG and WebP are supported.
                        </p>

                        {attachments.length > 0 && (
                            <div className="mt-4 space-y-2">
                                {attachments.map(
                                    (file, index) => (
                                        <div
                                            key={`${file.name}-${index}`}
                                            className="
                                                flex
                                                items-center
                                                justify-between
                                                gap-3
                                                p-3
                                                rounded-[6px]
                                                bg-[#f5f8f5]
                                                border
                                                border-[#dce4de]
                                            "
                                        >
                                            <div
                                                className="
                                                    min-w-0
                                                "
                                            >
                                                <p
                                                    className="
                                                        text-sm
                                                        font-semibold
                                                        text-[#17211b]
                                                        truncate
                                                    "
                                                >
                                                    {file.name}
                                                </p>

                                                <p
                                                    className="
                                                        text-[10px]
                                                        text-[#718078]
                                                    "
                                                >
                                                    {(
                                                        file.size /
                                                        1024 /
                                                        1024
                                                    ).toFixed(
                                                        2
                                                    )}{" "}
                                                    MB
                                                </p>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    removeAttachment(
                                                        index
                                                    )
                                                }
                                                disabled={
                                                    submitting
                                                }
                                                className="
                                                    shrink-0
                                                    text-red-600
                                                    text-xs
                                                    font-bold
                                                "
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    )
                                )}
                            </div>
                        )}

                        <p
                            className="
                                mt-2
                                text-[10px]
                                text-[#718078]
                            "
                        >
                            {attachments.length}/5
                            attachments
                        </p>
                    </div>

                    <div
                        className="
                            mt-6
                            flex
                            justify-end
                            gap-3
                        "
                    >
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={submitting}
                            className="
                                px-4
                                py-2
                                border
                                rounded-[4px]
                            "
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="
                                px-5
                                py-2
                                rounded-[4px]
                                bg-[#087542]
                                text-white
                                font-bold
                            "
                        >
                            {submitting
                                ? "Submitting..."
                                : isResubmission
                                    ? "Resubmit Solution"
                                    : "Submit Solution"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SubmitSolutionModal;