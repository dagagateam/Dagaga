import talking_tiger from "../../../assets/characters/talking_tiger.png";
import "./problem-mascot.css";

const ProblemMascot = () => {
  return (
    <div className="problem-mascot">
      <img src={talking_tiger} alt="Tiger mascot" className="mascot-image" />
    </div>
  );
};

export default ProblemMascot;
