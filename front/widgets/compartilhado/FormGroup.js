import React from "react";

import PropTypes from "prop-types";

function FormGroup({ className, children }) {
  return <div className={`w-full relative ${className}`}>{children}</div>;
}

FormGroup.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
};

export default FormGroup;