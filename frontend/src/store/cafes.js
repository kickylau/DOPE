import { csrfFetch } from "./csrf";
const ADD_CAFES = 'cafes/addCafes';
const ADD_ONE_CAFE = 'cafes/addOneCafe';
const REMOVE_ONE_CAFE = 'cafes/removeOneCafe';
const UPDATE_CAFE = "cafes/updateOneCafe";

const updateOneCafe = (payload) => {
    return {
        type: UPDATE_CAFE,
        payload
    }
}

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
    return {
        type: REMOVE_ONE_CAFE,
        payload: id };
};

export const getAllCafes = () => async (dispatch) => {
    const response = await csrfFetch('/api/cafes');
    if (response.ok) {
        const data = await response.json();
        dispatch(addCafes(data.cafe));
    }
};

export const addCafe = (cafe) => async (dispatch) => {
    const response = await csrfFetch('/api/cafes/new', {
        method: 'POST',
        //headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cafe)
    });

    if (response.ok) {
        const data = await response.json();
        //console.log('add', data);
        dispatch(addOneCafe(data));
        return response;
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
        dispatch(updateOneCafe(updatedCafe))
        return updatedCafe;
    }
}
        //return the updatedCafe,
        //your createOne variable in your handleSubmit will always be undefined
        //unless you return something in your updateCafe thunk

export const deleteCafe = (id) => async (dispatch) => {
    const response = await csrfFetch(`/api/cafes/${id}`, {
        method: 'DELETE'
    });

    if (response.ok) {
        //const data = await response.json()
        //console.log(data)
        dispatch(removeOneCafe(id));
    }
};



// export const deleteSpot = (id) => async (dispatch) => {
//   await csrfFetch(`/api/spots/${id}`, { method: 'DELETE' })
//   dispatch(updateSpotExistence());
// }

const cafeReducer = (state = {}, action) => {
    let newState = {};
    switch (action.type) {
        case ADD_CAFES:
            action.payload.forEach((cafe) => (newState[cafe.id] = cafe));
            return newState;
        case ADD_ONE_CAFE:
            newState = { ...state, [action.payload.id]: action.payload };
            return newState;
            // newState = Object.assign({},state)
            // newState.cafe = action.payload //normalizing data
            // return newState
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
