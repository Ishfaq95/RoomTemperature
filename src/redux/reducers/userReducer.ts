import {createSlice} from '@reduxjs/toolkit';



interface State {
  token : any;

}

const initialState: State = {
  token : {},
};

export const userReducer = createSlice({
  name: 'user',
  initialState,
  reducers: {
   
    setToken : (state, action) => {
      console.log('UserPaylod setImage  ...     ',action.payload)
      state.token = action.payload;
    },
   
  },
});

export const {setToken} = userReducer.actions;

export default userReducer.reducer;





