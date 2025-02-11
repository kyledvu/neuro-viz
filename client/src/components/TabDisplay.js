import React from "react";

function TabDisplay({ selectedTab, setSelectedTab }) {
  return (
    <div className="tabs">
      <button
        className={`btn leftbtn ${selectedTab === "Visualization Display" ? "selected" : ""}`}
        onClick={() => setSelectedTab("Visualization Display")}
      >
        Visualization Display
      </button>
      <button
        className={`btn ${selectedTab === "Edit Model Settings" ? "selected" : ""}`}
        onClick={() => setSelectedTab("Edit Model Settings")}
      >
        Edit Model Settings
      </button>
    </div>
  );
}

export default TabDisplay;
