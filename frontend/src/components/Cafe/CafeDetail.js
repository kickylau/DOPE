import { useDispatch, useSelector } from 'react-redux';
import { deleteCafe, updateCafe } from '../../store/cafes';
import { useHistory } from 'react-router-dom';
//import UpdateCafe from "./UpdateCafe";
import {useState} from "react"
import "./CafePage.css"
//import Answer from "../CommentPage/index"
import CreateComment from '../CommentPage/CreateComment';

const CafeDetail = ({ id,img,title,description,address,city,zipCode}) => {
  const cafe = { id,img,title,description,address,city,zipCode}
  const dispatch = useDispatch();
  //const [toggleEdit, setToggleEdit] = useState(false);

  const history = useHistory();
  const sessionUser = useSelector((state)=>state.session.user)


  const handleDelete = (id) => {
    if(sessionUser){
      dispatch(deleteCafe(id));
    } else {
      history.push('/login');
    }
  };

   const openEdit = () => {
     history.push(`/cafes/${id}/edit`)
  //    setToggleEdit(!toggleEdit)
   }

  return (

    <div className='cafe-detail'>
      <img src={img} className='cafe-img' id="img" />
      <span className='cafe-title'>{title}</span>
      <span className='cafe-description'>{description}</span>
      <span className='cafe-address' >Address{address}</span>
      <span className = 'cafe-city'>City{city}</span>
      <span className = 'cafe-zipCode'>ZipCode{zipCode}</span>
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
