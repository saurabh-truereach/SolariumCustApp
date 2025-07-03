/**
 * Typed Redux Hooks
 * Provides typed versions of useDispatch and useSelector
 */

import {TypedUseSelectorHook, useDispatch, useSelector} from 'react-redux';
import type {RootState, AppDispatch} from '../store';

/**
 * Typed useDispatch hook
 */
export const useAppDispatch = () => useDispatch<AppDispatch>();

/**
 * Typed useSelector hook
 */
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
