import React, { useState, useEffect } from "react";
import { useDispatch, useSelector} from "react-redux";
import { Redirect, useHistory,useParams } from "react-router-dom";
import { updateCafe } from "../../store/cafes";



function UpdateCafe() {
    //{currentcafe} no need to prop in because you have the store data
    //console.log(cafe)
    const {id} = useParams()
    const cafes = useSelector(state => Object.values(state.cafe))
    //get a specific cafe based on ID
    const currentCafe = cafes.find(cafeObj => cafeObj.id === +id)
    //?const currentCafe = useSelector(state => Object.values(state.cafe.id))

    //console.log(currentCafe)
    //grab the cafe object to pass into the component??
    const dispatch = useDispatch();
    const history = useHistory();
    const [title, setTitle] = useState(currentCafe?.title);  //conditional chaining
    const [description, setDescription] = useState(currentCafe?.description);
    const [address, setAddress] = useState(currentCafe?.address);
    const [city, setCity] = useState(currentCafe?.city);
    const [zipCode, setZipCode] = useState(currentCafe?.zipCode);
    const [img, setImg] = useState(currentCafe?.img);
    const [errors, setErrors] = useState([]);
    const sessionUser = useSelector((state)=>state.session.user)

    //console.log(sessionUser)

    //console.log(id)
    if(!sessionUser){
        return null;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors([]);

        const payload = {
            ...currentCafe,
            id, //missing the cafe id
            ownerId:sessionUser.id,
            title,
            description,
            address,
            city,
            zipCode,
            img,
        };

        //console.log(payload)
        //return the updatedCafe,
        //your createOne variable in your handleSubmit will always be undefined
        //unless you return something in your updateCafe thunk
        const createOne = await dispatch(updateCafe(payload));
        if (createOne){
            history.push('/cafes');
        }
      };


    const handleCancelClick = (e) => {
        e.preventDefault()
        history.push("/cafes/")
    };

       if (sessionUser) {
           return (

            <div className='edit-cafe'>
            <h3>Edit A Cafe</h3>
           <form onSubmit={handleSubmit} className='edit-cafe'>
            <ul>
                {errors.map((error) => <li key={error}>{error}</li>)}
            </ul>
            <div id="cafeForm">
            <label>
                Image
                <input
                    type="text"
                    onChange={(e) => setImg(e.target.value)}
                    value={img}
                    placeholder='Valid Image Url'
                    required
                />
            </label>
            <label>
                Title
                <input
                    type="text"
                    onChange={(e) => setTitle(e.target.value)}
                    value={title}
                    placeholder='Valid Cafe Title'
                    required
                />
            </label>
             <label>
                Description
                <input
                    type="text"
                    onChange={(e) => setDescription(e.target.value)}
                    value={description}
                    placeholder='Valid Description'
                    required
                /></label>
            <label>
                Address
                <input
                    type="text"
                    onChange={(e) => setAddress(e.target.value)}
                    value={address}
                    placeholder='Valid Address'
                    required
                />
            </label>
            <label>
                City
                <input
                    type="text"
                    onChange={(e) => setCity(e.target.value)}
                    value={city}
                    placeholder='Valid City'
                    required
                />
            </label>
            <label>
                Zipcode
                <input
                    type="text"
                    onChange={(e) => setZipCode(e.target.value)}
                    value={zipCode}
                    placeholder='Valid ZipCode'
                    required
                /></label>

            <button className='submit-button' type='submit'>
                Update Cafe
            </button>
            <button type="button" className='cancel-button' onClick={handleCancelClick} >
                Cancel
            </button>
            </div>

        </form>
        </div>
        )
       } else {
            return (<h2>PLEASE LOG IN FIRST TO UPDATE </h2>)
        }
        // {/* </div> */}

}

export default UpdateCafe;
