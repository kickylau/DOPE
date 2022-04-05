import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addCafe } from '../../store/cafes';
import { useHistory } from 'react-router-dom';

const CreateCafe = () => {
  const [img, setImg] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [errors, setErrors] = useState([])
  const sessionUser = useSelector((state)=>state.session.user)

  const cafe = useSelector(state => Object.values(state.cafe))
  //console.log(cafe)
  const history = useHistory();
  const dispatch = useDispatch();
  const handleCancelClick = (e) => {
    e.preventDefault()
    history.push("/cafes")
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ownerId:sessionUser.id,
      img,
      title,
      description,
      address,
      city,
      zipCode,
    };

    const createOne = await dispatch(addCafe(payload));
    if (createOne){
        history.push('/cafes');
    }

    //reset();
  };


  const reset = () => {
    setTitle("");
    setImg("")
    setDescription("");
    setAddress("");
    setCity("");
    setZipCode("")
  };

  if (sessionUser) {
    return (
      <a>
      <div className='add-cafe'>
      <h3>Add A Cafe</h3>
      <form onSubmit={handleSubmit} className='add-cafe'>
        Image Url
        <input
          onChange={(e) => setImg(e.target.value)}
          value={img}
          placeholder='Image Url'
          required
        />
        Cafe Title
        <input
          onChange={(e) => setTitle(e.target.value)}
          value={title}
          placeholder='Cafe Title'
          required
        />
        Description
        <input
          onChange={(e) => setDescription(e.target.value)}
          value={description}
          placeholder='Description'
          required
        />
        Address
        <input
          onChange={(e) => setAddress(e.target.value)}
          value={address}
          placeholder='Address'
          required
        />
        City<input
          onChange={(e) => setCity(e.target.value)}
          value={city}
          placeholder='City'
          required
        />
        Zipcode<input
          onChange={(e) => setZipCode(e.target.value)}
          value={zipCode}
          placeholder='ZipCode'
          required
        />
        <button className='submit-button' type='submit'>
          Add Cafe
        </button>
        <button type="button" className = 'cancel-button' onClick={handleCancelClick}>
          Cancel
        </button>
      </form>
    </div>
    </a>)
        } else {
          return (<h2>PLEASE LOG IN FIRST TO CREATE </h2>)
      }
};
export default CreateCafe;
