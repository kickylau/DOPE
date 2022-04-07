import { csrfFetch } from "./csrf";
const ADD_COMMENTS = 'comments/addComments';
const ADD_ONE_COMMENT = 'comments/addOneComment';
const REMOVE_ONE_COMMENT = 'comments/removeOneComment';



const addComments = (payload,businessId) => {
    console.log(payload)
    return {
        type: ADD_COMMENTS,
        payload,
        businessId,
    };
};

const addOneComment = (payload) => {
    return {
        type: ADD_ONE_COMMENT,
        payload
    };
};

const removeOneComment = (payload,businessId,) => {
    return {
        type: REMOVE_ONE_COMMENT,
        payload,
        businessId,
     };
};

export const getAllComments = (id) => async (dispatch) => {
    const response = await csrfFetch(`/api/cafes/${id}/comments`);
    if (response.ok) {
        const data = await response.json();
        dispatch(addComments(data,id));
    }
};

export const addComment = (id) => async (dispatch) => {
    const response = await csrfFetch(`/api/cafes/${id}/comments/new`, {
        method: 'POST',
        //headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(id)
    });

    if (response.ok) {
        const data = await response.json();
        //console.log('add', data);
        dispatch(addOneComment(data));
        return response;
    }
};





export const deleteComment = (id) => async (dispatch) => {
    const response = await csrfFetch(`/api/comments/${id}`, {
        method: 'DELETE'
    });

    if (response.ok) {
        //const data = await response.json()
        //console.log(data)
        dispatch(removeOneComment(id));
        //what should i key in?
    }
};



// export const deleteSpot = (id) => async (dispatch) => {
//   await csrfFetch(`/api/spots/${id}`, { method: 'DELETE' })
//   dispatch(updateSpotExistence());
// }

const commentReducer = (state = {}, action) => {
    let newState = {};
    switch (action.type) {
        case ADD_COMMENTS:
            action.payload.forEach((answer) => (newState[answer.id] = answer));
            return newState;
        case ADD_ONE_COMMENT:
            newState = { ...state, [action.payload.id]: action.payload };
            return newState;
            // newState = Object.assign({},state)
            // newState.cafe = action.payload //normalizing data
            // return newState
        case REMOVE_ONE_COMMENT:
            newState = { ...state };
            delete newState[action.payload];
            return newState;
        default:
            return state;
    }
};

export default commentReducer;
