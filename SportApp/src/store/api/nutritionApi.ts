import { baseApi } from './baseApi';
import {
  Food,
  NutritionEntry,
  CreateNutritionEntryRequest,
  NutritionSummary,
  ApiResponse,
  PaginatedResponse,
  PaginationParams,
} from '../../types/api';

export const nutritionApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    // Food Database
    searchFoods: builder.query<
      PaginatedResponse<Food>,
      {
        q?: string;
        category?: string;
        barcode?: string;
      } & PaginationParams
    >({
      query: params => ({
        url: '/nutrition/foods/search',
        params,
      }),
      providesTags: ['Food'],
    }),

    getFood: builder.query<ApiResponse<Food>, number>({
      query: id => `/nutrition/foods/${id}`,
      providesTags: (result, error, id) => [{ type: 'Food', id }],
    }),

    getFoodByBarcode: builder.query<ApiResponse<Food>, string>({
      query: barcode => `/nutrition/foods/barcode/${barcode}`,
      providesTags: ['Food'],
    }),

    createCustomFood: builder.mutation<ApiResponse<Food>, Omit<Food, 'id'>>({
      query: data => ({
        url: '/nutrition/foods/custom',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Food'],
    }),

    // Nutrition Entries
    getNutritionEntries: builder.query<
      PaginatedResponse<NutritionEntry>,
      {
        date?: string;
        startDate?: string;
        endDate?: string;
        mealType?: string;
      } & PaginationParams
    >({
      query: params => ({
        url: '/nutrition/entries',
        params,
      }),
      providesTags: ['NutritionEntry'],
    }),

    getNutritionEntry: builder.query<ApiResponse<NutritionEntry>, number>({
      query: id => `/nutrition/entries/${id}`,
      providesTags: (result, error, id) => [{ type: 'NutritionEntry', id }],
    }),

    createNutritionEntry: builder.mutation<
      ApiResponse<NutritionEntry>,
      CreateNutritionEntryRequest
    >({
      query: data => ({
        url: '/nutrition/entries',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['NutritionEntry'],
    }),

    updateNutritionEntry: builder.mutation<
      ApiResponse<NutritionEntry>,
      {
        id: number;
        data: Partial<CreateNutritionEntryRequest>;
      }
    >({
      query: ({ id, data }) => ({
        url: `/nutrition/entries/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'NutritionEntry', id },
      ],
    }),

    deleteNutritionEntry: builder.mutation<ApiResponse<void>, number>({
      query: id => ({
        url: `/nutrition/entries/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'NutritionEntry', id }],
    }),

    // Daily Summary
    getDailySummary: builder.query<ApiResponse<NutritionSummary>, string>({
      query: date => `/nutrition/summary/daily/${date}`,
      providesTags: ['NutritionEntry'],
    }),

    getWeeklySummary: builder.query<
      ApiResponse<NutritionSummary[]>,
      {
        startDate: string;
        endDate: string;
      }
    >({
      query: params => ({
        url: '/nutrition/summary/weekly',
        params,
      }),
      providesTags: ['NutritionEntry'],
    }),

    getMonthlySummary: builder.query<
      ApiResponse<NutritionSummary[]>,
      {
        year: number;
        month: number;
      }
    >({
      query: params => ({
        url: '/nutrition/summary/monthly',
        params,
      }),
      providesTags: ['NutritionEntry'],
    }),

    // Meal Planning
    getMealPlan: builder.query<
      ApiResponse<{
        date: string;
        meals: {
          breakfast: NutritionEntry[];
          lunch: NutritionEntry[];
          dinner: NutritionEntry[];
          snacks: NutritionEntry[];
        };
        totals: NutritionSummary;
      }>,
      string
    >({
      query: date => `/nutrition/meal-plan/${date}`,
      providesTags: ['NutritionEntry'],
    }),

    // Nutrition Goals
    getNutritionGoals: builder.query<
      ApiResponse<{
        dailyCalories: number;
        dailyProtein: number;
        dailyCarbs: number;
        dailyFat: number;
        dailyFiber: number;
      }>,
      void
    >({
      query: () => '/nutrition/goals',
    }),

    updateNutritionGoals: builder.mutation<
      ApiResponse<void>,
      {
        dailyCalories?: number;
        dailyProtein?: number;
        dailyCarbs?: number;
        dailyFat?: number;
        dailyFiber?: number;
      }
    >({
      query: data => ({
        url: '/nutrition/goals',
        method: 'PUT',
        body: data,
      }),
    }),

    // Quick Add
    quickAddFood: builder.mutation<
      ApiResponse<NutritionEntry>,
      {
        name: string;
        calories: number;
        quantity_g: number;
        meal_type: string;
        entry_date?: string;
      }
    >({
      query: data => ({
        url: '/nutrition/quick-add',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['NutritionEntry'],
    }),

    // Recent Foods
    getRecentFoods: builder.query<ApiResponse<Food[]>, { limit?: number }>({
      query: params => ({
        url: '/nutrition/recent-foods',
        params,
      }),
      providesTags: ['Food'],
    }),

    // Favorite Foods
    getFavoriteFoods: builder.query<ApiResponse<Food[]>, void>({
      query: () => '/nutrition/favorite-foods',
      providesTags: ['Food'],
    }),

    addToFavorites: builder.mutation<ApiResponse<void>, number>({
      query: foodId => ({
        url: `/nutrition/favorite-foods/${foodId}`,
        method: 'POST',
      }),
      invalidatesTags: ['Food'],
    }),

    removeFromFavorites: builder.mutation<ApiResponse<void>, number>({
      query: foodId => ({
        url: `/nutrition/favorite-foods/${foodId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Food'],
    }),
  }),
});

export const {
  useSearchFoodsQuery,
  useGetFoodQuery,
  useGetFoodByBarcodeQuery,
  useCreateCustomFoodMutation,
  useGetNutritionEntriesQuery,
  useGetNutritionEntryQuery,
  useCreateNutritionEntryMutation,
  useUpdateNutritionEntryMutation,
  useDeleteNutritionEntryMutation,
  useGetDailySummaryQuery,
  useGetWeeklySummaryQuery,
  useGetMonthlySummaryQuery,
  useGetMealPlanQuery,
  useGetNutritionGoalsQuery,
  useUpdateNutritionGoalsMutation,
  useQuickAddFoodMutation,
  useGetRecentFoodsQuery,
  useGetFavoriteFoodsQuery,
  useAddToFavoritesMutation,
  useRemoveFromFavoritesMutation,
} = nutritionApi;
