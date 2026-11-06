import React from "react";
import Loader from "./Loader";

const Tabs = ({
  title,
  tabs = [],
  activeTab = 0,
  setActiveTab,
  isLoading = false
}) => {
  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap">
        <h2 className="text-danger fw-bold m-0">{title}</h2>
        <ul className="nav nav-tabs" role="tablist">
          {tabs.map((tab, index) => (
            <li className="nav-item" key={index}>
              <button
                className={`nav-link px-3 ${activeTab === index ? "active" : ""}`}
                onClick={() => setActiveTab(index)}
                role="tab"
                aria-selected={activeTab === index}
              >
                {tab.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="tab-content">
        {isLoading ? (
          <div className="d-flex justify-content-center align-items-center" style={{ height: "50vh" }}>
            <Loader />
          </div>
        ) : (
          tabs.map((tab, index) => (
            <div
              key={index}
              className={`tab-pane fade ${activeTab === index ? "show active" : ""}`}
              role="tabpanel"
            >
              {tab.content}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Tabs;