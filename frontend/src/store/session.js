// Phase 1: Login form page
// The Login Form Page is the first page that you will add to your frontend application.

// Session actions and reducer
// First, you will add the Redux store actions and reducers that you need for this feature.
//You will use the POST /api/session backend route to login in a user as well as add the session user's information to the frontend Redux store.

// This file will contain all the actions specific to the session user's information and the session user's Redux reducer.
import { csrfFetch } from './csrf';

const SET_USER = 'session/setUser';
const REMOVE_USER = 'session/removeUser';

const setUser = (user) => {
  return {
    type: SET_USER,
    payload: user,
  };
};

const removeUser = () => {
  return {
    type: REMOVE_USER,
  };
};





//Restore the session user -  retain the session user information across a refresh
export const restoreUser = () => async dispatch => {
  const response = await csrfFetch('/api/session')
  const data = await response.json();
  dispatch(setUser(data.user))
  return response;
}


//logout action
export const logout = () => async (dispatch) => {
  const response = await csrfFetch('/api/session', {
    method: 'DELETE',
  });
  dispatch(removeUser());
  return response;
};





//signup action
export const signup = (user) => async (dispatch) => {
  const {username,email,password} = user;
  const response = await csrfFetch('/api/users',{
    method:"POST",
    body: JSON.stringify({
      username,
      email,
      password,
    }),
  });
  const data = await response.json();
  dispatch(setUser(data.user))
  return response;
}




export const login = (user) => async (dispatch) => {
  const { credential, password } = user;
  const response = await csrfFetch('/api/session', {
    method: 'POST',
    body: JSON.stringify({
      credential,
      password,
    }),
  });
  const data = await response.json();
  //matches with backend session.js res.json({user})
  //console.log("THIS IS THE DATA", data)

  dispatch(setUser(data.user));
  return response;
};

const initialState = { user: null };

const sessionReducer = (state = initialState, action) => {
  let newState;
  switch (action.type) {
    case SET_USER:
      newState = Object.assign({}, state);
      //Object.assign same as spread operator here
      newState.user = action.payload;
      return newState;
    case REMOVE_USER:
      newState = Object.assign({}, state);
      newState.user = null;
      return newState;
    default:
      return state;
  }
};

export default sessionReducer;
