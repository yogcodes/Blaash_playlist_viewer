import React from 'react';
import './PlaylistCard.css';
import { useDrag, useDrop } from 'react-dnd';

const PlaylistCard = ({onClick, id, title, thumbnail, videos, index, moveCard }) => {
  const [, drag] = useDrag(() => ({
    type: 'CARD',
    item: { id, index },
  }));

  const [, drop] = useDrop(() => ({
    accept: 'CARD',
    hover: (draggedItem) => {
      if (draggedItem.index !== index) {
        moveCard(draggedItem.index, index);
        draggedItem.index = index;
      }
    },
  }));

  return (<div ref={(node) => drag(drop(node))} onClick={onClick} className="playlist-card">
  <div className="thumbnail-container">
    <img src={thumbnail} alt={title} className="playlist-thumbnail" />
    <div className="overlay">
      <div className="more-options">⋮</div>
    </div>
  </div>
  <div className="playlist-info">
    <h4 className="playlist-title">{title}</h4>
    <p className="playlist-videos">{videos} Videos</p>
  </div>
</div>

  );
};

export default PlaylistCard;
