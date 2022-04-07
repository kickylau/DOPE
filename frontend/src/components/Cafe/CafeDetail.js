import { useDispatch, useSelector } from 'react-redux';
import { deleteCafe, getAllCafes, getOneCafe } from '../../store/cafes';
import { useHistory } from 'react-router-dom';
//import UpdateCafe from "./UpdateCafe";
import { useState, useEffect } from "react"
import "./CafePage.css"
//import Answer from "../CommentPage/index"
import { useParams } from 'react-router-dom';
import { getAllComments,addComment,deleteComment } from '../../store/comment';
import CreateComment from '../CommentPage/CreateComment';

const CafeDetail = () => {
  //const cafe = { id,img,title,description,address,city,zipCode}
  const dispatch = useDispatch();
  const { id } = useParams()
  //console.log({cafe})
  const history = useHistory();
  const sessionUser = useSelector((state) => state.session.user)
  const currentCafe = useSelector((state) => state.cafe[+id])
  //its a string here instead of integer
  const answers = useSelector((state) => state.answer)
  console.log("answers", answers)
  //its undefined
  useEffect(() => {
    dispatch(getAllCafes())
    dispatch(getAllComments(+id))
  }, [dispatch,id])

  if(!currentCafe){
    return null;
  }

  const { img, title, description, address, city, zipCode } = currentCafe
  //same as currentCafe.img .title etc ...



  //console.log(currentCafe,"CURRENT CAFE HERE ")



  // if(!answers){
  //   return null;
  // }

  //console.log(currentCafe,"HERE")

  //have to be consistent with what you key in
  const handleDelete = (id) => {
    if (sessionUser) {
      if (sessionUser.id === currentCafe.ownerId) {
        dispatch(deleteCafe(id));
        history.push("/cafes")
      }
      //console.log(currentCafe,"DEFINE DELETE CURRENTCAFE")
    } else {
      //<h2>COMMENTS</h2>
      //history.push('/login');
      return (<h2>ONLY CAFE OWNER CAN UPDATE OR DELETE </h2>)
    }
  };

  const openEdit = () => {
    history.push(`/cafes/${id}/edit`)
    //    setToggleEdit(!toggleEdit)
  }

  return (

    <div className='cafe-detail'>
      <img src={img} className='cafe-img' id="img" />
      <h3 className='cafe-title'>{title}</h3>
      <h4 className='cafe-description'>{description}</h4>
      <h5 className='cafe-address' >Address: {address}</h5>
      <h5 className='cafe-city'>City: {city}</h5>
      <h5 className='cafe-zipCode'>Zipcode: {zipCode}</h5>
      <div className='button-row'>

        <button onClick={() => handleDelete(id)} className='delete-button'>
          {/* has to be key in right  */}
          Delete
        </button>
        <button onClick={openEdit} className='update-button'>Update</button>
        {/* <div>
          <Comment />
        </div> */}
      </div>
      {/* <div>
        <h2>COMMENTS</h2>

        <CreateComment currentCafe={currentCafe} />
        {answers?.map((answer)=>{
          if (sessionUser){
            if (sessionUser.id === answer.userId){
              <button className="delete-comment" onClick={()=>{
                dispatch(deleteComment(answer))
              }}> Delete Comment</button>
            }
          }
        })}
      </div> */}



    </div>

  );
};
export default CafeDetail;
