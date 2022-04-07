import { useDispatch, useSelector } from 'react-redux';
import { deleteCafe, updateCafe } from '../../store/cafes';
import { useHistory } from 'react-router-dom';
//import UpdateCafe from "./UpdateCafe";
import {useState} from "react"
import "./CafePage.css"
//import Answer from "../CommentPage/index"
import CreateComment from '../CommentPage/CreateComment';
import { useParams } from 'react-router-dom';

const CafeDetail = () => {
  //const cafe = { id,img,title,description,address,city,zipCode}
  const dispatch = useDispatch();
  //const [toggleEdit, setToggleEdit] = useState(false);
  const {id} = useParams()
  //console.log({cafe})
  const history = useHistory();
  const sessionUser = useSelector((state)=>state.session.user)

  //const cafeId = cafe.id
    const currentCafe = useSelector((state)=>state.cafe[id])
    const { img,title,description,address,city,zipCode} = currentCafe
    //same as currentCafe.img .title etc ...


  //console.log(currentCafe,"HERE")


  const handleDelete = ({currentCafe}) => {
    if(sessionUser){
      dispatch(deleteCafe({currentCafe}));
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
      <img src={currentCafe.img} className='cafe-img' id="img" />
      <span className='cafe-title'>{title}</span>
      <span className='cafe-description'>{description}</span>
      <span className='cafe-address' >Address:{address}</span>
      <span className = 'cafe-city'>City:{city}</span>
      <span className = 'cafe-zipCode'>ZipCode:{zipCode}</span>
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
