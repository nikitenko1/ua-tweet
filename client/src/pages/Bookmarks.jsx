import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import Spinner from '../components/forms/Spinner';
import CreatePost from '../components/CreatePost';

function Bookmarks({ history }) {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(false);

  const auth = useSelector((state) => state.auth);
  const { config } = auth;

  useEffect(() => {
    const getBookmarks = async () => {
      setLoading(true);
      const { data } = await axios.get(`/api/user/bookmarks`, config);
      setLoading(false);
      setBookmarks(data);
    };
    getBookmarks();
  }, []);

  return (
    <div>
      <div className="main__header">
        <span>Bookmarks</span>
      </div>

      {loading ? (
        <Spinner />
      ) : (
        <>
          {bookmarks.length === 0 ? (
            <div className="text-center mt-15">
              <span className="block font-700 font-md text-align">
                You havn't bookmarked any tweet yet
              </span>
              <span className="block text-secondary">
                When you have bookmarked, it will show up here
              </span>
            </div>
          ) : (
            <>
              {bookmarks?.map((bookmark) => (
                <CreatePost
                  key={bookmark._id}
                  post={bookmark}
                  history={history}
                />
              ))}
            </>
          )}
        </>
      )}
    </div>
  );
}

export default Bookmarks;
