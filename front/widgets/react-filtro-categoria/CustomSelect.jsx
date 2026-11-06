import React, { useState, useRef, useEffect, useLayoutEffect, useCallback, useId } from "react";
import { createPortal } from "react-dom";

export default function CustomSelect({
  options = [],
  value,
  onChange,
  placeholder = "Selecione",
}) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  const wrapperRef = useRef(null);
  const buttonRef = useRef(null);
  const optionRefs = useRef([]);
  const listboxId = useId();

  const selectedIndex = options.findIndex(
    (opt) => String(opt.value) === String(value)
  );
  const selectedOption = selectedIndex >= 0 ? options[selectedIndex] : undefined;

  const updateCoords = () => {
    const rect = wrapperRef.current?.getBoundingClientRect();
    if (rect) {
      setCoords({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  };

  useLayoutEffect(() => {
    if (open) {
      updateCoords();
      window.addEventListener("scroll", updateCoords, true);
      window.addEventListener("resize", updateCoords);
      return () => {
        window.removeEventListener("scroll", updateCoords, true);
        window.removeEventListener("resize", updateCoords);
      };
    }
  }, [open]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      const clickedWrapper = wrapperRef.current?.contains(e.target);
      const clickedDropdown = e.target.closest?.("[data-custom-select-dropdown]");
      if (!clickedWrapper && !clickedDropdown) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (open && activeIndex >= 0) {
      optionRefs.current[activeIndex]?.scrollIntoView({ block: "nearest" });
    }
  }, [open, activeIndex]);

  const openDropdown = (initialIndex) => {
    setOpen(true);
    setActiveIndex(
      initialIndex !== undefined
        ? initialIndex
        : selectedIndex >= 0
        ? selectedIndex
        : 0
    );
  };

  const closeDropdown = useCallback(() => {
    setOpen(false);
    setActiveIndex(-1);
  }, []);

  const handleSelect = (opt) => {
    onChange?.(opt.value);
    closeDropdown();
    buttonRef.current?.focus();
  };

  const handleButtonKeyDown = (e) => {
    if (!options.length) return;

    if (!open) {
      switch (e.key) {
        case "Enter":
        case " ":
        case "ArrowDown":
          e.preventDefault();
          openDropdown();
          break;
        case "ArrowUp":
          e.preventDefault();
          openDropdown(options.length - 1);
          break;
        default:
          break;
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((prev) => (prev + 1) % options.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((prev) => (prev - 1 + options.length) % options.length);
        break;
      case "Home":
        e.preventDefault();
        setActiveIndex(0);
        break;
      case "End":
        e.preventDefault();
        setActiveIndex(options.length - 1);
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        if (activeIndex >= 0 && options[activeIndex]) {
          handleSelect(options[activeIndex]);
        }
        break;
      case "Escape":
        e.preventDefault();
        closeDropdown();
        break;
      case "Tab":
        closeDropdown();
        break;
      default:
        break;
    }
  };

  const activeOptionId =
    open && activeIndex >= 0 && options[activeIndex]
      ? `${listboxId}-option-${activeIndex}`
      : undefined;

  return (
    <div ref={wrapperRef} style={{ position: "relative", width: 320, fontFamily: "'Figtree', sans-serif" }}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => (open ? closeDropdown() : openDropdown())}
        onKeyDown={handleButtonKeyDown}
        className={`custom-select-button${selectedOption ? " is-filled" : ""}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-activedescendant={activeOptionId}
      >
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg
          width="14"
          height="9"
          viewBox="0 0 15.119 8.81"
          style={{
            flexShrink: 0,
            marginLeft: 10,
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.15s ease",
          }}
        >
          <path
            d="M0,7,6.737,0,13,7"
            transform="translate(14.059 8.06) rotate(180)"
            fill="none"
            stroke="#5B5B5F"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
        </svg>
      </button>

      {open &&
        createPortal(
          <ul
            id={listboxId}
            data-custom-select-dropdown
            className="custom-select-dropdown"
            style={{
              position: "absolute",
              top: coords.top,
              left: coords.left,
              width: coords.width || 419,
              minWidth: coords.width || 419,
            }}
            role="listbox"
            tabIndex={-1}
          >
            {options.length === 0 ? (
              <li style={{ padding: "10px 14px", color: "#888888", fontSize: 16 }}>
                Nada encontrado
              </li>
            ) : (
              options.map((opt, index) => {
                const isSelected = String(opt.value) === String(value);
                const isActive = index === activeIndex;
                return (
                  <li
                    key={opt.value}
                    id={`${listboxId}-option-${index}`}
                    ref={(el) => (optionRefs.current[index] = el)}
                    role="option"
                    aria-selected={isSelected}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleSelect(opt)}
                    onMouseEnter={() => setActiveIndex(index)}
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      padding: "10px 14px",
                      fontSize: 16,
                      color: "#222222",
                      cursor: "pointer",
                      background: isActive || isSelected ? "#F5F5F5" : "transparent",
                      flex: "0 0 auto",
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {opt.label}
                  </li>
                );
              })
            )}
          </ul>,
          document.body
        )}
    </div>
  );
}