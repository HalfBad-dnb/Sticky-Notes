// Disclaimers.jsx
import PropTypes from 'prop-types';

// Reusable InfoTab Component
const InfoTab = ({ 
  title, 
  items, 
  className = '', 
  isMobile = false, 
  hideOnMobile = false,
  style = {} 
}) => {
  const baseStyle = {
    display: hideOnMobile && isMobile ? 'none' : 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'left',
    backgroundColor: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '4px',
    padding: '20px',
    width: '250px',
    height: '250px',
    fontFamily: '"Times New Roman", Times, serif',
    color: '#000000',
    boxSizing: 'border-box',
    ...style
  };

  return (
    <div className={`info-tab ${className}`} style={baseStyle}>
      <div className="info-content" style={{ fontFamily: 'inherit' }}>
        <h3 style={{ 
          fontFamily: 'inherit',
          fontSize: '1.2rem',
          marginBottom: '10px',
          fontWeight: '600'
        }}>
          {title}
        </h3>
        <ul style={{ 
          paddingLeft: '20px',
          margin: 0,
          fontFamily: 'inherit',
          lineHeight: '1.6'
        }}>
          {items.map((item, index) => (
            <li key={index} style={{ fontFamily: 'inherit' }}>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

// Prop validation for InfoTab
InfoTab.propTypes = {
  title: PropTypes.string.isRequired,
  items: PropTypes.arrayOf(PropTypes.string).isRequired,
  className: PropTypes.string,
  isMobile: PropTypes.bool,
  hideOnMobile: PropTypes.bool,
  style: PropTypes.object
};

// Main Disclaimers Component
const Disclaimers = ({ isMobile = false }) => {
  // Data for each tab
  const tabsData = {
    boardRules: {
      title: "Board Rules",
      items: [
        "20 dislikes will delete a note",
        "Down below you can find more info and updates about the board",
        "Done notes are shown in Done Notes section",
        "Board are limited to 10 notes"
      ],
      className: "left-tab",
      hideOnMobile: true
    },
    disclaimer: {
      title: "Disclaimer",
      items: [
        "Do not save sensitive data",
        "All info exposed by notes is your responsibility",
        "We don't know who posts notes",
        "Be aware of what you're posting"
      ],
      className: "disclaimer-tab",
      hideOnMobile: true
    },
    projectStatus: {
      title: "Project Status",
      items: [
        "Project still in beta",
        "Some features may not work as expected",
        "We are actively working on improvements",
        "Expect occasional downtime"
      ],
      className: "right-tab"
    },
    eventFeatures: {
      title: "Event Features",
      items: [
        "Use for live events and presentations",
        "Interactive Q&A sessions with audience",
        "Real-time feedback collection",
        "Organize brainstorming sessions"
      ],
      className: "right-tab"
    }
  };

  return (
    <div className="disclaimers-container" style={{
      display: 'flex',
      justifyContent: 'center',
      width: '100%'
    }}>
      <div className="info-tabs-wrapper" style={{
        display: 'flex',
        gap: '15px',
        flexWrap: 'wrap',
        marginBottom: '20px',
        justifyContent: 'center',
        maxWidth: '1100px',
        width: '100%'
      }}>
        {Object.entries(tabsData).map(([key, tabData]) => (
          <InfoTab
            key={key}
            title={tabData.title}
            items={tabData.items}
            className={tabData.className}
            isMobile={isMobile}
            hideOnMobile={tabData.hideOnMobile || false}
          />
        ))}
      </div>
    </div>
  );
};

// Prop validation for Disclaimers
Disclaimers.propTypes = {
  isMobile: PropTypes.bool
};

export default Disclaimers;