import { CommonState } from "./common.states";

const initialState: CommonState = {
  shopCode: localStorage.getItem("shopcode"),
  isLoadCompleted: false,
};
export function commonReducer(state = initialState, action: any) {
  switch (action.type) {
    case "SET_SHOPCODE": {
      return {
        ...state,
        shopCode: action.payload,
      };
    }
    case "SET_LOADING_COMPLETED": {
      return {
        ...state,
        isLoadCompleted: action.payload,
      };
    }
    default: {
      return state;
    }
  }
}
