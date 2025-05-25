// News component to display latest updates and announcements

const News = () => {
  // Sample news data - in a real app, this would come from an API
  const newsItems = [
    {
      id: 1,
      title: 'New Feature: Important Notes',
      date: '2025-05-25',
      content: 'We\'ve added a new section to highlight important notes. Notes with likes or containing "!" will appear here.',
      isNew: true
    },
    {
      id: 2,
      title: 'Mobile Responsiveness',
      date: '2025-05-24',
      content: 'The app is now fully responsive on mobile devices. Try it out on your phone!',
      isNew: true
    },
    {
      id: 3,
      title: 'Welcome to Sticky Notes',
      date: '2025-05-23',
      content: 'Welcome to our new sticky notes application. Start creating and sharing notes today!',
      isNew: false
    }
  ];

  return (
    <div className="news-section" style={{
      margin: '30px 0',
      padding: '20px',
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      borderRadius: '8px',
      border: '1px solid rgba(255, 255, 255, 0.15)',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      fontFamily: '"Times New Roman", Times, serif',
      maxWidth: '1200px',
      marginLeft: 'auto',
      marginRight: 'auto',
      boxSizing: 'border-box',
      color: 'rgba(255, 255, 255, 0.95)',
      textShadow: '0 1px 3px rgba(0,0,0,0.8)'
    }}>
      <h2 style={{
        marginTop: 0,
        marginBottom: '20px',
        paddingBottom: '10px',
        borderBottom: '2px solid rgba(255, 193, 7, 0.8)',
        color: '#fff',
        textShadow: '0 1px 2px rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        fontSize: '1.5rem',
        fontWeight: 'normal',
        fontFamily: '"Times New Roman", Times, serif'
      }}>
        <span>📰</span> Latest News & Updates
      </h2>
      
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
        fontFamily: '"Times New Roman", Times, serif'
      }}>
        {newsItems.map((item) => (
          <div key={item.id} style={{
            padding: '15px',
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderLeft: `4px solid ${item.isNew ? 'rgba(255, 193, 7, 0.8)' : 'rgba(108, 117, 125, 0.7)'}`,
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            position: 'relative',
            fontFamily: 'inherit',
            transition: 'all 0.2s ease',
            ':hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              transform: 'translateY(-2px)'
            }
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '10px',
              fontFamily: 'inherit'
            }}>
              <h3 style={{
                margin: '0 0 5px 0',
                color: 'rgba(255, 255, 255, 0.95)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '1.1rem'
              }}>
                {item.title}
                {item.isNew && (
                  <span style={{
                    backgroundColor: 'rgba(255, 193, 7, 0.9)',
                    color: '#000',
                    fontSize: '0.7rem',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontWeight: 'bold',
                    marginLeft: 'auto',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                  }}>
                    NEW
                  </span>
                )}
              </h3>
              <span style={{
                color: '#ffeb3b',
                fontSize: '0.9rem',
                fontFamily: 'inherit',
                whiteSpace: 'nowrap',
                marginLeft: 'auto',
                textShadow: '0 1px 2px rgba(0,0,0,0.5)'
              }}>
                {new Date(item.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </span>
            </div>
            <p style={{
              margin: '10px 0 0 0',
              color: '#ffeb3b',
              lineHeight: '1.6',
              fontSize: '1rem',
              fontFamily: 'inherit',
              textShadow: '0 1px 2px rgba(0,0,0,0.5)'
            }}>
              {item.content}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

News.propTypes = {
  // Add any props if needed in the future
};

export default News;