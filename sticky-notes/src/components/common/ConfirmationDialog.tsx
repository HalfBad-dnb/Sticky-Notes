import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '../../context/themeUtils';

// Animation keyframes as a constant outside the component
const fadeInUpKeyframes = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const ConfirmationDialog = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Delete', cancelText = 'Cancel' }) => {
  const { theme } = useTheme();
  
  // Move styles calculation before any early returns
  const styles = useMemo(() => {
    switch (theme) {
      case 'bubbles':
        return {
          backgroundColor: 'rgba(23, 23, 28, 0.98)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 10px 50px -12px rgba(0, 0, 0, 0.5)',
          button: {
            confirm: {
                background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 100%)',
                color: '#fff',
            },
            cancel: {
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#fff',
            }
          }
        };
      case 'hearts':
        return {
          backgroundColor: 'rgba(28, 22, 46, 0.98)',
          border: '1px solid rgba(255, 105, 180, 0.2)',
          boxShadow: '0 10px 50px -12px rgba(255, 105, 180, 0.3)',
          button: {
            confirm: {
                background: 'linear-gradient(135deg, #FF69B4 0%, #FF8FD8 100%)',
                color: '#fff',
            },
            cancel: {
                background: 'rgba(255, 105, 180, 0.1)',
                color: '#FF8FD8',
            }
          }
        };
      default: // triangles
        return {
          backgroundColor: 'rgba(18, 18, 24, 0.98)',
          border: '1px solid rgba(100, 220, 255, 0.2)',
          boxShadow: '0 10px 50px -12px rgba(100, 220, 255, 0.2)',
          button: {
            confirm: {
                background: 'linear-gradient(135deg, #64DCFF 0%, #00A8E8 100%)',
                color: '#001F3F',
            },
            cancel: {
                background: 'rgba(100, 220, 255, 0.1)',
                color: '#64DCFF',
            }
          }
        };
    }
  }, [theme]);

  if (!isOpen) return null;

  // Styles are now defined in the useMemo hook above

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      backdropFilter: 'blur(4px)',
    }}>
      <style>{fadeInUpKeyframes}</style>
      <div style={{
        backgroundColor: styles.backgroundColor,
        borderRadius: '16px',
        padding: '24px',
        maxWidth: '400px',
        width: '90%',
        border: styles.border,
        boxShadow: styles.boxShadow,
        transform: 'translateY(-20px)',
        animation: 'fadeInUp 0.3s ease-out forwards',
      }}>
        <h3 style={{
          margin: '0 0 16px 0',
          color: '#fff',
          fontSize: '1.5rem',
          fontWeight: '600',
        }}>{title}</h3>
        
        <p style={{
          margin: '0 0 24px 0',
          color: 'rgba(255, 255, 255, 0.8)',
          lineHeight: '1.5',
        }}>{message}</p>
        
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px',
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '600',
              transition: 'all 0.2s ease',
              ...styles.button.cancel,
            }}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '600',
              transition: 'all 0.2s ease',
              ...styles.button.confirm,
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

ConfirmationDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  confirmText: PropTypes.string,
  cancelText: PropTypes.string,
};

export default ConfirmationDialog;
