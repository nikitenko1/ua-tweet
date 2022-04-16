import React, { useState } from 'react';
import axios from 'axios';
import Alert from '../../components/Alert';
import { TwitterIcon } from '../../components/forms/Icon';
import Spinner from '../../components/forms/Spinner';

const ConfirmPinReset = ({ location, history }) => {
  const account = location.state?.email ? 'email' : 'phone';
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      const { data } = await axios.post(`/api/auth/password-token-verify`, {
        id: location.state.id,
        code,
      });
      setLoading(false);
      history.push({
        pathname: '/reset_password',
        state: {
          id: data.id,
          name: data.name,
          username: data.username,
          profilePic: data.profilePhoto.url,
        },
      });
    } catch (err) {
      setLoading(false);
      setError(err?.response?.data?.msg);
    }
  };
  return (
    <>
      {error && <Alert message={error} errorTimeout={() => setError('')} />}
      <nav className="flex-row justify-center items-center pt-10 pb-10">
        <TwitterIcon />
        <span className="text-secondary ml-10 font-md">Password Reset</span>
      </nav>
      <hr className="text-secondary mb-20" />
      {loading ? (
        <Spinner />
      ) : (
        <div className="confirmPinReset pl-15 pr-15">
          <span className="font-700 font-xl">Check your {account}</span>
          <span className="text-semi-dark font-500 font-2sm block mt-20">
            You'll receive a code to verify here so you can reset your account
            password.
          </span>
          <input
            type="text"
            className="w-90"
            placeholder="Enter your code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <button
            className="fill-button mt-20 block text-white"
            onClick={handleClick}
          >
            Verify
          </button>
          {account === 'email' && (
            <span className="text-semi-dark font-500 font-2sm block mt-15">
              If you don't see the email, check other places it might be, like
              your junk, spam, or other folders.
            </span>
          )}
        </div>
      )}
    </>
  );
};

export default ConfirmPinReset;
