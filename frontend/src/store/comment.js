import { csrfFetch } from "./csrf";

const ADD_COMMENTS = 'comments/addComments';
const ADD_ONE_COMMENT = 'comments/addOneComment';
const REMOVE_ONE_COMMENT = 'comments/removeOneComment';
//const cafeId = cafe.id


const addComments = (answers) => {
    //console.log(answers, "HELLO")
    return {
        type: ADD_COMMENTS,
        answers,
    };
};

const addOneComment = (payload) => {
    return {
        type: ADD_ONE_COMMENT,
        payload
    };
};

const removeOneComment = (id) => {
    return {
        type: REMOVE_ONE_COMMENT,
        id,
    };
};



export const deleteComment = (id) => async (dispatch) => {
    //console.log(answer,"ANSWER")

    const response = await csrfFetch(`/api/reviews/${id}`, {
        method: 'DELETE'
    });

    if (response.ok) {
        //const data = await response.json()
        //console.log(data,"DATA")
        dispatch(removeOneComment(id));
        //what should i key in?
    }
};


export const getAllComments = (id) => async (dispatch) => {
    //this is getting all comments for one single cafe
    const response = await csrfFetch(`/api/reviews/cafes/${id}`);
    if (response.ok) {
        const data = await response.json();
        //console.log(data,"DATA HERE")
        dispatch(addComments(data.answers));
        //data.answers is an array here in postman
    }
};

export const addComment = (comment) => async (dispatch) => {
    const response = await csrfFetch(`/api/reviews/new`, {
        method: 'POST',
        //headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(comment)
    });

    if (response.ok) {
        const data = await response.json();
        //console.log('add', data);
        dispatch(addOneComment(data));
        return response;
    }
};



// export const deleteSpot = (id) => async (dispatch) => {
//   await csrfFetch(`/api/spots/${id}`, { method: 'DELETE' })
//   dispatch(updateSpotExistence());
// }



//should write down the format before going forwards 
const commentReducer = (state = {}, action) => {
    let newState = {};
    switch (action.type) {
        case ADD_COMMENTS:
            //action.answers is an array. now spreading array in object
            //newState = { ...action.answers } write in diff way
            action.answers.forEach((answer) => {
                newState[answer.id] = answer
            })
            return newState;
        case ADD_ONE_COMMENT:
            newState = { ...state, [action.payload.id]: action.payload };
            return newState;

        case REMOVE_ONE_COMMENT:
            newState = { ...state };
            delete newState[action.id];
            return newState;
        default:
            return state;
    }
};

export default commentReducer;

// this is the struture of ADD_ONE_COMMENT
// {
//     "id": 38,
//     "userId": 1,
//     "businessId": 40,
//     "answer": "test",
//     "updatedAt": "2022-04-08T18:01:36.361Z",
//     "createdAt": "2022-04-08T18:01:36.361Z"
// }

//   this is the struture of ADD_COMMENTS
//{
//     27: {
//         "id": 27,
//         "userId": 4,
//         "businessId": 48,
//         "answer": "hi",
//         "createdAt": "2022-04-08T00:13:33.985Z",
//         "updatedAt": "2022-04-08T00:13:33.985Z"
//     },
//     37: {
//         "id": 37,
//         "userId": 1,
//         "businessId": 48,
//         "answer": "hhhh",
//         "createdAt": "2022-04-08T17:41:04.953Z",
//         "updatedAt": "2022-04-08T17:41:04.953Z"
//     }
// }
