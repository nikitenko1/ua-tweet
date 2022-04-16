import React, { useState, useEffect } from 'react';
import axios from 'axios';
import BigModal from '../modals/BigModal';
import { CloseIcon, SearchIcon } from './Icon';

const Gif = ({ handleClose, handleGif }) => {
  const [gifs, setGifs] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const getData = async () => {
      const { data } = await axios.get(
        // Gif URL api.giphy.com/v1/gifs/trending: api_key: string(required)
        'https://api.giphy.com/v1/gifs/trending',
        {
          // beta keys, which are rate limited (42 reads per hour and 1000 searches/API calls per day.)
          params: {
            // api_key: process.env.REACT_APP_GIF_API,
          },
        }
      );
      // Successful Response (200 OK) data: GIF Object[] pagination: Pagination Object meta: Meta Object
      setGifs(data.data);
    };
    getData();
  }, []);
  const handleClick = async () => {
    // Gif URL api.giphy.com/v1/gifs/search: api_key: string(required); q: string(required)
    // Max length: 50 chars.
    const { data } = await axios.get('https://api.giphy.com/v1/gifs/search', {
      params: {
        // api_key: process.env.REACT_APP_GIF_API,
        q: search,
      },
    });
    // Successful Response (200 OK) data: GIF Object[] pagination: Pagination Object meta: Meta Object
    setGifs(data.data);
  };

  return (
    <BigModal onClose={handleClose}>
      <div className="modalCloseButton">
        <div className="flex-row items-center">
          <span className="pointer" onClick={handleClose}>
            <CloseIcon />
          </span>
          <span className="font-800 font-md ml-20 flex-1">
            <div className="searchBar">
              <div>
                <SearchIcon className="svg-20 fill-secondary" />
              </div>
              <input type="text" onChange={(e) => setSearch(e.target.value)} />
            </div>
          </span>
          <button
            className="fill-button text-white ml-10"
            onClick={handleClick}
          >
            Search
          </button>
        </div>
      </div>
      <div id="photos">
        {gifs.map((g) => (
          <div key={g.id}>
            <img
              src={g.images.fixed_height.url}
              alt=""
              onClick={() =>
                handleGif({ id: g.id, url: g.images.fixed_height.url })
              }
            />
          </div>
        ))}
      </div>
    </BigModal>
  );
};

export default Gif;
