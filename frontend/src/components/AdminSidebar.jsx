import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

function AdminSidebar() {
    const navigate = useNavigate();
    const location = useLocation();

    const [mobileOpen, setMobileOpen] =
        useState(false);

    const navigationItems = [
        {
            label: "Overview",
            path: "/admin",
            icon: "▦",
        },
        {
            label: "Review Queue",
            path: "/admin/review",
            icon: "◉",
        },
        {
            label: "Active Cases",
            path: "/admin/cases",
            icon: "⌁",
        },
        {
            label: "Pending Solutions",
            path: "/admin/solutions",
            icon: "✓",
        },
        {
            label: "Past Case History",
            path: "/admin/history",
            icon: "◷",
        },
    ];


    const handleNavigation = (path) => {
        setMobileOpen(false);
        navigate(path);
    };


    const handleDashboard = () => {
        setMobileOpen(false);
        navigate("/");
    };


    const isActive = (path) => {
        if (path === "/admin") {
            return location.pathname === "/admin";
        }

        return location.pathname.startsWith(path);
    };


    return (
        <>
            {/* =================================================
                MOBILE MENU BUTTON
            ================================================= */}

            <button
                type="button"
                onClick={() =>
                    setMobileOpen(
                        (value) => !value
                    )
                }
                className="
                    fixed
                    left-4
                    top-[92px]

                    z-50

                    flex
                    h-10
                    w-10

                    items-center
                    justify-center

                    rounded-[4px]

                    border
                    border-[#d9e2dc]

                    bg-white

                    text-[#087542]

                    shadow-[0_5px_20px_rgba(20,50,35,0.1)]

                    lg:hidden

                    cursor-pointer
                "
                aria-label="Open admin navigation"
            >
                <span className="text-[18px]">
                    {mobileOpen ? "×" : "☰"}
                </span>
            </button>


            {/* =================================================
                MOBILE BACKDROP
            ================================================= */}

            {mobileOpen && (
                <button
                    type="button"
                    aria-label="Close navigation"
                    onClick={() =>
                        setMobileOpen(false)
                    }
                    className="
                        fixed
                        inset-0

                        z-40

                        border-0

                        bg-black/35

                        lg:hidden
                    "
                />
            )}


            {/* =================================================
                SIDEBAR
            ================================================= */}

            <aside
                className={`
                    fixed

                    left-0

                    top-[80px]
                    bottom-[100px]

                    z-50

                    w-[265px]

                    flex
                    flex-col

                    border-r
                    border-[#dce4de]

                    bg-[#f7faf8]

                    shadow-[10px_0_35px_rgba(20,50,35,0.06)]

                    transition-transform
                    duration-300

                    lg:sticky
                    lg:top-[80px]
                    lg:h-[calc(100vh-80px)]
                    lg:translate-x-0
                    lg:shadow-none

                    ${mobileOpen
                        ? "translate-x-0"
                        : "-translate-x-full"
                    }
                `}
            >

                {/* =================================================
                    SIDEBAR HEADER
                ================================================= */}

                <div
                    className="
                        px-7
                        pt-8
                        pb-7

                        border-b
                        border-[#dce4de]
                    "
                >
                    <p
                        className="
                            mb-2

                            text-[#087542]

                            text-[9px]
                            font-extrabold

                            tracking-[0.2em]
                        "
                    >
                        OIL SIF
                    </p>

                    <h2
                        className="
                            text-[#17211b]

                            text-[20px]
                            leading-[1.05]

                            font-extrabold

                            tracking-[-0.04em]
                        "
                    >
                        Admin
                        <br />
                        Control Center
                    </h2>
                </div>


                {/* =================================================
                    ADMIN NAVIGATION
                ================================================= */}

                <nav
                    className="
                        flex-1

                        px-4
                        py-6
                    "
                >
                    <p
                        className="
                            px-3
                            mb-3

                            text-[#9aa49e]

                            text-[8px]
                            font-extrabold

                            tracking-[0.18em]
                        "
                    >
                        ADMINISTRATION
                    </p>


                    <div className="space-y-1">

                        {navigationItems.map(
                            (item) => {
                                const active =
                                    isActive(
                                        item.path
                                    );

                                return (
                                    <button
                                        key={
                                            item.path
                                        }
                                        type="button"
                                        onClick={() =>
                                            handleNavigation(
                                                item.path
                                            )
                                        }
                                        className={`
                                            relative

                                            w-full

                                            flex
                                            items-center

                                            gap-3

                                            px-3
                                            py-3

                                            rounded-[3px]

                                            border-0

                                            text-left

                                            text-[11px]
                                            font-bold

                                            cursor-pointer

                                            transition

                                            ${active
                                                ? `
                                                        bg-white
                                                        text-[#087542]
                                                        shadow-[0_3px_12px_rgba(20,50,35,0.06)]
                                                    `
                                                : `
                                                        bg-transparent
                                                        text-[#66736b]
                                                        hover:bg-white/70
                                                        hover:text-[#087542]
                                                    `
                                            }
                                        `}
                                    >

                                        {/* Active red indicator */}

                                        {active && (
                                            <span
                                                className="
                                                    absolute

                                                    left-0
                                                    top-1/2

                                                    -translate-y-1/2

                                                    w-[3px]
                                                    h-[22px]

                                                    rounded-r-full

                                                    bg-[#e31e24]
                                                "
                                            />
                                        )}


                                        {/* Icon */}

                                        <span
                                            className={`
                                                w-7
                                                h-7

                                                flex
                                                items-center
                                                justify-center

                                                rounded-[3px]

                                                text-[13px]

                                                ${active
                                                    ? "bg-[#eaf4ee] text-[#087542]"
                                                    : "bg-[#edf2ee] text-[#7c8881]"
                                                }
                                            `}
                                        >
                                            {
                                                item.icon
                                            }
                                        </span>


                                        <span>
                                            {
                                                item.label
                                            }
                                        </span>

                                    </button>
                                );
                            }
                        )}

                    </div>


                    {/* =================================================
                        DIVIDER
                    ================================================= */}

                    <div
                        className="
                            h-px

                            my-7

                            bg-[#dce4de]
                        "
                    />


                    {/* =================================================
                        GENERAL DASHBOARD
                    ================================================= */}

                    <p
                        className="
                            px-3
                            mb-3

                            text-[#9aa49e]

                            text-[8px]
                            font-extrabold

                            tracking-[0.18em]
                        "
                    >
                        NAVIGATION
                    </p>


                    <button
                        type="button"
                        onClick={
                            handleDashboard
                        }
                        className="
                            w-full

                            flex
                            items-center

                            gap-3

                            px-3
                            py-3

                            rounded-[3px]

                            border-0

                            bg-transparent

                            text-[#66736b]

                            text-[11px]
                            font-bold

                            text-left

                            cursor-pointer

                            transition

                            hover:bg-white/70
                            hover:text-[#087542]
                        "
                    >
                        <span
                            className="
                                w-7
                                h-7

                                flex
                                items-center
                                justify-center

                                rounded-[3px]

                                bg-[#edf2ee]

                                text-[#087542]

                                text-[14px]
                            "
                        >
                            ←
                        </span>

                        General Dashboard
                    </button>

                </nav>


                {/* =================================================
                    ADMIN IDENTITY
                ================================================= */}

                <div
                    className="
                        px-4
                        py-5

                        border-t
                        border-[#dce4de]
                    "
                >

                    <div
                        className="
                            flex
                            items-center

                            gap-3

                            px-3
                            py-3
                        "
                    >

                        <div
                            className="
                                w-8
                                h-8

                                flex
                                items-center
                                justify-center

                                shrink-0

                                rounded-full

                                bg-[#087542]

                                text-white

                                text-[10px]
                                font-extrabold
                            "
                        >
                            A
                        </div>


                        <div className="min-w-0">

                            <strong
                                className="
                                    block

                                    truncate

                                    text-[#17211b]

                                    text-[11px]
                                    font-extrabold
                                "
                            >
                                Admin
                            </strong>

                            <span
                                className="
                                    block

                                    mt-[2px]

                                    text-[#8a958e]

                                    text-[8px]
                                    font-medium
                                "
                            >
                                Administrator
                            </span>

                        </div>

                    </div>

                </div>

            </aside>
        </>
    );
}

export default AdminSidebar;