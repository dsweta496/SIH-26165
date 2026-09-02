import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { login } from "../../api/auth.api";

function Login() {
    const navigate = useNavigate();

    const [loginType, setLoginType] =
        useState("admin");

    const [email, setEmail] =
        useState("");

    const [password, setPassword] =
        useState("");

    const [showPassword, setShowPassword] =
        useState(false);

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");

        if (!email.trim() || !password) {
            setError(
                "Please enter your email and password."
            );

            return;
        }

        try {
            setLoading(true);

            const response = await login({
                email: email.trim(),
                password,
            });

            const user = response?.data?.user;
            const token = response?.data?.token;

            if (!user || !token) {
                throw new Error(
                    "Invalid login response."
                );
            }

            /*
             * The backend determines the actual role.
             * The toggle only determines which type
             * of account the user intended to access.
             */

            if (user.role !== loginType) {
                setError(
                    `This account is registered as ${
                        user.role === "admin"
                            ? "Admin"
                            : "Team"
                    }. Please select the correct login type.`
                );

                return;
            }

            /*
             * Store authentication data.
             */

            localStorage.setItem(
                "token",
                token
            );

            localStorage.setItem(
                "user",
                JSON.stringify(user)
            );

            /*
             * Redirect based on actual backend role.
             */

            if (user.role === "admin") {
                navigate("/admin");
            } else if (user.role === "team") {
                navigate("/team");
            } else {
                setError(
                    "Your account has an invalid role."
                );
            }
        } catch (err) {
            console.error(
                "Login error:",
                err
            );

            const message =
                err?.response?.data?.message ||
                err?.message ||
                "Unable to login. Please check your credentials.";

            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="
                min-h-screen
                max-w-screen
                flex
                items-center
                justify-center

                relative
                overflow-hidden

                px-5
                py-10

                bg-gradient-to-br
                from-[#031b12]
                via-[#063b25]
                to-[#010b07]
            "
        >

            {/* ================================================
                BACKGROUND DETAILS
            ================================================= */}

            <div
                className="
                    pointer-events-none

                    absolute
                    inset-0

                    opacity-[0.035]

                    bg-[linear-gradient(90deg,rgba(255,255,255,0.8)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.8)_1px,transparent_1px)]

                    bg-[size:55px_55px]
                "
            />

            <div
                className="
                    pointer-events-none

                    absolute

                    -top-[180px]
                    -right-[180px]

                    w-[500px]
                    h-[500px]

                    rounded-full

                    bg-[#087542]/20

                    blur-[100px]
                "
            />

            <div
                className="
                    pointer-events-none

                    absolute

                    -bottom-[220px]
                    -left-[180px]

                    w-[500px]
                    h-[500px]

                    rounded-full

                    bg-[#0b7548]/15

                    blur-[110px]
                "
            />


            {/* ================================================
                LOGIN CARD
            ================================================= */}

            <div
                className="
                    relative
                    z-10

                    w-full
                    max-w-[455px]

                    overflow-hidden

                    rounded-[8px]

                    bg-white

                    shadow-[0_35px_100px_rgba(0,0,0,0.4)]
                "
            >

                {/* ============================================
                    CARD HEADER
                ============================================= */}

                <div
                    className="
                        px-8
                        pt-9
                        pb-7

                        sm:px-10
                        sm:pt-10
                    "
                >
                    {/* Heading */}

                    <div className="mt-1">

                        <p
                            className="
                                mb-2

                                text-[#087542]

                                text-[9px]
                                font-extrabold

                                tracking-[0.2em]
                            "
                        >
                            SECURE ACCESS
                        </p>

                        <h1
                            className="
                                text-[#17211b]

                                text-[36px]
                                leading-none

                                font-extrabold

                                tracking-[-0.055em]
                            "
                        >
                            Welcome back.
                        </h1>

                        <p
                            className="
                                mt-3

                                text-[#718078]

                                text-[13px]
                                leading-[1.6]
                            "
                        >
                            Sign in to access the
                            Safety Intelligence Framework.
                        </p>

                    </div>

                </div>


                {/* ============================================
                    LOGIN FORM
                ============================================= */}

                <form
                    onSubmit={handleSubmit}
                    className="
                        px-8
                        pb-9

                        sm:px-10
                    "
                >

                    {/* Account type */}

                    <div>

                        <label
                            className="
                                block

                                mb-2

                                text-[#59655e]

                                text-[9px]
                                font-extrabold

                                tracking-[0.14em]
                            "
                        >
                            ACCOUNT TYPE
                        </label>


                        <div
                            className="
                                grid
                                grid-cols-2

                                p-1

                                rounded-[4px]

                                bg-[#eef3ef]

                                border
                                border-[#dce4de]
                            "
                        >

                            <button
                                type="button"
                                onClick={() => {
                                    setLoginType("admin");
                                    setError("");
                                }}
                                className={`
                                    py-3

                                    rounded-[3px]

                                    border-0

                                    text-[11px]
                                    font-extrabold

                                    cursor-pointer

                                    transition

                                    ${
                                        loginType ===
                                        "admin"
                                            ? `
                                                bg-white
                                                text-[#087542]
                                                shadow-[0_2px_8px_rgba(20,50,35,0.1)]
                                            `
                                            : `
                                                bg-transparent
                                                text-[#718078]
                                            `
                                    }
                                `}
                            >
                                Admin
                            </button>


                            <button
                                type="button"
                                onClick={() => {
                                    setLoginType("team");
                                    setError("");
                                }}
                                className={`
                                    py-3

                                    rounded-[3px]

                                    border-0

                                    text-[11px]
                                    font-extrabold

                                    cursor-pointer

                                    transition

                                    ${
                                        loginType ===
                                        "team"
                                            ? `
                                                bg-white
                                                text-[#087542]
                                                shadow-[0_2px_8px_rgba(20,50,35,0.1)]
                                            `
                                            : `
                                                bg-transparent
                                                text-[#718078]
                                            `
                                    }
                                `}
                            >
                                Team
                            </button>

                        </div>

                    </div>


                    {/* Email */}

                    <div className="mt-6">

                        <label
                            htmlFor="email"
                            className="
                                block

                                mb-2

                                text-[#59655e]

                                text-[9px]
                                font-extrabold

                                tracking-[0.14em]
                            "
                        >
                            EMAIL ADDRESS
                        </label>

                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(event) =>
                                setEmail(
                                    event.target.value
                                )
                            }
                            placeholder="Enter your email"
                            autoComplete="email"
                            className="
                                w-full

                                box-border

                                px-4
                                py-[13px]

                                rounded-[3px]

                                border
                                border-[#d5dfd8]

                                bg-[#fbfcfb]

                                text-[#17211b]

                                text-[13px]

                                outline-none

                                transition

                                placeholder:text-[#a2aca6]

                                focus:border-[#087542]
                                focus:ring-2
                                focus:ring-[#087542]/10
                            "
                        />

                    </div>


                    {/* Password */}

                    <div className="mt-5">

                        <label
                            htmlFor="password"
                            className="
                                block

                                mb-2

                                text-[#59655e]

                                text-[9px]
                                font-extrabold

                                tracking-[0.14em]
                            "
                        >
                            PASSWORD
                        </label>


                        <div className="relative">

                            <input
                                id="password"
                                type={
                                    showPassword
                                        ? "text"
                                        : "password"
                                }
                                value={password}
                                onChange={(event) =>
                                    setPassword(
                                        event.target.value
                                    )
                                }
                                placeholder="Enter your password"
                                autoComplete="current-password"
                                className="
                                    w-full

                                    box-border

                                    px-4
                                    py-[13px]
                                    pr-12

                                    rounded-[3px]

                                    border
                                    border-[#d5dfd8]

                                    bg-[#fbfcfb]

                                    text-[#17211b]

                                    text-[13px]

                                    outline-none

                                    transition

                                    placeholder:text-[#a2aca6]

                                    focus:border-[#087542]
                                    focus:ring-2
                                    focus:ring-[#087542]/10
                                "
                            />


                            <button
                                type="button"
                                onClick={() =>
                                    setShowPassword(
                                        (value) =>
                                            !value
                                    )
                                }
                                className="
                                    absolute
                                    right-0
                                    top-0

                                    h-full

                                    w-11

                                    flex
                                    items-center
                                    justify-center

                                    border-0
                                    bg-transparent

                                    text-[#718078]

                                    text-[14px]

                                    cursor-pointer

                                    hover:text-[#087542]
                                "
                                aria-label={
                                    showPassword
                                        ? "Hide password"
                                        : "Show password"
                                }
                            >
                                {showPassword
                                    ? "◉"
                                    : "◌"}
                            </button>

                        </div>

                    </div>


                    {/* Error */}

                    {error && (
                        <div
                            className="
                                mt-5

                                px-4
                                py-3

                                rounded-[3px]

                                border
                                border-[#f1cccc]

                                bg-[#fff5f5]

                                text-[#b32626]

                                text-[11px]
                                leading-[1.5]
                            "
                        >
                            {error}
                        </div>
                    )}


                    {/* Login */}

                    <button
                        type="submit"
                        disabled={loading}
                        className="
                            w-full

                            mt-7

                            flex
                            items-center
                            justify-center

                            min-h-[48px]

                            rounded-[3px]

                            border-0

                            bg-[#087542]

                            text-white

                            text-[12px]
                            font-extrabold

                            tracking-[0.04em]

                            cursor-pointer

                            transition

                            hover:bg-[#065c38]
                            hover:-translate-y-px

                            disabled:cursor-not-allowed
                            disabled:opacity-60
                            disabled:hover:translate-y-0
                        "
                    >
                        {loading ? (
                            <span
                                className="
                                    flex
                                    items-center
                                    gap-2
                                "
                            >
                                <span
                                    className="
                                        w-4
                                        h-4

                                        rounded-full

                                        border-2
                                        border-white/30
                                        border-t-white

                                        animate-spin
                                    "
                                />

                                Signing in...
                            </span>
                        ) : (
                            <>
                                Sign in

                                <span className="ml-3 text-[17px]">
                                    →
                                </span>
                            </>
                        )}
                    </button>


                    {/* Back */}

                    <button
                        type="button"
                        onClick={() =>
                            navigate("/")
                        }
                        className="
                            w-full

                            mt-5

                            border-0
                            bg-transparent

                            text-[#718078]

                            text-[11px]
                            font-semibold

                            cursor-pointer

                            hover:text-[#087542]
                        "
                    >
                        ← Back to dashboard
                    </button>

                </form>

            </div>

        </div>
    );
}

export default Login;