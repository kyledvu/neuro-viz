import React from 'react';

function TrainDataListDisplay({ files, onCheckToggle, onSubmit, onShuffle }) {
  return (
    <div className="train-files" style={{ maxHeight: '300px', overflowY: 'auto' }}>
      <ul className="list-unstyled">
        {files.map(({ file, checked }, index) => (
          <li key={index} className="form-check d-flex align-items-center mb-2">
            <input
              className="form-check-input custom-checkbox me-2"
              type="checkbox"
              id={`fileCheckbox${index}`}
              checked={checked}
              onChange={() => onCheckToggle(index)}
            />
            <label className="form-check-label flex-grow-1" htmlFor={`fileCheckbox${index}`}>
              {file.name}
            </label>
          </li>
        ))}
        <li className="d-flex justify-content-between mt-3">
          <button type="button" className="btn btn-primary me-2 w-50" onClick={onSubmit}>
            Train
          </button>
          <button type="button" className="btn btn-secondary w-50" onClick={onShuffle}>
            Shuffle
          </button>
        </li>
      </ul>
    </div>
  );
}



export default TrainDataListDisplay;