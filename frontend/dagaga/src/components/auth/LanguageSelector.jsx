
import { Dropdown } from 'react-bootstrap';
import './LanguageSelector.css';

import { useUserStore } from '../../store/userStore';

const LanguageSelector = () => {
    const { language, setLanguage } = useUserStore();

    const getFlag = (lang) => {
        switch (lang) {
            case 'ko':
                return <img src="https://flagcdn.com/w40/kr.png" alt="Korea Flag" className="flag-icon" />;
            case 'zh':
                return <img src="https://flagcdn.com/w40/cn.png" alt="China Flag" className="flag-icon" />;
            case 'vi':
                return <img src="https://flagcdn.com/w40/vn.png" alt="Vietnam Flag" className="flag-icon" />;
            default: return null;
        }
    };

    const getLabel = (lang) => {
        switch (lang) {
            case 'ko': return '한국어';
            case 'zh': return '中文';
            case 'vi': return 'Tiếng Việt';
            default: return lang;
        }
    };

    return (
        <Dropdown className="lang-dropdown">
            <Dropdown.Toggle variant="light" id="dropdown-basic" className="lang-btn">
                <span>{getFlag(language)} {getLabel(language)}</span>
            </Dropdown.Toggle>

            <Dropdown.Menu className="custom-dropdown-menu">
                <Dropdown.Item onClick={() => setLanguage('ko')}>
                    <img src="https://flagcdn.com/w20/kr.png" alt="kr" className="flag-icon-sm" /> 한국어 (KR)
                </Dropdown.Item>
                <Dropdown.Item onClick={() => setLanguage('zh')}>
                    <img src="https://flagcdn.com/w20/cn.png" alt="cn" className="flag-icon-sm" /> 中文 (CN)
                </Dropdown.Item>
                <Dropdown.Item onClick={() => setLanguage('vi')}>
                    <img src="https://flagcdn.com/w20/vn.png" alt="vn" className="flag-icon-sm" /> Tiếng Việt (VN)
                </Dropdown.Item>
            </Dropdown.Menu>
        </Dropdown>
    );
};

export default LanguageSelector;
