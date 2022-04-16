import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import Followers from './FollowerFollowing/Followers';
import Spinner from '../components/forms/Spinner';

const Connect = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const auth = useSelector((state) => state.auth);
  const { config } = auth;

  useEffect(() => {
    const getUsers = async () => {
      setLoading(true);
      const { data } = await axios.get(`/api/user/connect`, config);
      console.log(data);
      setLoading(false);
      setUsers(data);
    };
    getUsers();
  }, [config]);

  return (
    <>
      <div className="main__header">
        <span>Connect</span>
      </div>
      {loading ? (
        <Spinner />
      ) : (
        <>
          {users.length === 0 ? (
            <div className="text-center mt-15">
              <span className="block font-700 font-md text-align">
                You don't have any one to connect
              </span>
              <span className="block text-secondary">
                When you have, it will show up here
              </span>
            </div>
          ) : (
            <>
              {users.map((user) => (
                <Followers key={user._id} follower={user} />
              ))}
            </>
          )}
        </>
      )}
    </>
  );
};

export default Connect;
