import React from 'react';
import PropTypes from 'prop-types';

// TypeScript interface for props
interface MediaPlayerProps {
  type: string;
  url: string;
  isOpen: boolean;
  showMainSite?: boolean;
  isPersistent?: boolean;
}

const MediaPlayer: React.FC<MediaPlayerProps> = ({ type, url, isOpen, showMainSite, isPersistent = false }) => {
  const playerStyle = {
    width: '100%',
    height: isPersistent ? '50px' : showMainSite ? '400px' : type === 'youtube' ? '200px' : '152px',
    borderRadius: '8px',
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.2)',
    display: isOpen ? 'block' : 'none'
  };

  if (!isOpen) return null;

  if (showMainSite) {
    return (
      <div style={playerStyle}>
        <iframe
          src={url}
          width="100%"
          height="100%"
          frameBorder="0"
          title={`${type === 'youtube' ? 'YouTube' : 'Spotify'} website`}
          style={{ border: 'none' }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    );
  }

  if (type === 'youtube') {
    return (
      <div style={playerStyle}>
        <iframe
          width="100%"
          height="100%"
          src={url}
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{ border: 'none' }}
        />
      </div>
    );
  }

  if (type === 'spotify') {
    return (
      <div style={playerStyle}>
        <iframe
          src={url}
          width="100%"
          height="100%"
          frameBorder="0"
          allowTransparency={true}
          allow="encrypted-media"
          style={{ border: 'none' }}
        />
      </div>
    );
  }

  return null;
};

MediaPlayer.propTypes = {
  type: PropTypes.string.isRequired,
  url: PropTypes.string.isRequired,
  isOpen: PropTypes.bool.isRequired,
  showMainSite: PropTypes.bool,
  isPersistent: PropTypes.bool
};

export default MediaPlayer;
