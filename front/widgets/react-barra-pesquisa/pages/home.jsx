import React from 'react';
import { useState } from "react";

export default function AppComponent({ minCaracteres = 0, resetInstantaneo = true , PpoMode = "", PlaceholderText = ""}) {
    const [searchTerm, setSearchTerm] = useState("");

    const dispatchSearch = (term) => {
        window.dispatchEvent(
            new CustomEvent("blog-search", {
                detail: {
                    term,
                    page: 1
                }
            })
        );
    };

    const handleSearch = () => {
        const term = searchTerm.trim();
        if (term.length > 0 && term.length < minCaracteres) {
            return;
        }
        dispatchSearch(searchTerm);
    };

    const handleChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);

        if (value === "" && resetInstantaneo) {
            dispatchSearch("");
        }
    };

    const handleKeyDown = (event) => {
        if (event.key === "Enter") {
            handleSearch();
        }
    };

    return (
        <div className={`wrapper-barra ${PpoMode}`}>
            <input
                type="text"
                value={searchTerm}
                placeholder={PlaceholderText || "O que você está procurando hoje?"}
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
               <svg xmlns="http://www.w3.org/2000/svg" width="49" height="49">
                   <defs>
                       <filter id="a" x="0" y="0" width="49" height="49" filterUnits="userSpaceOnUse">
                           <feOffset dy="3"/>
                           <feGaussianBlur stdDeviation="3" result="blur"/>
                           <feFlood floodOpacity=".161"/>
                           <feComposite operator="in" in2="blur"/>
                           <feComposite in="SourceGraphic"/>
                       </filter>
                   </defs>
                   <g filter="url(#a)">
                       <circle data-name="Ellipse 160" cx="15.5" cy="15.5" r="15.5" transform="translate(9 6)" fill="#fe4e06"/>
                   </g>
                   <path data-name="Rectangle 309" fill="none" d="M17 14h16v16H17z"/>
                   <g data-name="Group 1414">
                       <g data-name="Group 1413">
                           <g data-name="Group 1412" fill="#fff" stroke="#fff">
                               <path data-name="Path 376" d="m32.428 28.656-3.592-3.592a6.245 6.245 0 1 0-.772.772l3.592 3.592a.546.546 0 1 0 .772-.772Zm-13.517-7.598a5.147 5.147 0 1 1 8.839 3.583l-.108.108a5.144 5.144 0 0 1-8.731-3.691Z"/>
                               <path data-name="Path 377" d="m27.744 24.653-.09.09a.411.411 0 0 1 .041-.048.458.458 0 0 1 .049-.042Z"/>
                           </g>
                       </g>
                   </g>
               </svg>
            </a>
        </div>
    );
};