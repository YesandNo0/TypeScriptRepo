"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.qs = qs;
function qs(sel, root = document) {
    return root.querySelector(sel);
}
