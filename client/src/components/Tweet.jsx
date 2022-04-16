import React from 'react';
import { CloseIcon } from './forms/Icon';
import TweetContainer from './TweetContainer';
import TopModal from './modals/TopModal';

const Tweet = ({ handleClose }) => {
  return (
    <>
      <TopModal onClose={handleClose}>
        <div className="modalCloseButton">
          <span className="pointer" onClick={handleClose}>
            <CloseIcon />
          </span>
        </div>
        <TweetContainer
          label="tweetImg"
          textareaMinHeight={4}
          placeholder="What's happening?"
          onCloseSubmit={handleClose}
        />
      </TopModal>
    </>
  );
};

export default Tweet;
