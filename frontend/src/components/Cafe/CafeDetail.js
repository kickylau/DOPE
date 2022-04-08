import { useDispatch, useSelector } from 'react-redux';
import { deleteCafe, getAllCafes, getOneCafe } from '../../store/cafes';
import { useHistory } from 'react-router-dom';
//import UpdateCafe from "./UpdateCafe";
import { useState, useEffect } from "react"
import "./CafePage.css"
//import Answer from "../CommentPage/index"
import { useParams } from 'react-router-dom';
import { getAllComments, addComment, deleteComment } from '../../store/comment';
import CreateComment from '../CommentPage/CreateComment';

const CafeDetail = () => {
  //const cafe = { id,img,title,description,address,city,zipCode}
  const dispatch = useDispatch();
  const { id } = useParams()
  //console.log({cafe})
  const history = useHistory();
  const sessionUser = useSelector((state) => state.session.user)
  const currentCafe = useSelector((state) => state.cafe[id])
  //const currentComment = useSelector((state)=> state.comment)

  //console.log(currentCafe, "CURRENT CAFE")

  //its a string here instead of integer
  const comments = useSelector((state) => state.comment)
  //find the state what it goes it, useSelector grabbing from the state
  //console.log("comments", comments)
  //its undefined
  useEffect(() => {
    dispatch(getAllCafes())
    dispatch(getOneCafe(+id))
    //then look at the function
    dispatch(getAllComments(+id))
  }, [dispatch, id])

  // if (!currentCafe) {
  //   return null;
  // }

  const { img, title, description, address, city, zipCode } = currentCafe
  //same as currentCafe.img .title etc ...


  //console.log(currentCafe,"CURRENT CAFE HERE ")

  // if(!answers){
  //   return null;
  // }

  //console.log(currentCafe,"HERE")

  //have to be consistent with what you key in
  const handleDelete = (id) => {
    if (+sessionUser.id === +currentCafe.ownerId) {

          dispatch(deleteCafe(+id));
          history.push("/cafes")

      } else {
        return (<h2>ONLY CAFE OWNER CAN UPDATE OR DELETE </h2>)
      }
      //console.log(currentCafe,"DEFINE DELETE CURRENTCAFE")

      //history.push('/login');
  };

  const openEdit = (id) => {
    if (+sessionUser.id === +currentCafe.ownerId) {
      history.push(`/cafes/${id}/edit`)
    } else {
      return (<h2>ONLY CAFE OWNER CAN UPDATE OR DELETE </h2>)
    }
  }

  const handleDeleteComment = (e) => {
    const id = parseInt(e.target.id.split("delete-review-")[1],10)
    //in order to get the review id
    dispatch(deleteComment(id))

  }
  //id rightnow here is actually the event , since this is eventhandler


  return (

    <div>
      <div className='cafe-detail'>
        <img src={img} className='cafe-img' id="img" />
        <h3 className='cafe-title'>{title}</h3>
        <h4 className='cafe-description'>{description}</h4>
        <h5 className='cafe-address' >Address: {address}</h5>
        <h5 className='cafe-city'>City: {city}</h5>
        <h5 className='cafe-zipCode'>Zipcode: {zipCode}</h5>
        <div>
          <button onClick={() => handleDelete(+id)} className='delete-button'>
            {/* has to be key in right  */}
            Delete
          </button>
          <button onClick={openEdit} className='update-button'>
            Update
          </button>
        </div>
      </div>

      <div className="review-detail">
        <div className = "container">
        <h4>Reviews</h4>

        <CreateComment currentCafe={currentCafe} />
        {Object.values(comments)?.map((comment) => (
          <div>
            <span className="reviews">
              {comment.answer}
            </span>
            {(+sessionUser.id === +comment.userId) && (
              <button id={`delete-review-${comment.id}`} className="delete-comment" onClick={handleDeleteComment}>Delete</button>
            )
            }
          </div>
        ))}
        </div>
      </div>
    </div>

  );
};
export default CafeDetail;
