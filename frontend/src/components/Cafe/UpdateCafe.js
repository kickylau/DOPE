import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Redirect } from "react-router-dom";
//import { updateCafe } from "../../store/cafes";
// import './SignupForm.css'

function UpdateCafe({ cafe }) {
    const dispatch = useDispatch();
    const [title, setTitle] = useState(cafe.title);
    const [description, setDescription] = useState(cafe.description);
    const [address, setAddress] = useState(cafe.address);
    const [city, setCity] = useState(cafe.city);
    const [zipCode, setZipCode] = useState(cafe.zipCode);
    const [img, setImg] = useState(cafe.img);
    const [errors, setErrors] = useState([]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = {
            ...cafe,
            title,
            description,
            address,
            city,
            zipCode,
            img,
        };

        await dispatch(UpdateCafe(payload));
    };

    const handleCancelClick = (e) => {
        e.preventDefault()
    };

    return (
        <div className='edit-cafe'>
            <h3>Edit A Cafe</h3>
            <form onSubmit={handleSubmit} className='edit-cafe'>
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
                <button type="button" onClick={handleCancelClick}>
                    Cancel
                </button>

            </form>
        </div>
    );
}

export default UpdateCafe;
