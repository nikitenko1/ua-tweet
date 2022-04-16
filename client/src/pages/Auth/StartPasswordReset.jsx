import React, { useState } from 'react';
import axios from 'axios';
import Alert from '../../components/Alert';
import { TwitterIcon } from '../../components/forms/Icon';
import Spinner from '../../components/forms/Spinner';

const StartPasswordReset = ({ history }) => {
  const [account, setAccount] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      // @desc    Forgot password token
      const { data } = await axios.post(`/api/auth/password-token`, {
        account,
      });

      history.push({
        pathname: '/confirm_pin_reset',
        state: { id: data.id, email: data.email, phone: data.phone },
      });
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setError(err?.response?.data.msg);
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
        <div className="beginPasswordReset pl-15 pr-15">
          <span className="font-700 font-xl">Find your Twitterf account</span>
          <span className="text-secondary font-sm block mt-20">
            Enter your email, phone or username.
          </span>
          <input
            type="text"
            className="w-90"
            value={account}
            onChange={(e) => setAccount(e.target.value)}
          />
          <button
            className="fill-button mt-20 block text-white"
            onClick={handleClick}
          >
            Search
          </button>
        </div>
      )}
    </>
  );
};

export default StartPasswordReset;
