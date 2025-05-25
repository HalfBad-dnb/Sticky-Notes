import React from 'react';
import PropTypes from 'prop-types';

const MenuDefault = ({ children, title, style }) => {
  return (
    <div style={{
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '4px',
      padding: '15px',
      minWidth: '250px',
      fontFamily: '"Times New Roman", Times, serif',
      color: '#FFFFFF',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      margin: '10px 0',
      ...style
    }}>
      {title && (
        <h3 style={{
          fontFamily: 'inherit',
          fontSize: '1.2rem',
          margin: '0 0 10px 0',
          fontWeight: '600',
          color: '#FFD700', // Yellow color for title
          paddingBottom: '8px',
          borderBottom: '1px solid rgba(255, 215, 0, 0.3)'
        }}>
          {title}
        </h3>
      )}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        width: '100%'
      }}>
        {React.Children.map(children, (child) => (
          React.cloneElement(child, {
            style: {
              padding: '8px 12px',
              borderRadius: '4px',
              cursor: 'pointer',
              textDecoration: 'none',
              color: 'inherit',
              display: 'flex',
              alignItems: 'center',
              transition: 'all 0.2s ease',
              backgroundColor: 'transparent',
              border: 'none',
              textAlign: 'left',
              width: '100%',
              fontFamily: 'inherit',
              fontSize: '1rem',
              ...child.props.style,
              ':hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.05)',
                ...(child.props.style?.hover || {})
              }
            }
          })
        ))}
      </div>
    </div>
  );
};

MenuDefault.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string,
  style: PropTypes.object,
};

MenuDefault.defaultProps = {
  title: '',
  style: {},
};

export default MenuDefault;