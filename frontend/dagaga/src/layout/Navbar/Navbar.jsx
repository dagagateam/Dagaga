import { Navbar as BootstrapNavbar, Nav, Container, Dropdown } from "react-bootstrap";
import { Link } from "react-router-dom";
import logo from "../../assets/icons/logo.png";
import alarm_bell from "../../assets/icons/alarm_bell.png";
import bell from "../../assets/icons/bell.png";
import "./Navbar.css";


const Navbar = () => {
  return (
    <BootstrapNavbar className="navbar bg-white border-bottom px-3 position-relative">
      <Container fluid>
        {/* 로고 */}
        <BootstrapNavbar.Brand className="p-0">
          <img src={logo} alt="Dagaga Logo" style={{ height: "40px" }} />
        </BootstrapNavbar.Brand>

        {/* 중앙 메뉴 */}
        <Nav className="position-absolute start-50 translate-middle-x d-none d-md-flex" style={{ gap: "100px" }}>
          <Nav.Link as={Link} to="/scenario-select" className="fw-medium text-dark p-0">
            학습
          </Nav.Link>
          <Dropdown as={Nav.Item}>
            <Dropdown.Toggle
              as={Nav.Link}
              className="fw-medium text-dark p-0 border-0 bg-transparent no-caret"
            >
              커뮤니티
            </Dropdown.Toggle>

            <Dropdown.Menu className="custom-dropdown-menu">
              <Dropdown.Item href="#">채팅</Dropdown.Item>
              <Dropdown.Item href="#">정보</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
          <Nav.Link href="#" className="fw-medium text-dark p-0">
            마이페이지
          </Nav.Link>
        </Nav>

        {/* 알림 */}
        <div className="ms-auto notification">
          <Nav.Link href="#" className="p-0 d-flex align-items-center">
            <img src={bell} alt="Notification" style={{ height: "32px", width: "auto" }} />
          </Nav.Link>
        </div>
      </Container>
    </BootstrapNavbar>
  );
};

export default Navbar;
