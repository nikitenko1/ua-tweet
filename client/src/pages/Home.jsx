import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Route } from 'react-router-dom';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { listPosts } from '../redux/actions/postAction';
import { TweetIcon } from '../components/forms/Icon';
import CreatePost from '../components/CreatePost';
import Spinner from '../components/forms/Spinner';
import Tweet from '../components/Tweet';
import TweetContainer from '../components/TweetContainer';

const Home = () => {
  const [tweetModal, setTweetModal] = useState(false);
  const [posts, setPosts] = useState([]);

  const smallScreen = useMediaQuery('(max-width:500px)');

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(listPosts());
  }, [dispatch]);

  const postList = useSelector((state) => state.postList);
  const {
    postLoaded = false,
    recentPost = '',
    postedList,
    deletedPost = '',
  } = postList;

  useEffect(() => {
    setPosts(postedList);
  }, [postedList]);

  useEffect(() => {
    if (recentPost) setPosts([recentPost, ...posts]);
  }, [recentPost]);

  useEffect(() => {
    if (deletedPost) {
      setPosts(posts.filter((post) => post._id !== deletedPost));
    }
  }, [deletedPost]);

  return (
    <>
      <div className="main__header">
        <span>HOME</span>
      </div>
      {smallScreen ? (
        <button
          className={`fill-button border-round tweetButton `}
          onClick={() => setTweetModal(true)}
        >
          <TweetIcon className="fill-white" />
        </button>
      ) : (
        <>
          <TweetContainer
            label="img"
            textareaMinHeight={2}
            placeholder="What's happening?"
          />

          <div style={{ borderTop: '10px solid var(--lightColor)' }}></div>
        </>
      )}
      <div className="pos-relative">
        {!postLoaded ? (
          <Spinner />
        ) : (
          posts?.map((post) => (
            <Route
              key={post._id}
              // You can spread routeProps (history) to make them available to your rendered Component
              render={({ history }) => (
                <CreatePost history={history} post={post} />
              )}
            />
          ))
        )}
      </div>
      <div style={{ marginBottom: '60px' }}></div>

      {tweetModal && <Tweet handleClose={() => setTweetModal(false)} />}
    </>
  );
};

export default Home;
