import { useEffect, useState } from "react";
import {
    useLocation,
    useNavigate,
} from "react-router-dom";

function Navbar({ variant = "public" }) {
    const navigate = useNavigate();
    const location = useLocation();

    const [user, setUser] = useState(null);
    const [activeSection, setActiveSection] =
        useState("dashboard");

    useEffect(() => {
        const storedUser =
            localStorage.getItem("user");

        if (storedUser) {
            try {
                setUser(
                    JSON.parse(storedUser)
                );
            } catch {
                setUser(null);
            }
        } else {
            setUser(null);
        }
    }, [location.pathname]);

    const isLoggedIn =
        !!localStorage.getItem("token") &&
        !!user;

    const role = user?.role;

    const isAdmin =
        role === "admin";

    const isTeam =
        role === "team";

    const isAdminPage =
        location.pathname.startsWith(
            "/admin"
        );

    const isTeamPage =
        location.pathname.startsWith(
            "/team"
        );

    const userName =
        user?.name ||
        user?.full_name ||
        user?.username ||
        "User";

    const firstName =
        userName
            .trim()
            .split(" ")[0] ||
        "User";

    const publicLinks = [
        {
            label: "Dashboard",
            id: "dashboard",
        },
        {
            label: "Distress Ranking",
            id: "distress-ranking",
        },
        {
            label: "Statistics",
            id: "statistics",
        },
        {
            label: "Report an Issue",
            id: "report",
        },
    ];

    useEffect(() => {
        if (
            isAdminPage ||
            isTeamPage ||
            location.pathname !== "/"
        ) {
            return;
        }

        const sections = publicLinks
            .map((item) =>
                document.getElementById(
                    item.id
                )
            )
            .filter(Boolean);

        if (!sections.length) {
            return;
        }

        const observer =
            new IntersectionObserver(
                (entries) => {
                    const visibleSections =
                        entries
                            .filter(
                                (entry) =>
                                    entry.isIntersecting
                            )
                            .sort(
                                (a, b) =>
                                    b.intersectionRatio -
                                    a.intersectionRatio
                            );

                    if (
                        visibleSections.length >
                        0
                    ) {
                        setActiveSection(
                            visibleSections[0]
                                .target.id
                        );
                    }
                },
                {
                    rootMargin:
                        "-25% 0px -60% 0px",
                    threshold: [
                        0,
                        0.1,
                        0.25,
                        0.5,
                        0.75,
                    ],
                }
            );

        sections.forEach((section) =>
            observer.observe(section)
        );

        return () =>
            observer.disconnect();
    }, [
        isAdminPage,
        isTeamPage,
        location.pathname,
    ]);

    const scrollToSection = (id) => {
        if (location.pathname !== "/") {
            navigate("/");

            setTimeout(() => {
                document
                    .getElementById(id)
                    ?.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                    });
            }, 100);

            return;
        }

        document
            .getElementById(id)
            ?.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        setUser(null);

        navigate("/login");
    };

    const handleBrandClick = () => {
        if (isAdminPage) {
            navigate("/admin");
            return;
        }

        if (isTeamPage) {
            navigate("/team");
            return;
        }

        scrollToSection("dashboard");
    };

    return (
        <header
            className="
                sticky
                top-0
                z-100
                w-full
                border-b
                border-[#dce4de]
                bg-white
            "
        >
            <div
                className="
                    min-h-[80px]
                    px-[5%]
                    flex
                    items-center
                    justify-between
                    gap-6
                "
            >
                <button
                    type="button"
                    onClick={handleBrandClick}
                    className="
                        flex
                        items-center
                        gap-4
                        shrink-0
                        border-0
                        bg-transparent
                        text-left
                        cursor-pointer
                    "
                >
                    <div
                        className="
                            relative
                            w-[54px]
                            h-[62px]
                            flex
                            items-center
                            justify-center
                            border-l-[5px]
                            border-b-[5px]
                            border-[#e31e24]
                            after:absolute
                            after:left-0
                            after:bottom-[-5px]
                            after:w-[49px]
                            after:h-[5px]
                            after:bg-[#087542]
                        "
                    >
                        <span
                            className="
                                text-[#087542]
                                text-[14px]
                                font-black
                                tracking-[-0.04em]
                            "
                        >
                            OIL
                        </span>
                    </div>

                    <div className="hidden sm:block">
                        <strong
                            className="
                                block
                                text-[#17211b]
                                text-[18px]
                                leading-none
                                font-extrabold
                                tracking-[-0.025em]
                            "
                        >
                            OIL INDIA LIMITED
                        </strong>

                        <span
                            className="
                                block
                                mt-[6px]
                                text-[#087542]
                                text-[9px]
                                leading-none
                                font-extrabold
                                tracking-[0.18em]
                            "
                        >
                            SAFETY INTELLIGENCE
                        </span>
                    </div>
                </button>

                {!isAdminPage &&
                    !isTeamPage && (
                        <nav
                            className="
                                hidden
                                lg:flex
                                items-center
                                gap-7
                            "
                        >
                            {publicLinks.map(
                                (link) => (
                                    <button
                                        key={
                                            link.id
                                        }
                                        type="button"
                                        onClick={() =>
                                            scrollToSection(
                                                link.id
                                            )
                                        }
                                        className={`
                                            relative
                                            border-0
                                            bg-transparent
                                            py-7
                                            text-[10px]
                                            font-bold
                                            whitespace-nowrap
                                            cursor-pointer
                                            transition-colors
                                            duration-300
                                            ${
                                                activeSection ===
                                                link.id
                                                    ? "text-[#087542]"
                                                    : "text-[#17211b]"
                                            }
                                        `}
                                    >
                                        {
                                            link.label
                                        }

                                        <span
                                            className={`
                                                absolute
                                                left-0
                                                bottom-0
                                                h-[3px]
                                                bg-[#e31e24]
                                                transition-all
                                                duration-300
                                                ease-out
                                                ${
                                                    activeSection ===
                                                    link.id
                                                        ? "w-full opacity-100"
                                                        : "w-0 opacity-0"
                                                }
                                            `}
                                        />
                                    </button>
                                )
                            )}
                        </nav>
                    )}

                {!isLoggedIn ? (
                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                "/login"
                            )
                        }
                        className="
                            shrink-0
                            px-7
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
                        Login
                    </button>
                ) : (
                    <div
                        className="
                            flex
                            items-center
                            gap-3
                            sm:gap-5
                            shrink-0
                        "
                    >
                        {!isAdminPage &&
                            !isTeamPage &&
                            isAdmin && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        navigate(
                                            "/admin"
                                        )
                                    }
                                    className="
                                        hidden
                                        sm:flex
                                        items-center
                                        gap-2
                                        px-3
                                        py-2
                                        rounded-[3px]
                                        border
                                        border-[#cfe0d5]
                                        bg-[#f5faf7]
                                        text-[#087542]
                                        text-[9px]
                                        font-extrabold
                                        cursor-pointer
                                        transition
                                        hover:bg-[#eaf4ee]
                                    "
                                >
                                    <span
                                        className="
                                            text-[12px]
                                        "
                                    >
                                        🛡
                                    </span>

                                    Admin Center
                                </button>
                            )}

                        {!isAdminPage &&
                            !isTeamPage &&
                            isTeam && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        navigate(
                                            "/team"
                                        )
                                    }
                                    className="
                                        hidden
                                        sm:flex
                                        items-center
                                        gap-2
                                        px-3
                                        py-2
                                        rounded-[3px]
                                        border
                                        border-[#cfe0d5]
                                        bg-[#f5faf7]
                                        text-[#087542]
                                        text-[9px]
                                        font-extrabold
                                        cursor-pointer
                                        transition
                                        hover:bg-[#eaf4ee]
                                    "
                                >
                                    <span
                                        className="
                                            text-[12px]
                                        "
                                    >
                                        👥
                                    </span>

                                    Team Dashboard
                                </button>
                            )}

                        <div
                            className="
                                hidden
                                sm:block
                                text-right
                            "
                        >
                            <span
                                className="
                                    block
                                    text-[#9aa49e]
                                    text-[8px]
                                    font-extrabold
                                    tracking-[0.12em]
                                "
                            >
                                {isAdmin
                                    ? "ADMIN"
                                    : isTeam
                                    ? "TEAM"
                                    : "OIL SIF"}
                            </span>

                            <strong
                                className="
                                    block
                                    mt-1
                                    text-[#17211b]
                                    text-[11px]
                                    font-extrabold
                                "
                            >
                                Hi, {firstName}
                            </strong>
                        </div>

                        <div
                            className="
                                w-9
                                h-9
                                flex
                                items-center
                                justify-center
                                rounded-full
                                bg-[#087542]
                                text-white
                                text-[10px]
                                font-extrabold
                                uppercase
                            "
                        >
                            {firstName.charAt(0)}
                        </div>

                        <button
                            type="button"
                            onClick={
                                handleLogout
                            }
                            className="
                                px-3
                                sm:px-5
                                py-2.5
                                rounded-[3px]
                                border
                                border-[#d9e2dc]
                                bg-white
                                text-[#59655e]
                                text-[9px]
                                font-extrabold
                                cursor-pointer
                                transition
                                hover:border-[#e31e24]
                                hover:text-[#c62828]
                                hover:bg-[#fff8f8]
                            "
                        >
                            Logout
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
}

export default Navbar;