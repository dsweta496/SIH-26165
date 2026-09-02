import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../../api/axios";

function TeamSignup() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const token = searchParams.get("token");

    const [invitation, setInvitation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    useEffect(() => {
        const verifyInvitation = async () => {
            if (!token) {
                setError("Invalid or missing invitation token.");
                setLoading(false);
                return;
            }

            try {
                const response = await api.get(
                    `/invitations/verify?token=${encodeURIComponent(token)}`
                );

                const invitationData =
                    response?.data?.data || response?.data;

                setInvitation(invitationData);

                setFormData((previous) => ({
                    ...previous,
                    email:
                        invitationData?.team_leader_email || "",
                }));
            } catch (err) {
                setError(
                    err?.response?.data?.message ||
                        "This invitation is invalid or has expired."
                );
            } finally {
                setLoading(false);
            }
        };

        verifyInvitation();
    }, [token]);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        if (!token) {
            setError("Invalid invitation token.");
            return;
        }

        try {
            setSubmitting(true);

            await api.post("/auth/register/invited-team", {
                token,
                name: formData.name,
                email: formData.email,
                password: formData.password,
            });

            navigate("/login", {
                replace: true,
                state: {
                    message:
                        "Team account created successfully. Please log in.",
                },
            });
        } catch (err) {
            setError(
                err?.response?.data?.message ||
                    "Unable to create the team account."
            );
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
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
                "
            >
                <p className="text-white text-sm font-semibold">
                    Verifying invitation...
                </p>
            </div>
        );
    }

    if (error && !invitation) {
        return (
            <div
                className="
                    min-h-screen
                    flex
                    items-center
                    justify-center

                    px-6

                    bg-[#003b2a]

                    bg-[linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(135deg,#003b2a_0%,#00583e_48%,#001f16_100%)]
                    bg-[size:48px_48px,48px_48px,100%_100%]
                "
            >
                <div
                    className="
                        w-full
                        max-w-md

                        bg-white

                        border
                        border-[#e2e9e4]

                        rounded-[8px]

                        p-8

                        text-center
                    "
                >
                    <h1 className="text-[#33423a] text-xl font-extrabold">
                        Invitation unavailable
                    </h1>

                    <p className="mt-3 text-[#718078] text-sm">
                        {error}
                    </p>

                    <button
                        type="button"
                        onClick={() => navigate("/login")}
                        className="
                            mt-6

                            px-5
                            py-3

                            rounded-[5px]

                            bg-[#087542]
                            text-white

                            text-sm
                            font-bold
                        "
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div
            className="
                min-h-screen

                flex
                items-center
                justify-center

                px-6
                py-10

                bg-[#003b2a]

                bg-[linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(135deg,#003b2a_0%,#00583e_48%,#001f16_100%)]
                bg-[size:48px_48px,48px_48px,100%_100%]
            "
        >
            <div
                className="
                    w-full
                    max-w-lg

                    bg-white

                    border
                    border-[#e2e9e4]

                    rounded-[8px]

                    p-8
                "
            >
                <div>
                    <p
                        className="
                            text-[#087542]
                            text-[10px]
                            font-extrabold
                            tracking-[0.12em]
                        "
                    >
                        OIL SIF
                    </p>

                    <h1
                        className="
                            mt-2

                            text-[#33423a]
                            text-2xl
                            font-extrabold
                        "
                    >
                        Team Registration
                    </h1>

                    <p className="mt-2 text-[#718078] text-sm">
                        Complete your registration to activate the accepted
                        team proposal.
                    </p>
                </div>

                {invitation && (
                    <div
                        className="
                            mt-6

                            p-4

                            rounded-[5px]

                            border
                            border-[#e2e9e4]

                            bg-[#f9fbfa]
                        "
                    >
                        <p
                            className="
                                text-[#718078]
                                text-[10px]
                                font-extrabold
                                tracking-[0.12em]
                            "
                        >
                            INVITATION DETAILS
                        </p>

                        <div className="mt-3 space-y-2">
                            <div>
                                <span className="text-[#718078] text-xs">
                                    Team
                                </span>

                                <p className="text-[#33423a] text-sm font-bold">
                                    {invitation.team_name}
                                </p>
                            </div>

                            <div>
                                <span className="text-[#718078] text-xs">
                                    Team Leader Email
                                </span>

                                <p className="text-[#33423a] text-sm font-bold">
                                    {invitation.team_leader_email}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <form
                    onSubmit={handleSubmit}
                    className="mt-6 space-y-5"
                >
                    <div>
                        <label
                            className="
                                block
                                mb-2

                                text-[#718078]
                                text-[10px]
                                font-extrabold
                                tracking-[0.12em]
                            "
                        >
                            TEAM NAME
                        </label>

                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="
                                w-full

                                px-4
                                py-3

                                rounded-[5px]

                                border
                                border-[#dce5df]

                                outline-none

                                text-[#33423a]
                                text-sm

                                focus:border-[#087542]
                            "
                            placeholder="Enter team name"
                        />
                    </div>

                    <div>
                        <label
                            className="
                                block
                                mb-2

                                text-[#718078]
                                text-[10px]
                                font-extrabold
                                tracking-[0.12em]
                            "
                        >
                            EMAIL
                        </label>

                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            readOnly
                            required
                            className="
                                w-full

                                px-4
                                py-3

                                rounded-[5px]

                                border
                                border-[#dce5df]

                                outline-none

                                bg-[#f3f6f4]

                                text-[#718078]
                                text-sm

                                cursor-not-allowed
                            "
                        />
                    </div>

                    <div>
                        <label
                            className="
                                block
                                mb-2

                                text-[#718078]
                                text-[10px]
                                font-extrabold
                                tracking-[0.12em]
                            "
                        >
                            PASSWORD
                        </label>

                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            minLength={6}
                            className="
                                w-full

                                px-4
                                py-3

                                rounded-[5px]

                                border
                                border-[#dce5df]

                                outline-none

                                text-[#33423a]
                                text-sm

                                focus:border-[#087542]
                            "
                            placeholder="Create password"
                        />
                    </div>

                    <div>
                        <label
                            className="
                                block
                                mb-2

                                text-[#718078]
                                text-[10px]
                                font-extrabold
                                tracking-[0.12em]
                            "
                        >
                            CONFIRM PASSWORD
                        </label>

                        <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                            minLength={6}
                            className="
                                w-full

                                px-4
                                py-3

                                rounded-[5px]

                                border
                                border-[#dce5df]

                                outline-none

                                text-[#33423a]
                                text-sm

                                focus:border-[#087542]
                            "
                            placeholder="Confirm password"
                        />
                    </div>

                    {error && (
                        <div
                            className="
                                p-3

                                rounded-[5px]

                                border
                                border-red-200

                                bg-red-50

                                text-red-600
                                text-sm
                            "
                        >
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={submitting}
                        className="
                            w-full

                            py-3

                            rounded-[5px]

                            bg-[#087542]
                            text-white

                            text-sm
                            font-extrabold

                            disabled:opacity-60
                        "
                    >
                        {submitting
                            ? "Creating Team..."
                            : "Create Team Account"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default TeamSignup;