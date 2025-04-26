import { useEffect, useRef, useState } from "react";

function HelpButton() {
  const [isVisible, setIsVisible] = useState(false); // Toggle visibility
  const helpRef = useRef(null); // Reference to the help container

  useEffect(() => {
    function handleClickOutside(event) {
      if (helpRef.current && !helpRef.current.contains(event.target)) {
        setIsVisible(false); // Hide when clicking outside
      }
    }

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <div className="Help" ref={helpRef}>
      <button className="help-btn" onClick={() => setIsVisible(!isVisible)}>
        ?
      </button>
      {isVisible && (
        <div className="help-text">
          <p>
            Here is a sample explanation of how the site works. <br/>
            All the features included are described.
            <ul>
                <li>describe standards/formatting of files to be uploaded (data to be scored, training data, pretrained model(?))</li>
            </ul>
            Q: what are some common questions/issues users might run into? <br/>
            A: here's a fix to said issue etc.
          </p>
        </div>
      )}
    </div>
  );
}

export default HelpButton;
