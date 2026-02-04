import {
  Navbar as BootstrapNavbar,
  Nav,
  Container,
} from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import logo from "../../assets/icons/logo2.png";
import "./Navbar.css";

import { useUserStore } from "../../store/userStore";
import { logoutAPI } from "../../api/userApi";

const Navbar = () => {
  const { t } = useTranslation();
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

  const handleMyPage = () => {
    navigate('/MyPage');
  };

  return (
    <BootstrapNavbar className="navbar border-bottom position-relative">
      <Container fluid>
        {/* 로고 */}
        <BootstrapNavbar.Brand className="p-0">
          <Link to="/Homepage">
            <img src={logo} alt="Dagaga Logo" style={{ height: "40px" }} />
          </Link>
        </BootstrapNavbar.Brand>
        {isLoggedIn && (
          <>
            {/* navbar 메뉴 */}
            <Nav
              className="d-none d-md-flex ms-4"
              style={{ gap: "var(--navbar-gap)" }}
            >
              <Nav.Link
                as={Link}
                to="/ScenarioSelect"
                className="fw-medium text-dark p-0"
              >
                {t('nav_learning')}
              </Nav.Link>
              <Nav.Link
                as={Link}
                to="/Community/Info"
                className="fw-medium text-dark p-0"
              >
                {t('nav_info')}
              </Nav.Link>
              <Nav.Link
                as={Link}
                to="/Community/Chat"
                className="fw-medium text-dark p-0"
              >
                {t('nav_chat')}
              </Nav.Link>
            </Nav>

            {/* 로그아웃 버튼 */}
            <div className="ms-auto">
              <button
                className="logout-btn"
                onClick={handleLogout}
              >
                {t('logout')}
              </button>
            </div>

            {/* 사용자 닉네임 */}
            <div className="user-info">
              <button className="user-nickname"
                onClick={handleMyPage}>
                {user?.nickname || t('guest')}{t('user_suffix')}
              </button>
            </div>
          </>
        )}
        {!isLoggedIn && (
          <div className="ms-auto">
            <button
              className="logout-btn"
              onClick={() => navigate('/Login')}
            >
              {t('login')}
            </button>
          </div>
        )}
      </Container>
    </BootstrapNavbar>
  );
};

export default Navbar;
