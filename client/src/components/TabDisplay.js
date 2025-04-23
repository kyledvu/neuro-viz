import React from "react";

function TabDisplay({ selectedTab, setSelectedTab }) {
  return (
    <ul className="nav nav-tabs tabs">
      <li className="nav-item">
        <button
          className={`nav-link ${selectedTab === "Visualization Display" ? "active" : ""}`}
          onClick={() => setSelectedTab("Visualization Display")}
        >
          Visualization Display
        </button>
      </li>
      <li className="nav-item">
        <button
          className={`nav-link ${selectedTab === "Edit Model Settings" ? "active" : ""}`}
          onClick={() => setSelectedTab("Edit Model Settings")}
        >
          Edit Model Settings
        </button>
      </li>
    </ul>
  );
}


export default TabDisplay;
