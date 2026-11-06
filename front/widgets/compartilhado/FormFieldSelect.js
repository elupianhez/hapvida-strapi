import React, { useMemo, useState, useRef, forwardRef, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import PropTypes from "prop-types";

import FormGroup from "./FormGroup";
import FormLabel from "./FormLabel";
import Icon from "./Icones";

export const FormFieldSelect = forwardRef(
  (
    {
      name,
      label,
      className,
      classNameWrapper = "",
      classInputNameWrapper = "",
      noArrow = false,
      options = [],
      onChange,
      value,
      placeholder = "Selecione",
      disabled = false,
      ...rest
    },
    ref
  ) => {
    const [query, setQuery] = useState("");
    const [open, setOpen] = useState(false);
    const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
    const inputRef = useRef();
    const wrapperRef = useRef();

    const selectedOption = useMemo(
      () => options.find((opt) => String(opt.value) === String(value)) || null,
      [options, value]
    );

    const filteredOptions = useMemo(() => {
      if (!query) return options;
      return options.filter((opt) =>
        opt.label.toLowerCase().includes(query.toLowerCase())
      );
    }, [query, options]);

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

    const handleSelect = (opt) => {
      onChange?.({ target: { name, value: opt.value } });
      setQuery("");
      setOpen(false);
    };

    return (
      <FormGroup className={`w-full m-0 ${classNameWrapper}`}>
        {!!label && <FormLabel htmlFor={name}>{label}</FormLabel>}

        <div
          ref={wrapperRef}
          className={`relative w-full ${open ? "focused" : ""}`}
          onFocus={() => setOpen(true)}
          onBlur={(e) => {
            const container = e.currentTarget;
            requestAnimationFrame(() => {
              const active = document.activeElement;
              if (!container.contains(active)) {
                setOpen(false);
              }
            });
          }}
        >
          <input
            ref={ref || inputRef}
            type="text"
            name={name}
            value={open ? query : selectedOption?.label || ""}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            placeholder={placeholder}
            className={`peer appearance-none w-full h-full pl-4 pr-10 rounded-full border filtro-select
                        ${classInputNameWrapper}
                        ${(open ? query : selectedOption?.label) ? "input-preenchido" : ""}
                      `}
            autoComplete="off"
            disabled={disabled}
            {...rest}
          />

          {!noArrow && (
            <button
              type="button"
              className={`absolute right-0 flex items-center pr-2 filtro-select-button
                          ${(open ? query : selectedOption?.label) ? "input-preenchido" : ""}`}
              onMouseDown={(e) => {
                e.preventDefault();
                setOpen((prev) => !prev);
              }}
              tabIndex={-1}
              disabled={disabled}
            >
              <Icon.Seta />
            </button>
          )}

          {open &&
            createPortal(
              <ul
                className="filtro-elementos"
                style={{
                  position: "absolute",
                  top: coords.top,
                  left: coords.left,
                  width: coords.width,
                  minWidth: coords.width
                }}
              >
                {filteredOptions.length === 0 ? (
                  <li className="cursor-default px-4 py-2 text-gray-500">
                    Nada encontrado
                  </li>
                ) : (
                  filteredOptions.map((opt) => (
                    <li
                      key={opt.value}
                      tabIndex={0}
                      className="px-4 py-2"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleSelect(opt)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleSelect(opt);
                        }
                      }}
                      role="option"
                    >
                      {opt.label}
                    </li>
                  ))
                )}
              </ul>,
              document.body
            )}
        </div>
      </FormGroup>
    );
  }
);

FormFieldSelect.displayName = "FormFieldSelect";
export default FormFieldSelect;