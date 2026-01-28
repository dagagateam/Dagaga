import { useParams } from "react-router-dom";
import { Container } from "react-bootstrap";
import "./problem-native.css";

const ProblemNative = () => {
  const { problemId } = useParams();

  return (
    <Container className="problem-native-container">
      <h1>Problem Native Page</h1>
      <p>Problem ID: {problemId}</p>
    </Container>
  );
};

export default ProblemNative;