import React, { useState } from "react";

import { createSolution } from "../api/solution.api";


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


    const handleSubmit = async (event) => {

        event.preventDefault();

        try {

            setSubmitting(true);
            setError("");

            if (
                !proposal ||
                !report ||
                !team
            ) {
                setError(
                    "Missing proposal, report or team information."
                );
                return;
            }

            const solutionId =
                generateSolutionId();

            const formData =
                new FormData();

            formData.append(
                "solution_id",
                solutionId
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
                solutionText
            );

            attachments.forEach((file) => {
                formData.append(
                    "attachments",
                    file
                );
            });

            await createSolution(formData);

            if (onSuccess) {
                await onSuccess();
            }

            setSolutionText("");
            setAttachments([]);

            onClose();

        } catch (err) {

            console.error(err);

            setError(
                err?.response?.data?.message ||
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

                    <h2
                        className="
                            text-lg
                            font-extrabold
                            text-[#17211b]
                        "
                    >
                        Submit Solution
                    </h2>

                    <button
                        type="button"
                        onClick={onClose}
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


                    <div>

                        <label
                            className="
                                block
                                mb-2
                                text-sm
                                font-bold
                            "
                        >
                            Solution Description
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
                            className="
                                w-full
                                p-3
                                border
                                border-[#dce4de]
                                rounded-[6px]
                                resize-none
                            "
                            placeholder="Describe your proposed solution..."
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
                            Upload up to 5 files. PDF, JPG,
                            PNG and WebP are supported.
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
                                                    ).toFixed(2)}
                                                    {" "}MB
                                                </p>

                                            </div>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    removeAttachment(
                                                        index
                                                    )
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
                            {attachments.length}/5 attachments
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
                            onClick={onClose}
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
                                : "Submit Solution"}
                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
};


export default SubmitSolutionModal;