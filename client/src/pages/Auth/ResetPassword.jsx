import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import Alert from '../../components/Alert';
import { TwitterIcon } from '../../components/forms/Icon';
import Spinner from '../../components/forms/Spinner';

const ResetPassword = ({ history, location }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [disable, setDisable] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();

  useEffect(() => {
    password.length >= 8 && confirmPassword.length >= 8
      ? setDisable(false)
      : setDisable(true);
  }, [password, confirmPassword]);

  const handleClick = async () => {
    setLoading(true);
    if (password !== confirmPassword) {
      setLoading(false);
      setError("Passwords doesn't match");
      return;
    }
    if (password === confirmPassword) {
      try {
        setLoading(false);
        const { data } = await axios.post(`/api/auth/setPassword`, {
          id: location.state.id,
          password,
        });
        setLoading(false);
        localStorage.setItem('token', JSON.stringify(data.token));
        dispatch({ type: 'USER_SUCCESS', payload: data.user });
        dispatch({ type: 'USER_AUTH', payload: true });
        history.push('/home');
      } catch (err) {
        setLoading(false);
        setError(err?.response?.data.msg);
      }
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
        <div className="resetPassword pl-15 pr-15">
          <span className="font-700 font-xl block">Reset your Password</span>
          <div className="flex-row mt-20">
            <img
              src={location.state?.profilePic}
              alt="profile pic"
              className="border-round "
              width="50"
              height="50"
            />
            <div className="ml-20">
              <span className="block font-2sm font-700">
                {location.state?.name}
              </span>
              <span className="block font-sm font-450 text-secondary">
                @{location.state?.username}
              </span>
            </div>
          </div>
          <span className="font-500 font-2sm block mt-20 text-semi-dark">
            Strong password include numbers, letters and punctuation marks.
          </span>
          <span className="block font-700 mt-15 mb-10">
            Enter your new password
          </span>
          <input
            type="password"
            className="w-90 border-secondary border-semi-round pt-10 pb-10 pl-10 "
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <span className="block font-700 mt-15 mb-10">
            Enter your password one more time
          </span>
          <input
            type="password"
            className="w-90 border-secondary border-semi-round pt-10 pb-10 pl-10"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <span className="font-500 font-2sm block mt-15 text-semi-dark">
            Resetting your password will log you out of all your active zwitter
            sessions.{' '}
          </span>
          <button
            className={`fill-button mt-15 text-white ${disable && 'opac-5'}`}
            disabled={disable}
            onClick={handleClick}
          >
            Reset Password
          </button>
        </div>
      )}
    </>
  );
};

export default ResetPassword;
