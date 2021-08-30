import { combineReducers, CombinedState } from 'redux';
import { annotationReducer } from './annotation/reducer';
import { imgAttributeReducer } from './imgAttribute/reducer';
import { toolStyleReducer } from './toolStyle/reducer';

export const rootReducer: CombinedState<any> = combineReducers({
  annotation: annotationReducer,
  imgAttribute: imgAttributeReducer,
  toolStyle: toolStyleReducer,
});

export type AppState = ReturnType<typeof rootReducer>;
