import React from "react";
import PropTypes from "prop-types";

function FormLabel(props) {
  return (
    <label
      {...props}
      className={props.className}
    >
      {props.children}
    </label>
  );
}

FormLabel.propTypes = {
  props: PropTypes.object,
};

export default FormLabel;