import { createAction, createSlice } from "@reduxjs/toolkit";
import { user } from "/src/assets/data.js";

const initialState = {
  user: (() => {
    try {
      if (typeof window !== 'undefined') {
        const userData = window.localStorage.getItem("user");
        return userData ? JSON.parse(userData) : user;
      }
      return user;
    } catch (error) {
      console.error("Error parsing user data from localStorage", error);
      return user;
    }
  })(),
  edit: false,
  createTree: false, // New state for toggling family tree creation
  createPerson: false,
  updatePerson: false,
  addPartner: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    login(state, action) {
      state.user = action.payload;
      localStorage.setItem("user", JSON.stringify(action.payload));
    },
    logout(state) {
      state.user = null;
      localStorage?.removeItem("user");
      localStorage?.removeItem("token");
      localStorage?.removeItem("id");
      localStorage?.removeItem("familyTreeId");
    },
    updateProfile(state, action) {
      state.edit = action.payload;
    },
    createFamilyTree(state, action) {
      state.createTree = action.payload; // Toggle createTree state
    },
    createPersons(state, action) {
      state.createPerson = action.payload;
    },
    updatePersons(state, action) {
      state.updatePerson = action.payload;
    },
    addPartners(state, action) {
      state.addPartner = action.payload;
    }
  },
});

export default userSlice.reducer;

export const { login, logout, updateProfile, createFamilyTree, createPersons, updatePersons, addPartners } = userSlice.actions;

export function AddPartner(val) {
  return (dispatch) => {
    dispatch(addPartners(val));
  };
}

export function UserLogin(user) {
  return (dispatch) => {
    dispatch(login(user));
  };
}

export function Logout() {
  return (dispatch) => {
    dispatch(logout());
  };
}

export function UpdateProfile(val) {
  return (dispatch) => {
    dispatch(updateProfile(val));
  };
}

export function CreateFamily(val) {
  return (dispatch) => {
    dispatch(createFamilyTree(val));
  };
}

export function CreatePerson(val) {
  return(dispatch) => {
    dispatch(createPersons(val));
  }
}

export function UpdatePerson(val) {
  return(dispatch) => {
    dispatch(updatePersons(val));
  }
}