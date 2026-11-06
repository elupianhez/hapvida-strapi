import React from "react";
import PropTypes from "prop-types";

function CheckboxList({ values = [], selected = [], onChange }) {
  return (
    <div>
      {values.map(({ label, id }, index) => (
        <div key={index} className="form-check mb-2">
          <input
            className="form-check-input filtro-checkbox"
            type="checkbox"
            id={id}
            checked={selected.includes(id)}
            onChange={() => onChange(id)}
          />
          <label className="form-check-label filtro-checkbox-label pl-2" htmlFor={id}>
            {label}
          </label>
        </div>
      ))}
    </div>
  );
}

CheckboxList.propTypes = {
  values: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      id: PropTypes.string.isRequired,
    })
  ).isRequired,
  selected: PropTypes.arrayOf(PropTypes.string),
  onChange: PropTypes.func.isRequired,
};

export default CheckboxList;