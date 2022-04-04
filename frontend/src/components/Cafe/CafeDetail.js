import { useDispatch } from 'react-redux';
import { deleteCafe } from '../../store/cafes';
import UpdateCafe from "./UpdateCafe";
import {useState} from "react"
//import css

const CafeDetail = ({ id,img,title,description,address,city,zipCode}) => {
  const cafe = { id,img,title,description,address,city,zipCode}
  const dispatch = useDispatch();

  const handleDelete = (id) => {
    dispatch(deleteCafe(id));
  };
  return (
    <div className='cafe-detail'>
      <img src={img} id="img" />
      <span className='cafe-title'>{title}</span>
      <span>description{description}</span>
      <span>address{address}</span>
      <span>city{city}</span>
      <span>zipCode{zipCode}</span>
      <div className='button-row'>
        <button onClick={() => handleDelete(id)} className='delete-button'>
          Delete
        </button>
        <button className='update-button'>Update</button>
      </div>
    </div>
  );
};
export default CafeDetail;
