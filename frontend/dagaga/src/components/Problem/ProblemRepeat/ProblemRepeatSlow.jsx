import turtleIcon from "../../../assets/icons/turtle.png";
import "./ProblemRepeatSlow.css";

const ProblemRepeatSlow = ({ onClick }) => {
  return (
    <button className="repeat-slow-button" onClick={onClick} title="천천히 듣기">
      <img src={turtleIcon} alt="느리게" className="repeat-slow-icon" />
    </button>
  );
};

export default ProblemRepeatSlow;
