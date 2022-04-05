import { useDispatch } from 'react-redux';
import { deleteCafe, updateCafe } from '../../store/cafes';
import { useHistory } from 'react-router-dom';
//import UpdateCafe from "./UpdateCafe";
import {useState} from "react"
//import css

const CafeDetail = ({ id,img,title,description,address,city,zipCode}) => {
  const cafe = { id,img,title,description,address,city,zipCode}
  const dispatch = useDispatch();
  //const [toggleEdit, setToggleEdit] = useState(false);

  const history = useHistory();

  const handleDelete = (id) => {
    dispatch(deleteCafe(id));
  };

   const openEdit = () => {
     history.push(`/cafes/${id}/edit`)
  //    setToggleEdit(!toggleEdit)
   }

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
        <button onClick={openEdit} className='update-button'>Update</button>
      </div>
    </div>
  );
};
export default CafeDetail;
