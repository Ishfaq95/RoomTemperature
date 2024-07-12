import {createSlice} from '@reduxjs/toolkit';



interface State {
  image : {};

}

const initialState: State = {
  image : {},
};

export const userReducer = createSlice({
  name: 'user',
  initialState,
  reducers: {
   
    setImage : (state, action) => {
      console.log('UserPaylod setImage  ...     ',action.payload)
      state.image = action.payload;
    },
   
  },
});

export const {setImage} = userReducer.actions;

export default userReducer.reducer;





