import talking_tiger from "../../../assets/characters/talking_tiger2.webp";
import "./ProblemMascot.css";

const ProblemMascot = () => {
  return (
    <div className="problem-mascot">
      <img src={talking_tiger} alt="Tiger mascot" className="problem-mascot-image" />
    </div>
  );
};

export default ProblemMascot;
