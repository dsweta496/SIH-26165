function Footer() {
    return (
        <footer
            className="
                border-t
                border-[#dce4de]

                bg-[#f5f8f6]

                px-[6%]
                py-8

                text-[#59655e]
            "
        >
            <div
                className="
                    mx-auto
                    max-w-[1380px]

                    flex
                    flex-col

                    items-start
                    justify-between

                    gap-6

                    md:flex-row
                    md:items-center
                "
            >

                {/* ================= BRAND ================= */}

                <div
                    className="
                        flex
                        flex-col
                    "
                >
                    <strong
                        className="
                            text-[#17211b]

                            text-[12px]
                            font-extrabold

                            tracking-[0.08em]
                        "
                    >
                        OIL INDIA LIMITED
                    </strong>

                    <span
                        className="
                            mt-1

                            text-[#087542]

                            text-[8px]
                            font-extrabold

                            tracking-[0.18em]
                        "
                    >
                        SAFETY INTELLIGENCE
                    </span>
                </div>


                {/* ================= FRAMEWORK ================= */}

                <span
                    className="
                        text-[#7a867f]

                        text-[10px]
                        font-medium

                        tracking-[0.03em]
                    "
                >
                    OIL SIF
                    <span className="mx-2 text-[#c5cec8]">
                        •
                    </span>
                    Safety Intelligence Framework
                </span>

            </div>
        </footer>
    );
}

export default Footer;