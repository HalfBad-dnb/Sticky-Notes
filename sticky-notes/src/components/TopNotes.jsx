import '../App.css';
import PropTypes from 'prop-types';

const TopNotes = ({ notes }) => {
  const topNotes = [...notes]
    .sort((a, b) => b.likes - a.likes || a.dislikes - b.dislikes)
    .slice(0, 10);

  return (
    <div className="top-notes-container"> {/* Added container class */}
      <div className="sticky-board fullscreen">
        <div className="p-4">
          <h1 className="notes-title">Top 10 Most Liked Notes</h1>
          {topNotes.length === 0 ? (
            <p className="text-white text-center">No notes yet!</p>
          ) : (
            <ul className="top-notes-list mt-4 space-y-3">
              {topNotes.map((note, index) => (
                <li
                  key={note.id}
                  className="top-note-item"
                  style={{ backgroundColor: note.color }}
                >
                  <div className="flex items-center justify-between p-2">
                    <span className="rank-number">#{index + 1}</span>
                    <div className="note-content flex-1 mx-2">
                      <p>{note.text}</p>
                    </div>
                    <div className="note-actions flex items-center gap-3">
                      <span className="like-count">{note.likes} 👍</span>
                      <span className="dislike-count">{note.dislikes} 👎</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

TopNotes.propTypes = {
  notes: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      text: PropTypes.string.isRequired,
      color: PropTypes.string.isRequired,
      likes: PropTypes.number.isRequired,
      dislikes: PropTypes.number.isRequired,
    })
  ).isRequired,
};

export default TopNotes;