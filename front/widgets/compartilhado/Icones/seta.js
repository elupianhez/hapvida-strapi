import React from "react";

function Seta({up = false}) {
    const transform = up ? undefined : "translate(14.059 8.06) rotate(180)";
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="15.119" height="8.81" viewBox="0 0 15.119 8.81">
          <path id="Path_382" data-name="Path 382" d="M0,7,6.737,0,13,7" transform={transform} fill="none" stroke="#5b5b5f" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"></path>
        </svg>
    );
}

export default Seta;