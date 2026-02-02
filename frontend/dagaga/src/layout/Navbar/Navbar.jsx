import {
  Navbar as BootstrapNavbar,
  Nav,
  Container,
  Dropdown,
} from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../assets/icons/logo.png";
import alarm_bell from "../../assets/icons/alarm_bell.png";
import bell from "../../assets/icons/bell.png";
import "./Navbar.css";

import { useUserStore } from "../../store/userStore";
import { logoutAPI } from "../../api/userApi";

const Navbar = () => {
  const navigate = useNavigate();
  const { isLoggedIn, user, logout } = useUserStore();

  const handleLogout = async () => {
    try {
      await logoutAPI();
      logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      // 에러가 나도 로그아웃 처리
      logout();
      navigate('/login');
    }
  };

  return (
    <BootstrapNavbar className="navbar bg-white border-bottom px-3 position-relative">
      <Container fluid>
        {/* 로고 */}
        <BootstrapNavbar.Brand className="p-0">
          <Link to={isLoggedIn ? "/ScenarioSelect" : "/"}>
            <img src={logo} alt="Dagaga Logo" style={{ height: "40px" }} />
          </Link>
        </BootstrapNavbar.Brand>
        {isLoggedIn && (
          <>
            {/* 중앙 메뉴 */}
            <Nav
              className="position-absolute start-50 translate-middle-x d-none d-md-flex"
              style={{ gap: "100px" }}
            >
              <Nav.Link
                as={Link}
                to="/ScenarioSelect"
                className="fw-medium text-dark p-0"
              >
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
                  <Dropdown.Item as={Link} to="/Community/Chat">
                    채팅
                  </Dropdown.Item>
                  <Dropdown.Item as={Link} to="/Community/Info">
                    정보
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
              <Nav.Link
                as={Link}
                to="/MyPage"
                className="fw-medium text-dark p-0"
              >
                마이페이지
              </Nav.Link>
            </Nav>

            {/* 로그아웃 버튼 */}
            <div className="ms-auto">
              <button 
                className="logout-btn"
                onClick={handleLogout}
              >
                로그아웃
              </button>
            </div>

            {/* 사용자 닉네임 */}
            <div className="user-info">
              <span className="user-nickname">
                {user?.nickname || '사용자'}님
              </span>
            </div>
          </>
        )}
      </Container>
    </BootstrapNavbar>
  );
};

export default Navbar;
