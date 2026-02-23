// Main.js
"use strict";

import { ContextMenuManager } from "./Manager/ContextMenuManager.js";
import { DesktopManager } from "./Manager/DesktopManager.js";
import { MessageBoxManager } from "./Manager/MessageBoxManager.js";
import { WindowManager } from "./Manager/WindowManager.js";
import { ImageErrorHandler } from "./Utils/ImageErrorHandler.js";

// 全局可用
window.MessageBoxManager = MessageBoxManager;
window.WindowManager = WindowManager;

$(document).ready(function () {
    DesktopManager.init();
    ContextMenuManager.init();

    // 设置图片错误处理
    ImageErrorHandler.init();
});