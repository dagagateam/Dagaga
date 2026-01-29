import "./buffering-button.css";

const BufferingButton = () => {
  return (
    <button className="buffering-button" disabled>
      <div className="buffering-spinner"></div>
    </button>
  );
};

export default BufferingButton;
