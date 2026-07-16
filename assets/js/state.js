/**
 * state.js — Shared mutable application state
 * All modules read/write these globals directly (plain-script approach, no bundler).
 */

let C = null;
let lang = 'fr';
let activeCategory = 'all';
let _modalPrevFocus = null;
let _currentDishId = null;
let _cartPrevFocus = null;
let cart = [];
