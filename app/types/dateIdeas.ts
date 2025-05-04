export interface DateIdea {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  tags?: string[];
}

export interface FavoritesState {
  myFavorites: DateIdea[];
  partnerFavorites: DateIdea[];
  jointFavorites: DateIdea[];
}

export type FavoriteAction = 
  | { type: 'ADD_TO_MY_FAVORITES'; payload: DateIdea }
  | { type: 'ADD_TO_PARTNER_FAVORITES'; payload: DateIdea }
  | { type: 'REMOVE_FROM_MY_FAVORITES'; payload: string }
  | { type: 'REMOVE_FROM_PARTNER_FAVORITES'; payload: string }
  | { type: 'SYNC_PARTNER_FAVORITES'; payload: DateIdea[] }
  | { type: 'CALCULATE_JOINT_FAVORITES' }
  | { type: 'RESET_STATE'; payload: FavoritesState };

export const initialFavoritesState: FavoritesState = {
  myFavorites: [],
  partnerFavorites: [],
  jointFavorites: []
};

export const favoritesReducer = (state: FavoritesState, action: FavoriteAction): FavoritesState => {
  switch (action.type) {
    case 'ADD_TO_MY_FAVORITES':
      return {
        ...state,
        myFavorites: [...state.myFavorites, action.payload]
      };
    case 'ADD_TO_PARTNER_FAVORITES':
      return {
        ...state,
        partnerFavorites: [...state.partnerFavorites, action.payload]
      };
    case 'REMOVE_FROM_MY_FAVORITES':
      return {
        ...state,
        myFavorites: state.myFavorites.filter(item => item.id !== action.payload)
      };
    case 'REMOVE_FROM_PARTNER_FAVORITES':
      return {
        ...state,
        partnerFavorites: state.partnerFavorites.filter(item => item.id !== action.payload)
      };
    default:
      return state;
  }
};