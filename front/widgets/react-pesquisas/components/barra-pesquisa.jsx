import React, { useState, useEffect } from "react";

export default function AppComponent() {
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const handler = () => {
            setSearchTerm("");
        };

        window.addEventListener("reset-category", handler);
        return () => window.removeEventListener("reset-category", handler);
    }, []);

    const handleSearch = () => {
        window.dispatchEvent(
            new CustomEvent("blog-search", {
                detail: {
                    term: searchTerm,
                    page: 1
                }
            })
        );
    };

    const handleChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);

        if (value === "") {
            window.dispatchEvent(
                new CustomEvent("blog-search", {
                    detail: { term: "", page: 1 }
                })
            );
        }
    };

    const handleKeyDown = (event) => {
        if (event.key === "Enter") {
            handleSearch();
        }
    };

    return (
        <div className="wrapper-barra">
            <input
                type="text"
                value={searchTerm}
                placeholder="O que você está procurando hoje?"
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                className="barra-input"
            />

            <a
                href="#"
                onClick={(event) => {
                    event.preventDefault();
                    handleSearch();
                }}
                className="barra-search-button"
           >
                <svg xmlns="http://www.w3.org/2000/svg" width="49" height="49" viewBox="0 0 49 49">
                    <defs>
                        <filter id="Ellipse_160" x="0" y="0" width="49" height="49" filterUnits="userSpaceOnUse">
                            <feOffset dy="3" input="SourceAlpha"/>
                            <feGaussianBlur stdDeviation="3" result="blur"/>
                            <feFlood floodOpacity="0.161"/>
                            <feComposite operator="in" in2="blur"/>
                            <feComposite in="SourceGraphic"/>
                        </filter>
                    </defs>
                    <g id="search" transform="translate(9 6)">
                        <g transform="matrix(1, 0, 0, 1, -9, -6)" filter="url(#Ellipse_160)">
                            <circle id="Ellipse_160-2" dataName="Ellipse 160" cx="15.5" cy="15.5" r="15.5" transform="translate(9 6)" fill="#ff4e05"/>
                        </g>
                        <g id="busca" transform="translate(8 8)">
                            <rect id="Rectangle_309" dataName="Rectangle 309" width="16" height="16" fill="none"/>
                            <g id="Group_1414" dataName="Group 1414" transform="translate(0.82 0.82)">
                                <g id="Group_1413" dataName="Group 1413">
                                    <g id="Group_1412" dataName="Group 1412">
                                        <path id="Path_376" dataName="Path 376" d="M14.608,13.838l-3.592-3.592a6.245,6.245,0,1,0-.772.772l3.592,3.592a.546.546,0,1,0,.772-.772ZM1.091,6.24A5.147,5.147,0,1,1,9.93,9.823l-.108.108A5.144,5.144,0,0,1,1.091,6.24Z" transform="translate(0 -0.002)" fill="#fff" stroke="#fff" strokeWidth="1"/>
                                        <path id="Path_377" dataName="Path 377" d="M340.62,340.492l-.09.09a.411.411,0,0,1,.041-.048A.458.458,0,0,1,340.62,340.492Z" transform="translate(-330.696 -330.659)" fill="#fff" stroke="#fff" strokeWidth="1"/>
                                    </g>
                                </g>
                            </g>
                        </g>
                    </g>
               </svg>
            </a>
        </div>
    );
};