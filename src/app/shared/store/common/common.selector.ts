import { createSelector, createFeatureSelector } from "@ngrx/store";
import { CommonState } from "./common.states";

export const selectShopCode = createFeatureSelector<CommonState>("shopCode");

export const shopCode = createSelector(
  selectShopCode,
  (state: CommonState) => state.shopCode
);
