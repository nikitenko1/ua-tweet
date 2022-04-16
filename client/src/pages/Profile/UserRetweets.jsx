import axios from 'axios';
import React, { useState, useEffect } from 'react';
import CreatePost from '../../components/CreatePost';
import Spinner from '../../components/forms/Spinner';

const UserRetweets = ({ username, config, history }) => {
  const [retweets, setRetweets] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getRetweets = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(
          `/api/user/${username}/retweets`,
          config
        );
        setRetweets(data);
        setLoading(false);
      } catch (err) {
        console.log(err.response);
        setLoading(false);
      }
    };
    getRetweets();
  }, [config, username]);

  return (
    <div className="pos-relative">
      {loading ? (
        <Spinner />
      ) : (
        <>
          {retweets.length === 0 ? (
            <div className="text-center mt-15">
              <span className="block font-700 font-md text-align">
                You havn't retweeted yet
              </span>
              <span className="block text-secondary">
                When you have retweeted, it will show up here
              </span>
            </div>
          ) : (
            <>
              {retweets?.map((retweet) => (
                <CreatePost
                  key={retweet._id}
                  post={retweet}
                  history={history}
                />
              ))}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default UserRetweets;
