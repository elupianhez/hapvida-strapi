import React, { useEffect, useRef, useState, useLayoutEffect } from "react";
import { createPortal } from "react-dom";

export function CustomSelect({
    id,
    className = "",
    options,
    value,
    onChange,
    placeholder,
    disabled = false,
    hasError = false,
    autoFocus = false,
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const [dropdownStyle, setDropdownStyle] = useState({
        position: "fixed",
        top: 0,
        left: 0,
        width: 0,
        visibility: "hidden",
    });
    const containerRef = useRef(null);
    const triggerRef = useRef(null);
    const listRef = useRef(null);

    const selectedOption = options.find((option) => option.value === value);

    const updateDropdownPosition = () => {
        if (!triggerRef.current) return;

        const rect = triggerRef.current.getBoundingClientRect();

        setDropdownStyle({
            position: "fixed",
            top: rect.bottom + 8,
            left: rect.left,
            width: rect.width,
            visibility: "visible",
        });
    };

    useLayoutEffect(() => {
        if (isOpen) {
            updateDropdownPosition();
        } else {
            setDropdownStyle((prev) => ({ ...prev, visibility: "hidden" }));
        }
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;

        function handleClickOutside(e) {
            const clickedTrigger =
                containerRef.current && containerRef.current.contains(e.target);
            const clickedList =
                listRef.current && listRef.current.contains(e.target);

            if (!clickedTrigger && !clickedList) {
                setIsOpen(false);
            }
        }

        function handleReposition() {
            updateDropdownPosition();
        }

        document.addEventListener("mousedown", handleClickOutside);
        window.addEventListener("scroll", handleReposition, true);
        window.addEventListener("resize", handleReposition);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            window.removeEventListener("scroll", handleReposition, true);
            window.removeEventListener("resize", handleReposition);
        };
    }, [isOpen]);

    useEffect(() => {
        if (isOpen && highlightedIndex >= 0 && listRef.current) {
            const item = listRef.current.children[highlightedIndex];
            if (item) item.scrollIntoView({ block: "nearest" });
        }
    }, [isOpen, highlightedIndex]);


    useEffect(() => {
        if (autoFocus && triggerRef.current) {
            triggerRef.current.focus();
        }
    }, [autoFocus]);

    const openDropdown = () => {
        if (disabled) return;
        const currentIndex = options.findIndex((o) => o.value === value);
        setHighlightedIndex(currentIndex >= 0 ? currentIndex : 0);
        setIsOpen(true);
    };

    const closeDropdown = () => {
        setIsOpen(false);
        setHighlightedIndex(-1);
    };

    const selectOption = (option) => {
        onChange(option.value);
        closeDropdown();
    };

    const handleTriggerClick = () => {
        if (disabled) return;
        isOpen ? closeDropdown() : openDropdown();
    };

    const handleKeyDown = (e) => {
        if (disabled) return;

        if (!isOpen) {
            if (["Enter", " ", "ArrowDown", "ArrowUp"].includes(e.key)) {
                e.preventDefault();
                openDropdown();
            }
            return;
        }

        if (e.key === "Escape") {
            e.preventDefault();
            closeDropdown();
        } else if (e.key === "ArrowDown") {
            e.preventDefault();
            setHighlightedIndex((prev) => Math.min(prev + 1, options.length - 1));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlightedIndex((prev) => Math.max(prev - 1, 0));
        } else if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            if (highlightedIndex >= 0) selectOption(options[highlightedIndex]);
        } else if (e.key === "Tab") {
            closeDropdown();
        }
    };

    const containerClassName = [
        "custom-select",
        className,
        isOpen ? "custom-select--open" : "",
        hasError ? "custom-select--error" : "",
        disabled ? "custom-select--disabled" : "",
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <div className={containerClassName} ref={containerRef}>
            <button
                type="button"
                id={id}
                ref={triggerRef}
                className="custom-select-trigger"
                onClick={handleTriggerClick}
                onKeyDown={handleKeyDown}
                disabled={disabled}
                role="combobox"
                aria-controls={`${id}-listbox`}
                aria-expanded={isOpen}
            >
                <span
                    className={
                        selectedOption
                            ? "custom-select-value"
                            : "custom-select-value custom-select-placeholder"
                    }
                >
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <span className="custom-select-arrow" aria-hidden="true" />
            </button>

            {isOpen &&
                createPortal(
                    <ul
                        className="custom-select-list"
                        role="listbox"
                        id={`${id}-listbox`}
                        ref={listRef}
                        style={dropdownStyle}
                    >
                        {options.map((option, index) => (
                            <li
                                key={option.value}
                                role="option"
                                aria-selected={option.value === value}
                                className={[
                                    "custom-select-option",
                                    option.value === value
                                        ? "custom-select-option--selected"
                                        : "",
                                    index === highlightedIndex
                                        ? "custom-select-option--highlighted"
                                        : "",
                                ]
                                    .filter(Boolean)
                                    .join(" ")}
                                onMouseEnter={() => setHighlightedIndex(index)}
                                onClick={() => selectOption(option)}
                            >
                                {option.label}
                            </li>
                        ))}
                    </ul>,
                    document.body
                )}
        </div>
    );
}