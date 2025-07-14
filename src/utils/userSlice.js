import { createSlice } from "@reduxjs/toolkit";

const getInitialUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

const userSlice = createSlice({
    name: "user",
    initialState: getInitialUser(),
    reducers: {
        addUser: (state,action) =>{
          localStorage.setItem("user", JSON.stringify(action.payload));
          return action.payload;
        },
        removeUser: () => {
          localStorage.removeItem("user");
          return null;
        },
    },

});

export const { addUser, removeUser } = userSlice.actions;

export default userSlice.reducer;