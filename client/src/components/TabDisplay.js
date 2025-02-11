import React, { useState } from "react";

function TabDisplay() {
  // State to track the selected button
  const [selectedTab, setSelectedTab] = useState("Visualization Display");

  const handleButtonClick = (tab) => {
    setSelectedTab(tab);
  };

  return (
    <div className="tabs">
      <button
        className={`btn leftbtn ${selectedTab === "Visualization Display" ? "selected" : ""}`}
        onClick={() => handleButtonClick("Visualization Display")}
      >
        Visualization Display
      </button>
      <button
        className={`btn ${selectedTab === "Edit Model Settings" ? "selected" : ""}`}
        onClick={() => handleButtonClick("Edit Model Settings")}
      >
        Edit Model Settings
      </button>
    </div>
  );
}

export default TabDisplay;
