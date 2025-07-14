import { createSlice } from "@reduxjs/toolkit";

const connectionSlice = createSlice({
    name: "connections",
    initialState: [],
    reducers: {
        addConnections: (state, action) => {
            return action.payload || [];
        },
        removeConnections: () => [],
        removeConnection: (state, action) => {
            return state.filter(connection => connection._id !== action.payload);
        },
        addConnection: (state, action) => {
            if (!state.find(connection => connection._id === action.payload._id)) {
                state.push(action.payload);
            }
        }
    },
});

export const { addConnections, removeConnections, removeConnection, addConnection } = connectionSlice.actions;

export default connectionSlice.reducer; 

