
import { Dropdown } from 'react-bootstrap';
import './LanguageSelector.css';

const LanguageSelector = ({ language, setLanguage }) => {
    const getFlag = (lang) => {
        switch (lang) {
            case '한국어': 
                return <img src="https://flagcdn.com/w40/kr.png" alt="Korea Flag" className="flag-icon" />;
            case '중국어': 
                return <img src="https://flagcdn.com/w40/cn.png" alt="China Flag" className="flag-icon" />;
            case '베트남어': 
                return <img src="https://flagcdn.com/w40/vn.png" alt="Vietnam Flag" className="flag-icon" />;
            default: return null;
        }
    };

    return (
        <Dropdown className="lang-dropdown">
            <Dropdown.Toggle variant="light" id="dropdown-basic" className="lang-btn">
                화면 표시 언어 설정 <span>{getFlag(language)} {language}</span>
            </Dropdown.Toggle>

            <Dropdown.Menu className="custom-dropdown-menu">
                <Dropdown.Item onClick={() => setLanguage('한국어')}>
                    <img src="https://flagcdn.com/w20/kr.png" alt="kr" className="flag-icon-sm" /> 한국어 (KR)
                </Dropdown.Item>
                <Dropdown.Item onClick={() => setLanguage('중국어')}>
                    <img src="https://flagcdn.com/w20/cn.png" alt="cn" className="flag-icon-sm" /> 중국어 (CN)
                </Dropdown.Item>
                <Dropdown.Item onClick={() => setLanguage('베트남어')}>
                    <img src="https://flagcdn.com/w20/vn.png" alt="vn" className="flag-icon-sm" /> 베트남어 (VN)
                </Dropdown.Item>
            </Dropdown.Menu>
        </Dropdown>
    );
};

export default LanguageSelector;
