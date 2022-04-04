import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addCafe } from '../../store/cafes';

const CreateCafe = () => {
  const [img, setImg] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [errors, setErrors] = useState([])
  const cafe = useSelector(state => Object.values(state.cafe))
  const history = useHistory();
  const dispatch = useDispatch();


  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      img,
      title,
      description,
      address,
      city,
      zipCode,
    };
    dispatch(addCafe(payload));

    history.push('/');
    reset();
  };


  const reset = () => {
    setTitle("");
    setImg("")
    setDescription("");
    setAdress("");
    setCity("");
    setZipCode("")
  };

  return (
    <div className='add-cafe'>
      <h3>Add A Cafe</h3>
      <form onSubmit={handleSubmit} className='add-cafe'>
        <input
          onChange={(e) => setImg(e.target.value)}
          value={img}
          placeholder='Image Url'
          required
        />
        <input
          onChange={(e) => setTitle(e.target.value)}
          value={title}
          placeholder='Cafe Title'
          required
        />
        <input
          onChange={(e) => setDescription(e.target.value)}
          value={description}
          placeholder='Description'
          required
        />
           <input
          onChange={(e) => setAddress(e.target.value)}
          value={address}
          placeholder='Address'
          required
        />
           <input
          onChange={(e) => setCity(e.target.value)}
          value={city}
          placeholder='City'
          required
        />
           <input
          onChange={(e) => setZipCode(e.target.value)}
          value={zipCode}
          placeholder='ZipCode'
          required
        />
        <button className='submit-button' type='submit'>
          Add Cafe
        </button>
      </form>
    </div>
  );
};
export default CreateCafe;
