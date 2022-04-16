import axios from 'axios';
import React, { useState, useEffect } from 'react';
import CreatePost from '../../components/CreatePost';
import Spinner from '../../components/forms/Spinner';

const UserLikes = ({ username, config, history }) => {
  const [likes, setLikes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getLikes = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(`/api/user/${username}/likes`, config);

        setLikes(data);
        setLoading(false);
      } catch (err) {
        console.log(err.response);
        setLoading(false);
      }
    };
    getLikes();
  }, [config, username]);

  return (
    <div className="pos-relative">
      {loading ? (
        <Spinner />
      ) : (
        <>
          {likes.length === 0 ? (
            <div className="text-center mt-15">
              <span className="block font-700 font-md text-align">
                You havn't liked any tweet yet
              </span>
              <span className="block text-secondary">
                When you have liked, it will show up here
              </span>
            </div>
          ) : (
            <>
              {likes?.map((like) => (
                <CreatePost key={like._id} post={like} history={history} />
              ))}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default UserLikes;
