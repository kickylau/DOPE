import { csrfFetch } from "./csrf";
const ADD_CAFES = 'cafes/addCafes';
const ADD_ONE_CAFE = 'cafes/addOneCafe';
const REMOVE_ONE_CAFE = 'cafes/removeOneCafe';
const UPDATE_CAFE = "cafes/updateCafe";



const addCafes = (payload) => {
    return {
        type: ADD_CAFES,
        payload
    };
};

const addOneCafe = (payload) => {
    return {
        type: ADD_ONE_CAFE,
        payload
    };
};

const removeOneCafe = (id) => {
    return { type: REMOVE_ONE_CAFE, payload: id };
};

export const getAllCafes = () => async (dispatch) => {
    const response = await csrfFetch('/api/cafes');
    if (response.ok) {
        const data = await response.json();
        dispatch(addCafes(data.cafe));
    }
};

export const addCafe = (cafe) => async (dispatch) => {
    const response = await csrfFetch('/api/cafes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cafe)
    });

    if (response.ok) {
        const data = await response.json();
        //console.log('add', data);
        dispatch(addOneCafe(data.cafe));
    }
};


export const updateCafe = (payload) => async (dispatch) => {
    const response = await csrfFetch(`/api/cafes/${payload.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
    if (response.ok) {
        const data = await response.json()
        const updatedCafe = data.cafe
        dispatch(updateCafe(updatedCafe))
    }
}

export const deleteCafe = (id) => async (dispatch) => {
    const response = await csrfFetch(`/api/cafes/${id}`, {
        method: 'DELETE'
    });

    if (response.ok) {
        dispatch(removeOneCafe(id));
    }
};

const cafeReducer = (state = {}, action) => {
    let newState = {};
    switch (action.type) {
        case ADD_CAFES:
            action.payload.forEach((cafe) => (newState[cafe.id] = cafe));
            return newState;
        case ADD_ONE_CAFE:
            newState = { ...state, [action.payload.id]: action.payload };
            return newState;
        case REMOVE_ONE_CAFE:
            newState = { ...state };
            delete newState[action.payload];
            return newState;
        case UPDATE_CAFE:
            return {
                ...state,
                [action.payload.id]: action.payload
            }
        default:
            return state;
    }
};

export default cafeReducer;