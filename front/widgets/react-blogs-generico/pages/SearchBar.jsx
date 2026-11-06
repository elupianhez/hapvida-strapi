import React from "react";

export default function SearchBar({
  value,
  onChange,
  onSearch,
  placeholder = "O que você está procurando?",
}) {
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      onSearch?.();
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        padding: "8px 9px 9px 8px",
        gap: 10,
        width: 531,
        maxWidth: "100%",
        height: 44,
        background: "#FFFFFF",
        borderRadius: 6,
        boxSizing: "border-box",
      }}
    >
      <button
        type="button"
        onClick={() => onSearch?.()}
        aria-label="Buscar"
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          padding: "0px 8px",
          gap: 10,
          width: 36,
          height: 20,
          background: "transparent",
          border: "none",
          cursor: "pointer",
          flexShrink: 0,
        }}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="9" cy="9" r="6.5" stroke="#222222" strokeWidth="1.7" />
          <line
            x1="13.6465"
            y1="14"
            x2="18"
            y2="18.3536"
            stroke="#222222"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
        </svg>
      </button>

      <input
        type="text"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        style={{
          flex: 1,
          height: 26,
          border: "none",
          outline: "none",
          background: "transparent",
          fontFamily: "'Oxygen', sans-serif",
          fontStyle: "normal",
          fontWeight: 400,
          fontSize: 16,
          lineHeight: "26px",
          color: "#222222",
        }}
      />
    </div>
  );
}